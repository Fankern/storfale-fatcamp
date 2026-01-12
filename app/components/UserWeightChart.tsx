"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const outlinedText = {
  color: "inherit",
  textShadow:
    "1px 1px 0 #fff, -1px 1px 0 #fff, 1px -1px 0 #fff, -1px -1px 0 #fff, 0 0 3px #fff",
};

const tooltipStyle = {
  backgroundColor: "#0b0b0b",
  border: "1px solid #333",
  borderRadius: "8px",
  color: "white",
  boxShadow: "0 10px 25px rgba(0,0,0,0.7)",
};

type Point = { date: string; weight: number };

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y.slice(2)}`;
}

export default function UserWeightChart({
  points,
  goalWeight,
}: {
  points: Point[];
  goalWeight?: number | null;
}) {
  if (!points.length) return <p>Ingen veiinger enda.</p>;

  return (
    <div className="border rounded-xl p-4">
      <h2 className="font-semibold mb-3">Vekt over tid</h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip
  contentStyle={tooltipStyle}
  labelStyle={{ color: "white", textShadow: "0 0 2px black" }}
  itemStyle={{ color: "white", textShadow: "0 0 2px black" }}
  labelFormatter={(l) => formatDate(l as string)}
  formatter={(value: any) => [`${value} kg`, "Vekt"]}
/>

            {goalWeight != null && (
  <ReferenceLine y={goalWeight} strokeDasharray="6 6" label="Mål" />
            )}
            <Line type="monotone" dataKey="weight" name="Vekt" dot />

          </LineChart>
        </ResponsiveContainer>
      </div>

      {goalWeight != null && (
        <p className="text-sm mt-2">Mål: {goalWeight} kg</p>
      )}
    </div>
  );
}
