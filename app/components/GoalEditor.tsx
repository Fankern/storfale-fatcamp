"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GoalEditor({ currentGoal }: { currentGoal?: number | null }) {
  const router = useRouter();
  const [goal, setGoal] = useState(currentGoal?.toString() ?? "");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="border rounded-xl p-4 mt-4">
      <h2 className="font-semibold mb-3">Mål</h2>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm mb-1">Målvekt (kg)</label>
          <input
            className="border rounded-lg px-3 py-2"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="f.eks 85"
          />
        </div>

        <button
          className="border rounded-lg px-4 py-2 font-medium"
          onClick={async () => {
            setMsg(null);
            const t = goal.trim();
            const num = t ? Number(t.replace(",", ".")) : null;
            if (t && (!num || Number.isNaN(num))) {
              setMsg("Skriv inn en gyldig vekt (eller tøm feltet for å fjerne mål).");
              return;
            }

            const res = await fetch("/api/me/goal", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ goalWeight: num }),
            });

            if (!res.ok) {
              setMsg(`Feil (${res.status})`);
              return;
            }

            setMsg("Lagret ✅");
            router.refresh();
          }}
        >
          Sett/endre mål
        </button>

        <button
          className="border rounded-lg px-4 py-2"
          onClick={async () => {
            setMsg(null);
            const res = await fetch("/api/me/goal", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ goalWeight: null }),
            });
            if (!res.ok) return setMsg(`Feil (${res.status})`);
            setGoal("");
            setMsg("Mål fjernet ✅");
            router.refresh();
          }}
        >
          Fjern mål
        </button>

        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </div>
  );
}
