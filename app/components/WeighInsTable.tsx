"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y.slice(2)}`;
}

type WeighIn = { id: string; date: string; weight: number };

export default function WeighInsTable({
  weighIns,
  canEdit,
}: {
  weighIns: WeighIn[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [weight, setWeight] = useState("");

  return (
    <table className="w-full border">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2">Dato</th>
          <th className="text-left p-2">Vekt</th>
          {canEdit && <th className="text-left p-2">Handling</th>}
        </tr>
      </thead>
      <tbody>
        {weighIns.map((w) => (
          <tr key={w.id} className="border-b">
            <td className="p-2">
              {editingId === w.id ? (
                <input
                  type="date"
                  className="border rounded-lg px-2 py-1"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              ) : (
               formatDate(w.date)
              )}
            </td>
            <td className="p-2">
              {editingId === w.id ? (
                <input
                  className="border rounded-lg px-2 py-1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              ) : (
                w.weight
              )}
            </td>

            {canEdit && (
              <td className="p-2">
                {editingId === w.id ? (
                  <div className="flex gap-2">
                    <button
                      className="border rounded-lg px-3 py-1"
                      onClick={async () => {
                        const ww = Number(weight.replace(",", "."));
                        if (!date || !ww || Number.isNaN(ww)) return;

                        await fetch(`/api/weighins/${w.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ date, weight: ww }),
                        });

                        setEditingId(null);
                        router.refresh();
                      }}
                    >
                      Lagre
                    </button>
                    <button
                      className="border rounded-lg px-3 py-1"
                      onClick={() => setEditingId(null)}
                    >
                      Avbryt
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      className="border rounded-lg px-3 py-1"
                      onClick={() => {
                        setEditingId(w.id);
                        setDate(w.date);
                        setWeight(String(w.weight));
                      }}
                    >
                      Rediger
                    </button>
                    <button
                      className="border rounded-lg px-3 py-1"
                      onClick={async () => {
                        if (!confirm("Slette denne veiingen?")) return;
                        await fetch(`/api/weighins/${w.id}`, { method: "DELETE" });
                        router.refresh();
                      }}
                    >
                      Slett
                    </button>
                  </div>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
