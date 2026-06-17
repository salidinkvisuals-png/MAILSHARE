import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "@/lib/auth";
import { toast } from "sonner";
import { ArrowLeft, Mail, Loader2, MailOpen, Archive, Tag, X, RefreshCw, ChevronRight, LayoutGrid, List } from "lucide-react";

export default function InboxPage() {
  const { accountId } = useParams();
  const [emails, setEmails] = useState([]);
  const [account, setAccount] = useState(null);
  const [labels, setLabels] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  // View style: "card" (bordered cards) or "compact" (flat list). Remembered per-device.
  const [viewStyle, setViewStyle] = useState(() => {
    try { return localStorage.getItem("mailshare_inbox_view") || "card"; } catch { return "card"; }
  });
  const nav = useNavigate();

  const setView = (style) => {
    setViewStyle(style);
    try { localStorage.setItem("mailshare_inbox_view", style); } catch {}
  };

  const load = () =>
    Promise.all([
      API.get("/api/accounts"),
      API.get(`/api/accounts/${accountId}/emails`),
      API.get(`/api/accounts/${accountId}/labels`).catch(() => ({ data: { labels: [] } })),
    ])
      .then(([acc, em, lbl]) => {
        setAccount(acc.data.find((a) => a.id === accountId));
        setEmails(em.data);
        setLabels(lbl.data.labels || []);
        if (em.data.length > 0) setSelected((prev) => prev || em.data[0]);
      })
      .catch(() => toast.error("Failed to load inbox"))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [accountId]);

  // ---------------- Realtime SSE: live new-email updates ----------------
  const [live, setLive] = useState(false);

  useEffect(() => {
    let es;
    let reconnectTimer;

    const connect = () => {
      es = new EventSource("/api/stream", { withCredentials: true });

      es.addEventListener("connected", () => setLive(true));

      es.addEventListener("new_email", (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.account_id !== accountId) return;
          const incoming = payload.email;
          setEmails((prev) => {
            if (prev.some((x) => x.id === incoming.id)) return prev;
            return [incoming, ...prev];
          });
          toast.success(`New email from ${incoming.from_name || incoming.from_email}`);
        } catch {}
      });

      es.onerror = () => {
        setLive(false);
        es.close();
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      if (es) es.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [accountId]);

  const markRead = async (email) => {
    setActionLoading("read");
    try {
      const r = await API.patch(`/api/emails/${email.id}/read`);
      const updated = { ...email, read: r.data.read };
      setEmails((prev) => prev.map((e) => e.id === email.id ? updated : e));
      setSelected(updated);
      toast.success(r.data.read ? "Marked as read" : "Marked as unread");
    } catch {
      toast.error("Failed to update");
    } finally {
      setActionLoading(null);
    }
  };

  const archiveEmail = async (email) => {
    if (!window.confirm("Archive this email? It will be removed from your inbox.")) return;
    setActionLoading("archive");
    try {
      await API.delete(`/api/emails/${email.id}`);
      const remaining = emails.filter((e) => e.id !== email.id);
      setEmails(remaining);
      setSelected(remaining.length > 0 ? remaining[0] : null);
      toast.success("Email archived");
    } catch {
      toast.error("Failed to archive");
    } finally {
      setActionLoading(null);
    }
  };

  const updateLabel = async (email, label) => {
    setActionLoading("label");
    try {
      await API.patch(`/api/emails/${email.id}/label`, { label });
      const updated = { ...email, label };
      setEmails((prev) => prev.map((e) => e.id === email.id ? updated : e));
      setSelected(updated);
      setShowLabelPicker(false);
      setNewLabel("");
      toast.success("Label updated");
    } catch {
      toast.error("Failed to update label");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={20} className="animate-spin text-purple-400" />
    </div>
  );

  return (
    <div className="animate-fade-up flex flex-col" style={{ height: "calc(100vh - 130px)" }} data-testid="inbox-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <button onClick={() => nav("/app/accounts")} className="p-2 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <p className="text-xs text-gray-400 capitalize">{account?.provider}</p>
          <h1 className="text-xl font-bold text-gray-900">{account?.email || accountId}</h1>
        </div>
        {/* View style toggle */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1 mr-1">
          <button
            onClick={() => setView("card")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewStyle === "card" ? "bg-white text-purple-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
            title="Card view"
          >
            <LayoutGrid size={14} /> Cards
          </button>
          <button
            onClick={() => setView("compact")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewStyle === "compact" ? "bg-white text-purple-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
            title="Compact list view"
          >
            <List size={14} /> List
          </button>
        </div>
        <span
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl mr-1 ${
            live ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
          }`}
          title={live ? "Live — new emails appear automatically" : "Reconnecting…"}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
          {live ? "Live" : "Off"}
        </span>
        <button onClick={load} className="p-2 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Two-pane layout — fills remaining height, each pane scrolls independently */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-1 min-h-0">
        {/* Email list — independently scrollable. Style depends on viewStyle. */}
        <div className={`w-72 border-r border-gray-100 flex-shrink-0 overflow-y-auto h-full ${viewStyle === "card" ? "p-2 space-y-2" : ""}`}>
          {emails.length === 0 ? (
            <div className="p-8 text-center">
              <Mail size={24} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No emails</p>
            </div>
          ) : emails.map((e) => {
            const isOpen = selected?.id === e.id;

            if (viewStyle === "compact") {
              // Compact flat-list style (the original look)
              return (
                <button
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-50 transition-colors relative ${
                    isOpen ? "bg-purple-50" : "hover:bg-gray-50"
                  }`}
                >
                  {isOpen && <span className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r" />}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-xs truncate ${e.read ? "text-gray-500 font-normal" : "text-gray-900 font-semibold"}`}>
                      {e.from_name || e.from_email}
                    </p>
                    <span className="text-xs text-gray-300 flex-shrink-0">{formatTime(e.received_at)}</span>
                  </div>
                  <p className={`text-xs truncate mb-1 ${isOpen ? "text-purple-700 font-medium" : e.read ? "text-gray-400" : "text-gray-600"}`}>
                    {e.subject}
                  </p>
                  <div className="flex items-center gap-1">
                    {!e.read && <span className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />}
                    {e.label && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full truncate">{e.label}</span>}
                    {isOpen && <ChevronRight size={12} className="text-purple-500 ml-auto flex-shrink-0" />}
                  </div>
                </button>
              );
            }

            // Card style (bordered button cards)
            return (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className={`w-full text-left px-3 py-3 rounded-xl transition-all flex items-center gap-2 ${
                  isOpen
                    ? "bg-purple-50 border-2 border-purple-600"
                    : "bg-white border border-gray-100 hover:border-purple-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-xs truncate ${e.read ? "text-gray-500 font-normal" : "text-gray-900 font-semibold"}`}>
                      {e.from_name || e.from_email}
                    </p>
                    <span className="text-xs text-gray-300 flex-shrink-0">{formatTime(e.received_at)}</span>
                  </div>
                  <p className={`text-xs truncate mb-1 ${isOpen ? "text-purple-700 font-medium" : e.read ? "text-gray-400" : "text-gray-600"}`}>
                    {e.subject}
                  </p>
                  <div className="flex items-center gap-1">
                    {!e.read && <span className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />}
                    {e.label && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full truncate">{e.label}</span>}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className={`flex-shrink-0 ${isOpen ? "text-purple-600" : "text-gray-300"}`}
                />
              </button>
            );
          })}
        </div>

        {/* Email detail — independently scrollable, toolbar stays fixed */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {selected ? (
            <>
              {/* Action toolbar — fixed at top of detail pane */}
              <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                <button
                  onClick={() => markRead(selected)}
                  disabled={actionLoading === "read"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-white hover:text-purple-600 transition-colors border border-transparent hover:border-purple-200"
                >
                  {actionLoading === "read" ? <Loader2 size={13} className="animate-spin" /> : <MailOpen size={13} />}
                  {selected.read ? "Mark unread" : "Mark read"}
                </button>

                <button
                  onClick={() => archiveEmail(selected)}
                  disabled={actionLoading === "archive"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-white hover:text-orange-600 transition-colors border border-transparent hover:border-orange-200"
                >
                  {actionLoading === "archive" ? <Loader2 size={13} className="animate-spin" /> : <Archive size={13} />}
                  Archive
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowLabelPicker((p) => !p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-white hover:text-blue-600 transition-colors border border-transparent hover:border-blue-200"
                  >
                    <Tag size={13} />
                    {selected.label || "Add label"}
                    {selected.label && (
                      <span
                        onClick={(ev) => { ev.stopPropagation(); updateLabel(selected, ""); }}
                        className="ml-1 text-gray-400 hover:text-red-500"
                      >
                        <X size={11} />
                      </span>
                    )}
                  </button>

                  {showLabelPicker && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-2 animate-fade-in">
                      <p className="text-xs text-gray-400 px-2 py-1 mb-1">Select or create label</p>
                      <div className="max-h-48 overflow-y-auto">
                        {labels.map((l) => (
                          <button
                            key={l}
                            onClick={() => updateLabel(selected, l)}
                            className={`w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors ${selected.label === l ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700"}`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <input
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && newLabel.trim()) updateLabel(selected, newLabel.trim()); }}
                          placeholder="New label…"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                          autoFocus
                        />
                        <p className="text-xs text-gray-300 mt-1 px-1">Press Enter to apply</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Email content — this is the part that scrolls */}
              <div className="flex-1 p-6 overflow-y-auto min-h-0">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{selected.subject}</h2>
                <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">From</p>
                    <p className="text-sm text-gray-700">{selected.from_name ? `${selected.from_name} <${selected.from_email}>` : selected.from_email}</p>
                  </div>
                  {selected.label && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Label</p>
                      <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-medium">{selected.label}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Received</p>
                    <p className="text-sm text-gray-700">{selected.received_at ? new Date(selected.received_at).toLocaleString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Status</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${selected.read ? "bg-gray-100 text-gray-500" : "bg-blue-50 text-blue-600"}`}>
                      {selected.read ? "Read" : "Unread"}
                    </span>
                  </div>
                </div>

                {selected.body_type === "html" ? (
                  <div
                    className="email-html-body"
                    dangerouslySetInnerHTML={{ __html: selected.body }}
                    style={{ maxWidth: "100%", overflow: "auto" }}
                  />
                ) : (
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selected.body}</div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-300">
              <p className="text-sm">Select an email to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
