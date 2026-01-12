"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm border rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-4">Logg inn</h1>

        <label className="block text-sm mb-1">Brukernavn</label>
        <input
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="block text-sm mb-1">Passord</label>
        <input
          type="password"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm mb-3">{error}</p>}

        <button
          className="w-full border rounded-lg py-2 font-medium"
          onClick={async () => {
            setError(null);
            const res = await signIn("credentials", {
              username,
              password,
              redirect: true,
              callbackUrl: "/",
            });
            if ((res as any)?.error) setError("Feil brukernavn eller passord");
          }}
        >
          Logg inn
        </button>

        <p className="text-sm mt-4">
          Har du ikke bruker? <a className="underline" href="/register">Registrer</a>
        </p>
      </div>
    </div>
  );
}
