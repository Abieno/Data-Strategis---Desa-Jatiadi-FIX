create policy "public_read_portal_buckets"
on storage.objects for select to anon, authenticated
using (bucket_id in ('rtlh-photos','publikasi','berita'));