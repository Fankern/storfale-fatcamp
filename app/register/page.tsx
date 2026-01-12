"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm border rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-4">Registrer</h1>

        <label className="block text-sm mb-1">Brukernavn</label>
        <input className="w-full border rounded-lg px-3 py-2 mb-3" value={username} onChange={(e) => setUsername(e.target.value)} />

        <label className="block text-sm mb-1">Navn</label>
        <input className="w-full border rounded-lg px-3 py-2 mb-3" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

        <label className="block text-sm mb-1">Passord</label>
        <input type="password" className="w-full border rounded-lg px-3 py-2 mb-3" value={password} onChange={(e) => setPassword(e.target.value)} />

        <label className="block text-sm mb-1">Målvekt (valgfritt)</label>
        <input className="w-full border rounded-lg px-3 py-2 mb-4" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} placeholder="f.eks 85" />

        {msg && <p className="text-sm mb-3">{msg}</p>}

        <button
          className="w-full border rounded-lg py-2 font-medium"
          onClick={async () => {
  setMsg(null);

  const gw = goalWeight.trim();
  const goal = gw ? Number(gw) : undefined;

  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.trim(),
      displayName: displayName.trim(),
      password,
      ...(goal && !Number.isNaN(goal) ? { goalWeight: goal } : {}),
    }),
  });

  const text = await res.text();
let data: any = null;
try {
  data = text ? JSON.parse(text) : null;
} catch {
  // ikke json
}

if (!res.ok) {
  return setMsg(data?.error ?? `Server-feil (${res.status}). Sjekk terminalen.`);
}

  setMsg("Registrert! Gå til /login og logg inn.");
}}

        >
          Opprett bruker
        </button>

        <p className="text-sm mt-4">
          Har du bruker? <a className="underline" href="/login">Logg inn</a>
        </p>
      </div>
    </div>
  );
}
