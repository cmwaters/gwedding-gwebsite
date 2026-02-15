"use client";

import { useState, useEffect } from "react";

type TabId = "to_be_invited" | "pending" | "coming" | "not_coming";

interface GuestRow {
  id: string;
  invite_code: string;
  name: string;
  email: string;
  plus_ones: string;
  comments: string;
  invite_received: boolean;
  is_attending: boolean | null;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "to_be_invited", label: "To Be Invited" },
  { id: "pending", label: "Pending Reply" },
  { id: "coming", label: "Coming" },
  { id: "not_coming", label: "Not Coming" },
];

function filterByTab(guests: GuestRow[], tab: TabId): GuestRow[] {
  switch (tab) {
    case "to_be_invited":
      return guests.filter((g) => !g.invite_received);
    case "pending":
      return guests.filter((g) => g.invite_received && g.is_attending === null);
    case "coming":
      return guests.filter((g) => g.is_attending === true);
    case "not_coming":
      return guests.filter((g) => g.is_attending === false);
    default:
      return guests;
  }
}

function MarkAsInvitedButton({
  guestId,
  onSuccess,
}: {
  guestId: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/guests/${guestId}`, {
        method: "PATCH",
      });
      if (res.ok) onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-[10px] px-2 py-1 border border-amber text-amber hover:bg-amber hover:text-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "..." : "Invited"}
    </button>
  );
}

function CopyableCell({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = value || "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback ignored for brevity
    }
  };

  return (
    <td
      onClick={handleCopy}
      className={`relative px-3 py-2 border border-cream/30 text-left cursor-pointer hover:bg-charcoal-light transition-colors select-none min-w-[80px] max-w-[200px] truncate ${className}`}
      title={value ? "Click to copy" : ""}
    >
      <span className="block truncate" title={value}>
        {value || "—"}
      </span>
      {copied && (
        <span className="absolute top-0 right-1 text-[10px] text-amber animate-fade-in">
          Copied!
        </span>
      )}
    </td>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [tab, setTab] = useState<TabId>("to_be_invited");
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const res = await fetch("/api/admin/guests");
    if (res.ok) {
      const data = await res.json();
      setGuests(data);
      setAuthed(true);
    } else {
      setAuthed(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const data = await fetch("/api/admin/guests");
      if (data.ok) {
        setGuests(await data.json());
        setAuthed(true);
      }
    } else {
      setLoginError("Invalid password");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal text-cream flex items-center justify-center">
        <p className="text-amber text-sm">Loading...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-charcoal text-cream flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="text-amber text-base sm:text-lg mb-4 text-center">
            Admin Login
          </h1>
          <div>
            <label className="block text-xs text-amber mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="retro-input"
              placeholder="Enter password"
              autoFocus
            />
          </div>
          {loginError && (
            <p className="text-coral text-xs">{loginError}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 border-2 border-amber bg-transparent text-cream hover:bg-amber hover:text-charcoal transition-colors text-xs"
          >
            Log in
          </button>
        </form>
      </div>
    );
  }

  const filtered = filterByTab(guests, tab);

  return (
    <div className="h-screen bg-charcoal text-cream p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <h1 className="text-amber text-base sm:text-lg mb-4">Invitees</h1>

      <div className="flex gap-2 mb-4 border-b border-cream/30 pb-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`
              text-xs px-4 py-2 border-2 whitespace-nowrap transition-colors
              ${
                tab === t.id
                  ? "bg-amber text-charcoal border-amber"
                  : "border-cream/50 text-cream hover:bg-cream/10"
              }
            `}
          >
            {t.label} ({filterByTab(guests, t.id).length})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-cream/60 text-xs py-6 text-center">
            No invitees in this tab
          </p>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="text-amber border-b border-cream/50">
                <th className="px-3 py-2 text-left border border-cream/30">invite_code</th>
                <th className="px-3 py-2 text-left border border-cream/30">name</th>
                <th className="px-3 py-2 text-left border border-cream/30">email</th>
                <th className="px-3 py-2 text-left border border-cream/30">plus_ones</th>
                <th className="px-3 py-2 text-left border border-cream/30">comments</th>
                {tab === "to_be_invited" && (
                  <th className="px-3 py-2 text-left border border-cream/30 w-[120px]">
                    action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="relative">
                  <CopyableCell value={row.invite_code} />
                  <CopyableCell value={row.name} />
                  <CopyableCell value={row.email} />
                  <CopyableCell value={row.plus_ones} />
                  <CopyableCell value={row.comments} className="max-w-[240px]" />
                  {tab === "to_be_invited" && (
                    <td className="px-3 py-2 border border-cream/30 align-middle">
                      <MarkAsInvitedButton
                        guestId={row.id}
                        onSuccess={() => checkAuth()}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
