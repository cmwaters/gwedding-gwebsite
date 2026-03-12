"use client";

import { useState, useEffect } from "react";

type TabId = "to_be_invited" | "pending" | "coming" | "not_coming";

interface GuestRow {
  id: string;
  invite_code: string;
  name: string;
  email: string;
  comments: string;
  invite_received: boolean;
  is_attending: boolean | null;
  offered_hotel: boolean;
  accepted_hotel: boolean | null;
  rsvp_by: string | null;
}

interface HotelStats {
  offered: number;
  accepted: number;
  declined: number;
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

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [hotelStats, setHotelStats] = useState<HotelStats>({ offered: 0, accepted: 0, declined: 0 });
  const [tab, setTab] = useState<TabId>("to_be_invited");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [getLinkCopied, setGetLinkCopied] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const checkAuth = async () => {
    const res = await fetch("/api/admin/guests");
    if (res.ok) {
      const data = await res.json();
      setGuests(data.rows);
      setHotelStats(data.hotelStats);
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
        const json = await data.json();
        setGuests(json.rows);
        setHotelStats(json.hotelStats);
        setAuthed(true);
      }
    } else {
      setLoginError("Invalid password");
    }
  };

  const selectedGuests = guests.filter((g) => selectedIds.has(g.id));

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleTabChange = (newTab: TabId) => {
    setTab(newTab);
    clearSelection();
  };

  const getLink = async () => {
    const codes = selectedGuests.map((g) => g.invite_code).join("");
    const url = `${window.location.origin}/${codes}`;
    try {
      await navigator.clipboard.writeText(url);
      setGetLinkCopied(true);
      setTimeout(() => setGetLinkCopied(false), 1500);
    } catch {
      // ignored
    }
  };

  const bulkMarkInvited = async () => {
    setBulkLoading(true);
    await Promise.all(
      selectedGuests.map((g) =>
        fetch(`/api/admin/guests/${g.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_invited" }),
        })
      )
    );
    setBulkLoading(false);
    clearSelection();
    checkAuth();
  };

  const bulkOfferHotel = async () => {
    setBulkLoading(true);
    await Promise.all(
      selectedGuests.map((g) =>
        fetch(`/api/admin/guests/${g.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "toggle_hotel", offered_hotel: true }),
        })
      )
    );
    setBulkLoading(false);
    clearSelection();
    checkAuth();
  };

  const bulkSetAttending = async (value: boolean) => {
    setBulkLoading(true);
    await Promise.all(
      selectedGuests.map((g) =>
        fetch(`/api/admin/guests/${g.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "set_attending", is_attending: value }),
        })
      )
    );
    setBulkLoading(false);
    clearSelection();
    checkAuth();
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

  const q = search.trim().toLowerCase();
  const filtered = filterByTab(guests, tab).filter(
    (g) =>
      !q ||
      g.name?.toLowerCase().includes(q) ||
      g.email?.toLowerCase().includes(q) ||
      g.invite_code?.toLowerCase().includes(q) ||
      g.comments?.toLowerCase().includes(q)
  );

  const showResponseCols = tab === "coming" || tab === "not_coming";
  const showRsvpBy = tab === "to_be_invited" || tab === "pending";
  const displayNames = selectedGuests.map((g) => g.name || g.invite_code);

  return (
    <div className="h-screen bg-charcoal text-cream p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-amber text-base sm:text-lg">Invitees</h1>
        {hotelStats.offered > 0 && (
          <p className="text-xs text-cream/60">
            Hotel: <span className="text-amber">{hotelStats.offered}</span> offered &middot;{" "}
            <span className="text-amber">{hotelStats.accepted}</span> accepted &middot;{" "}
            <span className="text-coral">{hotelStats.declined}</span> declined
          </p>
        )}
      </div>

      <div className="flex gap-2 mb-4 border-b border-cream/30 pb-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
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

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, code, comments…"
        className="retro-input w-full max-w-sm mb-4 text-xs"
      />

      {selectedGuests.length > 0 && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 border border-amber/40 bg-amber/5">
          <span className="text-xs text-cream flex-1 min-w-0 truncate">
            {displayNames.join(" · ")}
          </span>
          {tab === "to_be_invited" && (
            <button
              type="button"
              onClick={bulkMarkInvited}
              disabled={bulkLoading}
              className="text-[10px] px-2 py-1 border border-amber text-amber hover:bg-amber hover:text-charcoal transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              Mark Invited
            </button>
          )}
          {(tab === "to_be_invited" || tab === "pending") && (
            <button
              type="button"
              onClick={bulkOfferHotel}
              disabled={bulkLoading}
              className="text-[10px] px-2 py-1 border border-coral text-coral hover:bg-coral hover:text-charcoal transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              Offer Hotel
            </button>
          )}
          {tab !== "coming" && (
            <button
              type="button"
              onClick={() => bulkSetAttending(true)}
              disabled={bulkLoading}
              className="text-[10px] px-2 py-1 border border-cream/50 text-cream/70 hover:bg-cream/10 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              Coming
            </button>
          )}
          {tab !== "not_coming" && (
            <button
              type="button"
              onClick={() => bulkSetAttending(false)}
              disabled={bulkLoading}
              className="text-[10px] px-2 py-1 border border-cream/50 text-cream/70 hover:bg-cream/10 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              Not Coming
            </button>
          )}
          <button
            type="button"
            onClick={getLink}
            className="text-[10px] px-2 py-1 border border-cream/50 text-cream/70 hover:bg-cream/10 transition-colors whitespace-nowrap shrink-0"
          >
            {getLinkCopied ? "Copied!" : "Get Link"}
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="text-[10px] px-2 py-1 border border-cream/30 text-cream/40 hover:bg-cream/10 transition-colors whitespace-nowrap shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

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
                {showRsvpBy && <th className="px-3 py-2 text-left border border-cream/30 w-[90px]">rsvp_by</th>}
                {showResponseCols && <th className="px-3 py-2 text-left border border-cream/30">email</th>}
                {showResponseCols && <th className="px-3 py-2 text-left border border-cream/30 max-w-[240px]">comments</th>}
                <th className="px-3 py-2 text-left border border-cream/30 w-[70px]">hotel</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isSelected = selectedIds.has(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => toggleSelected(row.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-amber/10" : "hover:bg-cream/5"
                    }`}
                  >
                    <td className="px-3 py-2 border border-cream/30">
                      {row.invite_code || "—"}
                    </td>
                    <td className="px-3 py-2 border border-cream/30">
                      {row.name || "—"}
                    </td>
                    {showRsvpBy && (
                      <td className="px-3 py-2 border border-cream/30 text-cream/60">
                        {row.rsvp_by
                          ? new Date(row.rsvp_by + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : <span className="text-cream/30">—</span>}
                      </td>
                    )}
                    {showResponseCols && (
                      <td className="px-3 py-2 border border-cream/30 text-cream/70">
                        {row.email || <span className="text-cream/30">—</span>}
                      </td>
                    )}
                    {showResponseCols && (
                      <td className="px-3 py-2 border border-cream/30 text-cream/70 max-w-[240px] truncate">
                        {row.comments || <span className="text-cream/30">—</span>}
                      </td>
                    )}
                    <td className="px-3 py-2 border border-cream/30 text-center">
                      {!row.offered_hotel ? (
                        <span className="text-cream/30 text-[10px]">—</span>
                      ) : row.accepted_hotel === true ? (
                        <span className="text-amber text-sm">✓</span>
                      ) : row.accepted_hotel === false ? (
                        <span className="text-coral text-sm">✗</span>
                      ) : (
                        <span className="text-cream/60 text-[10px]">offered</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
