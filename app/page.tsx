import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AddWeighInForm from "@/app/components/AddWeighInForm";
import GroupWeightChart from "@/app/components/GroupWeightChart";

function AddWeighIn() {
  return (
    <form
      className="border rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end"
      action={async (formData) => {
        "use server";
        // Server Actions er litt ekstra nå; vi gjør det enklere med client-komponent under.
      }}
    />
  );
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="border rounded-xl p-6 max-w-md w-full">
          <h1 className="text-xl font-semibold mb-2">Storfale Fatcamp</h1>
          <p className="mb-4">Logg inn for å se fremgangen.</p>
          <div className="flex gap-3">
            <Link className="underline" href="/login">Logg inn</Link>
            <Link className="underline" href="/register">Registrer</Link>
          </div>
        </div>
      </main>
    );
  }

 const users = await prisma.user.findMany({
  select: {
    id: true,
    username: true,
    displayName: true,
    goalWeight: true,
    weighIns: { select: { date: true, weight: true }, orderBy: { date: "asc" } },
  },
});

const palette = [
  "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7",
  "#06b6d4", "#f97316", "#84cc16", "#14b8a6", "#e11d48",
];

const series = users.map((u, i) => ({
  key: u.username,
  name: u.displayName,
  color: palette[i % palette.length],
}));

// Samle alle datoer på tvers av alle brukere
const dateSet = new Set<string>();
for (const u of users) {
  for (const w of u.weighIns) {
    dateSet.add(w.date.toISOString().slice(0, 10));
  }
}
const dates = Array.from(dateSet).sort();

// Bygg datasett: [{date, [username]: weight}, ...]
const groupData = dates.map((d) => {
  const row: Record<string, any> = { date: d };
  for (const u of users) {
    const match = u.weighIns.find((w) => w.date.toISOString().slice(0, 10) === d);
    if (match) row[u.username] = match.weight;
  }
  return row;
});

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-6">Storfale Fatcamp</h1>

      <AddWeighInForm />

      <GroupWeightChart data={groupData} series={series} />

      <table className="w-full border">

        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Navn</th>
            <th className="text-left p-2">Start</th>
            <th className="text-left p-2">Nå</th>
            <th className="text-left p-2">Mål</th>
            <th className="text-left p-2">Igjen</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const w = u.weighIns;
            const start = w.length ? w[0].weight : null;
            const last = w.length ? w[w.length - 1].weight : null;
            const remaining =
              last != null && u.goalWeight != null
                ? (last - u.goalWeight).toFixed(1)
                : "-";

            return (
              <tr key={u.id} className="border-b">
                <td className="p-2">
                <Link className="underline" href={`/user/${u.username}`}>
                 {u.displayName}
                </Link>
                </td>

                <td className="p-2">{start ?? "-"}</td>
                <td className="p-2">{last ?? "-"}</td>
                <td className="p-2">{u.goalWeight ?? "-"}</td>
                <td className="p-2">{remaining}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
