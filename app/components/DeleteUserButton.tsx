"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteUserButton({
  userId,
  label = "Slett bruker",
  redirectTo = "/",
}: {
  userId: string;
  label?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <button
        className="border rounded-lg px-4 py-2 font-medium"
        disabled={busy}
        onClick={async () => {
          setMsg(null);
          const ok = confirm(
            "Er du sikker? Dette sletter brukeren og ALL data (veiinger, mål osv.)."
          );
          if (!ok) return;

          setBusy(true);
          try {
            const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
            if (!res.ok) {
              const text = await res.text();
              setMsg(`Feil (${res.status}): ${text}`);
              return;
            }

            router.push(redirectTo);
            router.refresh();
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Sletter..." : label}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
