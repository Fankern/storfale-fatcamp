"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const outlinedText = {
  fontWeight: 700,
  textShadow:
    "1px 0 #fff, -1px 0 #fff, 0 1px #fff, 0 -1px #fff",
};

const tooltipBoxStyle: React.CSSProperties = {
  backgroundColor: "#0b0b0b",
  border: "1px solid #333",
  borderRadius: 10,
  padding: "10px 12px",
};

function CustomGroupTooltip({
  active,
  payload,
  label,
  series,
  formatDate,
}: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div style={tooltipBoxStyle}>
      <div style={{ color: "white", fontWeight: 800, marginBottom: 8 }}>
        {formatDate(label)}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {payload
          .filter((p: any) => p.value != null)
          .map((p: any) => {
            const s = series.find((x: any) => x.key === p.dataKey);
            const name = s?.name ?? p.dataKey;
            const color = s?.color ?? "white";

            return (
              <div
                key={p.dataKey}
                style={{ display: "flex", justifyContent: "space-between", gap: 14 }}
              >
                <span style={strokeStyle(color)}>{name}</span>
                <span style={strokeStyle(color)}>{p.value} kg</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function strokeStyle(color: string): React.CSSProperties {
  return {
    color,
    fontWeight: 900,
    WebkitTextStroke: "1px #fff",      // ekte hvit outline
    paintOrder: "stroke fill",         // (har effekt i noen nettlesere)
    textShadow: "1px 0 #fff, -1px 0 #fff, 0 1px #fff, 0 -1px #fff", // fallback
  } as React.CSSProperties;
}

const tooltipStyle = {
  backgroundColor: "#0b0b0b",
  border: "1px solid #333",
  borderRadius: "8px",
  color: "white",
  boxShadow: "0 10px 25px rgba(0,0,0,0.7)",
};

type Series = {
  key: string;        // f.eks. username
  name: string;       // displayName
  color: string;
};

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y.slice(2)}`;
}

export default function GroupWeightChart({
  data,
  series,
}: {
  data: Array<Record<string, any>>; // { date: "YYYY-MM-DD", [username]: number }
  series: Series[];
}) {
  if (!data.length || !series.length) {
    return (
      <div className="border rounded-xl p-4 mb-6">
        <h2 className="font-semibold mb-2">Gruppegraf</h2>
        <p>Ingen veiinger enda.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-xl p-4 mb-6">
      <h2 className="font-semibold mb-3">Gruppegraf</h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip
  content={(props) => (
    <CustomGroupTooltip {...props} series={series} formatDate={formatDate} />
  )}
/>


            <Legend />

            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                dot={false}
                stroke={s.color}
                strokeWidth={2}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm mt-2">
        Tips: Hold over grafen for å se navn + vekt.
      </p>
    </div>
  );
}
