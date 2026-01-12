"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddWeighInForm() {
  const today = new Date().toISOString().slice(0, 10);
  const router = useRouter();

  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="border rounded-xl p-4 mb-6">
      <h2 className="font-semibold mb-3">Legg inn veiing</h2>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm mb-1">Dato</label>
          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Vekt (kg)</label>
          <input
            className="border rounded-lg px-3 py-2"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="f.eks 92.4"
          />
        </div>

        <button
          className="border rounded-lg px-4 py-2 font-medium"
          onClick={async () => {
            setMsg(null);
            const w = Number(weight.replace(",", "."));
            if (!date || !w || Number.isNaN(w)) {
              setMsg("Skriv inn gyldig dato og vekt.");
              return;
            }

            const res = await fetch("/api/weighins", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ date, weight: w }),
            });

            if (!res.ok) {
              const text = await res.text();
              setMsg(`Feil (${res.status}): ${text}`);
              return;
            }

            setWeight("");
            setMsg("Lagret ✅");
            router.refresh();
          }}
        >
          Lagre
        </button>

        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </div>
  );
}
