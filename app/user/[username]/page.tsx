import { prisma } from "@/lib/prisma";
import Link from "next/link";
import UserWeightChart from "@/app/components/UserWeightChart";
import GoalEditor from "@/app/components/GoalEditor";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import WeighInsTable from "@/app/components/WeighInsTable";
import DeleteUserButton from "@/app/components/DeleteUserButton";

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function formatSignedKg(n: number) {
  const v = Number(n.toFixed(1));
  const sign = v > 0 ? "+" : "";
  return `${sign}${v} kg`;
}

function deltaClass(delta: number) {
  if (delta < 0) return "text-green-600";
  if (delta > 0) return "text-red-600";
  return "text-neutral-700";
}
function lastWeighInText(days: number | null) {
  if (days == null) return "-";
  if (days <= 0) return "i dag";
  if (days === 1) return "i går";
  return `for ${days} dager siden`;
}

function lastWeighInBoxClass(days: number | null) {
  if (days == null) return "border";
  if (days > 7) return "border-yellow-500 bg-yellow-500";
  return "border";
}

/**
 * Endring over periode: (siste - anchor).
 * Hvis ingen måling finnes så langt tilbake, bruk de to siste målingene.
 * Hvis < 2 veiinger -> null.
 */
function deltaOverPeriodOrLastTwo(
  weighInsAsc: { date: Date; weight: number }[],
  days: number
) {
  if (weighInsAsc.length < 2) return null;

  const last = weighInsAsc[weighInsAsc.length - 1];

  const cutoff = new Date(last.date);
  cutoff.setDate(cutoff.getDate() - days);

  // Finn ALLE veiinger innenfor perioden (>= cutoff)
  const inWindow = weighInsAsc.filter((w) => w.date >= cutoff);

  // Hvis vi har minst 2 innenfor perioden:
  // bruk første i perioden som "startpunkt"
  if (inWindow.length >= 2) {
    const anchor = inWindow[0];
    return last.weight - anchor.weight;
  }

  // Hvis vi har 0 eller 1 innenfor perioden:
  // fallback: bruk de to siste veiingene
  const prev = weighInsAsc[weighInsAsc.length - 2];
  return last.weight - prev.weight;
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { weighIns: { orderBy: { date: "asc" } } },
  });

  if (!user) {
    return (
      <main className="min-h-screen p-6">
        <p>Fant ikke brukeren.</p>
        <Link className="underline" href="/">
          Tilbake
        </Link>
      </main>
    );
  }

  const session = await getServerSession(authOptions);
  const myId = (session?.user as any)?.id as string | undefined;
  const isMe = !!myId && myId === user.id;
  const adminUsername = process.env.ADMIN_USERNAME;
  const isAdmin = !!adminUsername && (session?.user as any)?.username === adminUsername;

  const weighInsAsc = user.weighIns;

  const startWeight = weighInsAsc.length ? weighInsAsc[0].weight : null;
  const lastWeight = weighInsAsc.length ? weighInsAsc[weighInsAsc.length - 1].weight : null;

  const deltaTotal =
    startWeight != null && lastWeight != null
      ? Number((lastWeight - startWeight).toFixed(1))
      : null;

  const remaining =
    user.goalWeight != null && lastWeight != null
      ? Number((lastWeight - user.goalWeight).toFixed(1))
      : null;

  const delta7 = deltaOverPeriodOrLastTwo(weighInsAsc, 7);
  const delta30 = deltaOverPeriodOrLastTwo(weighInsAsc, 30);

  const lastWeighInDate = weighInsAsc.length ? weighInsAsc[weighInsAsc.length - 1].date : null;
  const daysSinceLast = lastWeighInDate ? daysBetween(lastWeighInDate, new Date()) : null;

  const points = weighInsAsc.map((w) => ({
    date: w.date.toISOString().slice(0, 10),
    weight: w.weight,
  }));

  const weighInsForTable = weighInsAsc
    .slice()
    .reverse()
    .map((w) => ({
      id: w.id,
      date: w.date.toISOString().slice(0, 10),
      weight: w.weight,
    }));

  return (
    <main className="min-h-screen p-6">
      <div className="mb-6">
        <Link className="underline" href="/">
          ← Tilbake
        </Link>

        <h1 className="text-2xl font-semibold mt-2">{user.displayName}</h1>

        <div className="mt-4 border rounded-2xl p-4">
          <div className="flex flex-wrap gap-3 text-base">
            <div className="px-3 py-2 rounded-xl border">
              <span className="opacity-70">Nå</span>{" "}
              <span className="text-xl font-semibold">
                {lastWeight != null ? `${lastWeight} kg` : "-"}
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl border">
              <span className="opacity-70">Endring totalt</span>{" "}
              <span
                className={`text-xl font-semibold ${
                  deltaTotal != null ? deltaClass(deltaTotal) : ""
                }`}
              >
                {deltaTotal != null ? formatSignedKg(deltaTotal) : "-"}
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl border">
              <span className="opacity-70">Siste 7 dager</span>{" "}
              <span
                className={`text-xl font-semibold ${
                  delta7 != null ? deltaClass(delta7) : ""
                }`}
              >
                {delta7 != null ? formatSignedKg(delta7) : "-"}
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl border">
              <span className="opacity-70">Siste 30 dager</span>{" "}
              <span
                className={`text-xl font-semibold ${
                  delta30 != null ? deltaClass(delta30) : ""
                }`}
              >
                {delta30 != null ? formatSignedKg(delta30) : "-"}
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl border">
              <span className="opacity-70">Igjen til mål</span>{" "}
              <span className="text-xl font-semibold">
                {remaining != null ? `${Number(remaining.toFixed(1))} kg` : "-"}
              </span>
            </div>

            <div className={`px-3 py-2 rounded-xl border ${lastWeighInBoxClass(daysSinceLast)}`}>
                <span className="opacity-70">Sist veiing</span>{" "}
                <span className="text-xl font-semibold">
                 {lastWeighInText(daysSinceLast)}
                </span>
            </div>


          </div>
        </div>
      </div>

      <UserWeightChart points={points} goalWeight={user.goalWeight} />

      {isMe && <GoalEditor currentGoal={user.goalWeight} />}

      <div className="border rounded-xl p-4 mt-6">
        <h2 className="font-semibold mb-3">Veiinger</h2>


        {weighInsAsc.length === 0 ? (
          <p>Ingen veiinger enda.</p>
        ) : (
          <WeighInsTable weighIns={weighInsForTable} canEdit={isMe} />
        )}
      </div>
     
      {(isMe || isAdmin) && (
  <div className="border rounded-xl p-4 mt-6">
    <h2 className="font-semibold mb-2">Konto</h2>
    <p className="text-sm opacity-70 mb-3">
      Dette sletter brukeren og alle veiinger permanent.
    </p>

    <DeleteUserButton
      userId={user.id}
      label={isMe ? "Slett min bruker" : "Slett denne brukeren"}
      redirectTo="/"
    />
  </div>
)}
    </main>
  );
}
