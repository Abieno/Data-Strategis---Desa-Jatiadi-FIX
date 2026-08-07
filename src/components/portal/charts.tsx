import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { nf } from "@/lib/format";

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

const tooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    fontSize: "12px",
    color: "var(--popover-foreground)",
  },
  formatter: (v: number | string) => (typeof v === "number" ? nf.format(v) : v),
} as const;

const axis = { tick: { fontSize: 11, fill: "var(--muted-foreground)" }, tickLine: false, axisLine: false } as const;

type Datum = Record<string, string | number>;

export function BarsChart({
  data,
  xKey,
  series,
  height = 320,
  stacked,
  horizontal,
}: {
  data: Datum[];
  xKey: string;
  series: { key: string; label: string; color?: string }[];
  height?: number;
  stacked?: boolean;
  horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" {...axis} />
            <YAxis type="category" dataKey={xKey} width={150} {...axis} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} {...axis} interval={0} angle={data.length > 8 ? -35 : 0} textAnchor={data.length > 8 ? "end" : "middle"} height={data.length > 8 ? 60 : 30} />
            <YAxis {...axis} />
          </>
        )}
        <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} {...tooltipStyle} />
        {series.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
        {series.map((s, i) => (
          <Bar
            dataKey="value"
            fill="#ea802a"
            radius={[0, 6, 6, 0]}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            <LabelList
              dataKey="value"
              position="right"
            />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BarsChartsolo({
  data,
  xKey,
  height = 340,
}: {
  data: Datum[];
  xKey: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 10,
          right: 50,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        {/* Nilai */}
        <XAxis type="number" hide />

        {/* Nama kategori */}
        <YAxis
          type="category"
          dataKey={xKey}
          hide
        />

        {/* Tooltip */}
        <Tooltip
          formatter={(value: number, _name, props) => [
            `${value} jiwa (${props.payload.percentage}%)`,
            
          ]}
        />

        <Bar
          dataKey="value"
          radius={[0, 8, 8, 0]}
          animationDuration={900}
          animationEasing="ease-out"
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BarsChartsolobawah({
  data,
  xKey,
  height = 340,
}: {
  data: Datum[];
  xKey: string;
  height?: number;
}) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="horizontal"
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          {/* Nilai */}
          <YAxis
            type="number"
            hide
          />

          {/* Nama kategori */}
          <XAxis
            type="category"
            dataKey={xKey}
            hide
          />

          {/* Tooltip */}
          <Tooltip
            formatter={(value: number, _name, props) => [
              `${value} jiwa (${props.payload.percentage}%)`,
            ]}
          />

          <Bar
            dataKey="value"
            radius={[8, 8, 0, 0]}
            animationDuration={900}
            animationEasing="ease-out"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Keterangan di bawah grafik */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-3">
        {data.map((item, index) => {
          const label = String(item[xKey] ?? "");

          return (
            <div
              key={`${label}-${index}`}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{
                  backgroundColor:
                    CHART_COLORS[index % CHART_COLORS.length],
                }}
              />

              <span className="text-muted-foreground">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DonutChart({
  data,
  nameKey = "name",
  valueKey = "value",
  height = 320,
}: {
  data: Datum[];
  nameKey?: string;
  valueKey?: string;
  percentage?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius="55%" outerRadius="82%" paddingAngle={2} stroke="var(--card)" strokeWidth={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, _name, props) => {
            const p = props.payload;

            return [
              `${value} jiwa (${p.percentage}%)`,
              p.name,
            ];
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({
  data,
  xKey,
  series,
  height = 300,
}: {
  data: Datum[];
  xKey: string;
  series: { key: string; label: string; color?: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={xKey} {...axis} />
        <YAxis {...axis} />
        <Tooltip {...tooltipStyle} />
        {series.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
