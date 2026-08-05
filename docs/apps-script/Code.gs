/**
 * Portal Data Strategis Desa Jatiadi
 * Sinkronisasi Google Spreadsheet -> Database (near real-time)
 *
 * CARA PASANG
 * 1. Buka Spreadsheet input data -> Extensions -> Apps Script.
 * 2. Copy seluruh isi file ini ke Code.gs.
 * 3. Menu Project Settings -> Script properties, tambahkan:
 *      SYNC_URL    = https://<domain-website>/api/public/sync/sheet
 *      SYNC_SECRET = <nilai rahasia yang sama dengan SHEET_SYNC_SECRET di website>
 * 4. Jalankan fungsi installTriggers() satu kali (izinkan permission).
 *    Fungsi ini memasang:
 *      - installable trigger onEdit  -> sinkron per baris yang diubah (1-3 detik)
 *      - trigger terjadwal 30 menit  -> fallback jika onEdit gagal
 *
 * Aturan sheet: nama sheet = nama tabel, baris 1 = header snake_case.
 * Sheet per-RT memakai kolom nomor_rw dan nomor_rt (bukan rt_id).
 */

var SHEETS = [
  'desa_profil', 'dusun', 'rt', 'kependudukan_per_rt', 'karakteristik_keluarga',
  'penduduk_disabilitas', 'pendidikan_sekolah', 'kesehatan_fasilitas', 'kesehatan_tenaga',
  'bencana_alam', 'gizi_balita', 'ekonomi_fasilitas', 'umkm_per_rt', 'umkm_lapangan_usaha',
  'umkm_karakteristik_pengusaha', 'umkm_pendidikan_pengusaha', 'rtlh',
  'metadata_indikator', 'publikasi', 'berita', 'map_layers'
];

function installTriggers() {
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    ScriptApp.deleteTrigger(existing[i]);
  }
  var ss = SpreadsheetApp.getActive();
  ScriptApp.newTrigger('onSheetEdit').forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger('syncAllSheets').timeBased().everyMinutes(30).create();
}

/** Event-driven: hanya baris yang diubah yang dikirim. */
function onSheetEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  var name = sheet.getName();
  if (SHEETS.indexOf(name) === -1) return;

  var firstRow = Math.max(2, e.range.getRow());
  var lastRow = e.range.getLastRow();
  if (lastRow < 2) return;

  var rows = readRows(sheet, firstRow, lastRow - firstRow + 1);
  if (rows.length === 0) return;
  postRows(name, rows, 'onEdit');
}

/** Fallback terjadwal: kirim ulang seluruh isi tiap sheet tiap 30 menit. */
function syncAllSheets() {
  var ss = SpreadsheetApp.getActive();
  for (var i = 0; i < SHEETS.length; i++) {
    var sheet = ss.getSheetByName(SHEETS[i]);
    if (!sheet) continue;
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) continue;
    var rows = readRows(sheet, 2, lastRow - 1);
    if (rows.length > 0) postRows(SHEETS[i], rows, 'scheduled');
  }
}

function readRows(sheet, startRow, numRows) {
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var values = sheet.getRange(startRow, 1, numRows, lastCol).getValues();
  var rows = [];

  for (var r = 0; r < values.length; r++) {
    var row = { _row: startRow + r };
    var hasValue = false;
    for (var c = 0; c < headers.length; c++) {
      var key = String(headers[c]).trim();
      if (!key) continue;
      var value = values[r][c];
      if (value instanceof Date) value = Utilities.formatDate(value, 'Asia/Jakarta', 'yyyy-MM-dd');
      if (value !== '' && value !== null) hasValue = true;
      row[key] = value === '' ? null : value;
    }
    if (hasValue) rows.push(row);
  }
  return rows;
}

function postRows(sheetName, rows, mode) {
  var props = PropertiesService.getScriptProperties();
  var url = props.getProperty('SYNC_URL');
  var secret = props.getProperty('SYNC_SECRET');
  if (!url || !secret) throw new Error('SYNC_URL / SYNC_SECRET belum diisi di Script properties');

  // Kirim per batch 200 baris agar aman dari batas ukuran request.
  for (var i = 0; i < rows.length; i += 200) {
    var batch = rows.slice(i, i + 200);
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-sync-secret': secret },
      payload: JSON.stringify({ sheet: sheetName, rows: batch, mode: mode }),
      muteHttpExceptions: true
    });
    if (response.getResponseCode() >= 300) {
      console.error('Sync gagal (' + sheetName + '): ' + response.getContentText());
    }
  }
}
