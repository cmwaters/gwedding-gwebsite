"use client";

import { useState, useEffect, useRef } from "react";

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
  const [editName, setEditName] = useState("");
  const [editRsvpMonth, setEditRsvpMonth] = useState("");
  const [editRsvpDay, setEditRsvpDay] = useState("");
  const [nameSaved, setNameSaved] = useState(false);
  const [rsvpBySaved, setRsvpBySaved] = useState(false);
  const nameSavedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rsvpBySavedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [addName, setAddName] = useState("");
  const [addRsvpMonth, setAddRsvpMonth] = useState("");
  const [addRsvpDay, setAddRsvpDay] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

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

  useEffect(() => {
    const sg = guests.filter((g) => selectedIds.has(g.id));
    if (sg.length === 1) {
      setEditName(sg[0].name ?? "");
      if (sg[0].rsvp_by) {
        const [, m, d] = sg[0].rsvp_by.split("-");
        setEditRsvpMonth(String(parseInt(m)));
        setEditRsvpDay(String(parseInt(d)));
      } else {
        setEditRsvpMonth("");
        setEditRsvpDay("");
      }
    } else {
      setEditName("");
      setEditRsvpMonth("");
      setEditRsvpDay("");
    }
    setNameSaved(false);
    setRsvpBySaved(false);
  }, [selectedIds, guests]);

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
    checkAuth();
  };

  const bulkSetHotelAccepted = async (value: boolean) => {
    setBulkLoading(true);
    await Promise.all(
      selectedGuests.map((g) =>
        fetch(`/api/admin/guests/${g.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "set_hotel_accepted", accepted_hotel: value }),
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

  const bulkRescindHotel = async () => {
    setBulkLoading(true);
    await Promise.all(
      selectedGuests.map((g) =>
        fetch(`/api/admin/guests/${g.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "toggle_hotel", offered_hotel: false }),
        })
      )
    );
    setBulkLoading(false);
    checkAuth();
  };

  const saveName = async () => {
    if (selectedGuests.length !== 1 || !editName.trim()) return;
    setBulkLoading(true);
    await fetch(`/api/admin/guests/${selectedGuests[0].id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_name", name: editName.trim() }),
    });
    setBulkLoading(false);
    if (nameSavedTimer.current) clearTimeout(nameSavedTimer.current);
    setNameSaved(true);
    nameSavedTimer.current = setTimeout(() => setNameSaved(false), 1500);
    checkAuth();
  };

  const saveRsvpBy = async () => {
    if (!selectedGuests.length) return;
    const rsvp_by = editRsvpMonth && editRsvpDay
      ? `2026-${editRsvpMonth.padStart(2, "0")}-${editRsvpDay.padStart(2, "0")}`
      : null;
    setBulkLoading(true);
    await Promise.all(
      selectedGuests.map((g) =>
        fetch(`/api/admin/guests/${g.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_rsvp_by", rsvp_by }),
        })
      )
    );
    setBulkLoading(false);
    if (rsvpBySavedTimer.current) clearTimeout(rsvpBySavedTimer.current);
    setRsvpBySaved(true);
    rsvpBySavedTimer.current = setTimeout(() => setRsvpBySaved(false), 1500);
    checkAuth();
  };

  const removeSelected = async () => {
    if (!selectedGuests.length) return;
    setBulkLoading(true);
    await Promise.all(
      selectedGuests.map((g) =>
        fetch(`/api/admin/guests/${g.id}`, { method: "DELETE" })
      )
    );
    setBulkLoading(false);
    clearSelection();
    checkAuth();
  };

  const addGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;
    setAddLoading(true);
    const rsvp_by = addRsvpMonth && addRsvpDay
      ? `2026-${addRsvpMonth.padStart(2, "0")}-${addRsvpDay.padStart(2, "0")}`
      : null;
    await fetch("/api/admin/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: addName.trim(), rsvp_by }),
    });
    setAddLoading(false);
    setAddName("");
    setAddRsvpMonth("");
    setAddRsvpDay("");
    setShowAddForm(false);
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
  const matchesQuery = (g: GuestRow) =>
    !q ||
    g.name?.toLowerCase().includes(q) ||
    g.email?.toLowerCase().includes(q) ||
    g.invite_code?.toLowerCase().includes(q) ||
    g.comments?.toLowerCase().includes(q);

  const filtered = filterByTab(guests, tab).filter(matchesQuery);

  const showResponseCols = tab === "coming" || tab === "not_coming";
  const showRsvpBy = tab === "to_be_invited" || tab === "pending";
  const displayNames = selectedGuests.map((g) => g.name || g.invite_code);

  const today = new Date().toISOString().split("T")[0];
  const overdueFiltered = tab === "pending"
    ? filtered.filter((g) => g.rsvp_by && g.rsvp_by < today)
    : [];
  const mainFiltered = tab === "pending"
    ? filtered.filter((g) => !g.rsvp_by || g.rsvp_by >= today)
    : filtered;

  const invitedCount = filterByTab(guests, "pending").length + filterByTab(guests, "coming").length;
  const atCapacity = invitedCount >= 122;

  const crossTabResults = q
    ? TABS.filter((t) => t.id !== tab).map((t) => ({
        tabId: t.id,
        label: t.label,
        rows: filterByTab(guests, t.id).filter(matchesQuery),
      })).filter((r) => r.rows.length > 0)
    : [];

  const makeTableHead = (rsvpBy: boolean, responseCols: boolean) => (
    <thead>
      <tr className="text-amber border-b border-cream/50">
        <th className="px-3 py-2 text-left border border-cream/30">invite_code</th>
        <th className="px-3 py-2 text-left border border-cream/30">name</th>
        {rsvpBy && <th className="px-3 py-2 text-left border border-cream/30 w-[90px]">rsvp_by</th>}
        {responseCols && <th className="px-3 py-2 text-left border border-cream/30">email</th>}
        {responseCols && <th className="px-3 py-2 text-left border border-cream/30 max-w-[240px]">comments</th>}
        <th className="px-3 py-2 text-left border border-cream/30 w-[70px]">hotel</th>
      </tr>
    </thead>
  );

  const renderRows = (rows: GuestRow[], rsvpBy: boolean, responseCols: boolean) => rows.map((row) => {
    const isSelected = selectedIds.has(row.id);
    return (
      <tr
        key={row.id}
        onClick={() => toggleSelected(row.id)}
        className={`cursor-pointer transition-colors ${isSelected ? "bg-amber/10" : "hover:bg-cream/5"}`}
      >
        <td className="px-3 py-2 border border-cream/30">{row.invite_code || "—"}</td>
        <td className="px-3 py-2 border border-cream/30">{row.name || "—"}</td>
        {rsvpBy && (
          <td className="px-3 py-2 border border-cream/30 text-cream/60">
            {row.rsvp_by
              ? new Date(row.rsvp_by + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : <span className="text-cream/30">—</span>}
          </td>
        )}
        {responseCols && (
          <td className="px-3 py-2 border border-cream/30 text-cream/70">
            {row.email || <span className="text-cream/30">—</span>}
          </td>
        )}
        {responseCols && (
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
  });

  const tableHead = makeTableHead(showRsvpBy, showResponseCols);

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

      <div className="flex items-center gap-2 mb-4 border-b border-cream/30 pb-2 overflow-x-auto">
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
        <span className={`ml-auto text-xs whitespace-nowrap pl-2 ${atCapacity ? "text-coral" : "text-cream/50"}`}>
          {invitedCount}/122 invited
        </span>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, code, comments…"
        className="retro-input w-full max-w-sm mb-4 text-xs"
      />

      {selectedGuests.length > 0 && (
        <>
        <div className="flex items-center gap-2 px-3 py-2 border border-amber/40 bg-amber/5">
          <span className="text-xs text-cream flex-1 min-w-0 truncate">
            {displayNames.join(" · ")}
          </span>
          {tab === "to_be_invited" && (
            <button
              type="button"
              onClick={bulkMarkInvited}
              disabled={bulkLoading || atCapacity}
              title={atCapacity ? "At capacity (122 invited)" : undefined}
              className="text-[10px] px-2 py-1 border border-amber text-amber hover:bg-amber hover:text-charcoal transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            >
              Mark Invited
            </button>
          )}
          {(() => {
            const allOffered = selectedGuests.every((g) => g.offered_hotel);
            const noneOffered = selectedGuests.every((g) => !g.offered_hotel);
            return (
              <>
                {!allOffered && (
                  <button
                    type="button"
                    onClick={bulkOfferHotel}
                    disabled={bulkLoading}
                    className="text-[10px] px-2 py-1 border border-coral text-coral hover:bg-coral hover:text-charcoal transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
                  >
                    Offer Hotel
                  </button>
                )}
                {!noneOffered && (
                  <button
                    type="button"
                    onClick={bulkRescindHotel}
                    disabled={bulkLoading}
                    className="text-[10px] px-2 py-1 border border-cream/50 text-cream/70 hover:bg-cream/10 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
                  >
                    Rescind Hotel
                  </button>
                )}
              </>
            );
          })()}
          {tab === "coming" && (() => {
            const allAccepted = selectedGuests.every((g) => g.accepted_hotel === true);
            return (
              <button
                type="button"
                onClick={() => bulkSetHotelAccepted(!allAccepted)}
                disabled={bulkLoading}
                className="text-[10px] px-2 py-1 border border-coral text-coral hover:bg-coral hover:text-charcoal transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {allAccepted ? "Hotel ✗" : "Hotel ✓"}
              </button>
            );
          })()}
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
            disabled={atCapacity}
            title={atCapacity ? "At capacity (122 invited)" : undefined}
            className="text-[10px] px-2 py-1 border border-cream/50 text-cream/70 hover:bg-cream/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
          >
            {getLinkCopied ? "Copied!" : "Get Link"}
          </button>
          {tab === "to_be_invited" && (
            <button
              type="button"
              onClick={removeSelected}
              disabled={bulkLoading}
              className="text-[10px] px-2 py-1 border border-coral text-coral hover:bg-coral hover:text-charcoal transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              Remove
            </button>
          )}
          <button
            type="button"
            onClick={clearSelection}
            className="text-[10px] px-2 py-1 border border-cream/30 text-cream/40 hover:bg-cream/10 transition-colors whitespace-nowrap shrink-0"
          >
            Cancel
          </button>
        </div>

        {/* Row 2: edit fields */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 border-x border-b border-amber/40 bg-amber/5 mb-4">
          {selectedGuests.length === 1 && (
            <div className="flex items-center gap-1">
              <label className="text-[10px] text-amber whitespace-nowrap">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                disabled={bulkLoading}
                className="retro-input text-[10px] py-0.5 px-2 w-32"
              />
              <button
                type="button"
                onClick={saveName}
                disabled={bulkLoading || !editName.trim()}
                className="text-[10px] px-2 py-1 border border-amber text-amber hover:bg-amber hover:text-charcoal transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                {nameSaved ? "Saved!" : "Save"}
              </button>
            </div>
          )}

          {selectedGuests.length === 1 && showResponseCols && selectedGuests[0].comments && (
            <div className="flex items-start gap-1 w-full">
              <label className="text-[10px] text-amber whitespace-nowrap pt-0.5">Comment</label>
              <p className="text-[10px] text-cream/80 leading-relaxed">{selectedGuests[0].comments}</p>
            </div>
          )}

          <div className="flex items-center gap-1">
            <label className="text-[10px] text-amber whitespace-nowrap">RSVP By</label>
            <input
              type="number"
              min={1}
              max={12}
              value={editRsvpMonth}
              onChange={(e) => setEditRsvpMonth(e.target.value)}
              disabled={bulkLoading}
              placeholder="MM"
              className="retro-input text-[10px] py-0.5 px-2 w-12"
            />
            <input
              type="number"
              min={1}
              max={31}
              value={editRsvpDay}
              onChange={(e) => setEditRsvpDay(e.target.value)}
              disabled={bulkLoading}
              placeholder="DD"
              className="retro-input text-[10px] py-0.5 px-2 w-12"
            />
            <button
              type="button"
              onClick={saveRsvpBy}
              disabled={bulkLoading}
              className="text-[10px] px-2 py-1 border border-amber text-amber hover:bg-amber hover:text-charcoal transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              {rsvpBySaved ? "Saved!" : "Save"}
            </button>
          </div>

        </div>
        </>
      )}

      {tab === "to_be_invited" && (
        <div className="mb-4">
          {!showAddForm ? (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="text-[10px] px-3 py-1 border border-amber text-amber hover:bg-amber hover:text-charcoal transition-colors whitespace-nowrap"
            >
              + Add Invitee
            </button>
          ) : (
            <form onSubmit={addGuest} className="flex flex-wrap items-center gap-2 px-3 py-2 border border-amber/40 bg-amber/5">
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Name"
                disabled={addLoading}
                autoFocus
                className="retro-input text-xs py-1 px-2 w-40"
              />
              <div className="flex items-center gap-1">
                <label className="text-[10px] text-amber whitespace-nowrap">RSVP By</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={addRsvpMonth}
                  onChange={(e) => setAddRsvpMonth(e.target.value)}
                  disabled={addLoading}
                  placeholder="MM"
                  className="retro-input text-[10px] py-1 px-2 w-12"
                />
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={addRsvpDay}
                  onChange={(e) => setAddRsvpDay(e.target.value)}
                  disabled={addLoading}
                  placeholder="DD"
                  className="retro-input text-[10px] py-1 px-2 w-12"
                />
              </div>
              <button
                type="submit"
                disabled={addLoading || !addName.trim()}
                className="text-[10px] px-3 py-1 border border-amber text-amber hover:bg-amber hover:text-charcoal transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                {addLoading ? "Adding…" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setAddName(""); setAddRsvpMonth(""); setAddRsvpDay(""); }}
                className="text-[10px] px-2 py-1 border border-cream/30 text-cream/40 hover:bg-cream/10 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-cream/60 text-xs py-6 text-center">No invitees in this tab</p>
        ) : (
          <>
            {overdueFiltered.length > 0 && (
              <div className="mb-4">
                <p className="text-coral text-[10px] uppercase tracking-wide mb-1">
                  Overdue — needs reminder ({overdueFiltered.length})
                </p>
                <table className="w-full border-collapse text-xs border border-coral/30">
                  {tableHead}
                  <tbody>{renderRows(overdueFiltered, showRsvpBy, showResponseCols)}</tbody>
                </table>
              </div>
            )}
            {mainFiltered.length > 0 && (
              <table className="w-full border-collapse text-xs">
                {tableHead}
                <tbody>{renderRows(mainFiltered, showRsvpBy, showResponseCols)}</tbody>
              </table>
            )}
          </>
        )}
      </div>

      {crossTabResults.map(({ tabId, label, rows }) => {
        const ctRsvpBy = tabId === "to_be_invited" || tabId === "pending";
        const ctResponseCols = tabId === "coming" || tabId === "not_coming";
        return (
          <div key={tabId} className="mt-6 overflow-x-auto">
            <p className="text-cream/50 text-[10px] uppercase tracking-wide mb-1">
              {label} ({rows.length})
            </p>
            <table className="w-full border-collapse text-xs opacity-60">
              {makeTableHead(ctRsvpBy, ctResponseCols)}
              <tbody>{renderRows(rows, ctRsvpBy, ctResponseCols)}</tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
