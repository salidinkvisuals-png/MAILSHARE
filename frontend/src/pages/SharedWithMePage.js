import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "@/lib/auth";
import { toast } from "sonner";
import { Inbox, Loader2, ChevronRight, ArrowLeft, Mail } from "lucide-react";

// ─── SharedWithMePage ─────────────────────────────────────────────────────────
export function SharedWithMePage() {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    API.get("/api/shared-with-me")
      .then((r) => setShares(r.data))
      .catch(() => toast.error("Failed to load shared views"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-up" data-testid="shared-with-me-page">
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-1">Received access</p>
        <h1 className="text-2xl font-bold text-gray-900">Shared with me</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={20} className="animate-spin text-purple-400" /></div>
      ) : shares.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Inbox size={24} className="text-purple-400" /></div>
          <p className="font-semibold text-gray-900 mb-1">Nothing shared with you yet</p>
          <p className="text-sm text-gray-400">When someone shares a filtered inbox with you, it will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {shares.map((s, i) => (
            <button key={s.id} onClick={() => nav(`/app/shared/${s.id}`)} className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-purple-50 transition-colors text-left ${i !== shares.length - 1 ? "border-b border-gray-50" : ""}`}>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                {(s.owner?.name || s.owner?.email || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{s.owner?.name || s.owner?.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{s.account?.email}</span>
                  {s.filter?.name && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{s.filter.name}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-50 text-green-600 font-medium px-2 py-0.5 rounded-full">{s.status}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SharedInboxPage ──────────────────────────────────────────────────────────
export function SharedInboxPage() {
  const { shareId } = useParams();
  const [emails, setEmails] = useState([]);
  const [shareInfo, setShareInfo] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    Promise.all([API.get("/api/shared-with-me"), API.get(`/api/shared-with-me/${shareId}/emails`)])
      .then(([shares, emails]) => {
        setShareInfo(shares.data.find((s) => s.id === shareId));
        setEmails(emails.data);
        if (emails.data.length > 0) setSelected(emails.data[0]);
      })
      .catch(() => toast.error("Failed to load shared inbox"))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={20} className="animate-spin text-purple-400" /></div>;

  return (
    <div className="animate-fade-up" data-testid="shared-inbox-page">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => nav("/app/shared")} className="p-2 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-xs text-gray-400">Shared by {shareInfo?.owner?.name || shareInfo?.owner?.email}</p>
          <h1 className="text-xl font-bold text-gray-900">{shareInfo?.filter?.name || "Shared inbox"}</h1>
        </div>
      </div>

      {shareInfo?.filter && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4 mb-6 flex flex-wrap gap-6">
          <div><p className="text-xs text-gray-400 mb-1">Account</p><p className="text-sm font-medium text-gray-700">{shareInfo.account?.email}</p></div>
          {shareInfo.filter.from_contains && <div><p className="text-xs text-gray-400 mb-1">From</p><p className="text-sm font-medium text-gray-700">{shareInfo.filter.from_contains}</p></div>}
          {shareInfo.filter.label && <div><p className="text-xs text-gray-400 mb-1">Label</p><p className="text-sm font-medium text-gray-700">{shareInfo.filter.label}</p></div>}
          {shareInfo.note && <div><p className="text-xs text-gray-400 mb-1">Note</p><p className="text-sm font-medium text-gray-700">{shareInfo.note}</p></div>}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex" style={{ minHeight: "500px" }}>
        <div className="w-72 border-r border-gray-100 flex-shrink-0 overflow-y-auto">
          {emails.length === 0 ? (
            <div className="p-8 text-center"><Mail size={24} className="mx-auto text-gray-200 mb-2" /><p className="text-sm text-gray-400">No emails match this filter</p></div>
          ) : emails.map((e) => (
            <button key={e.id} onClick={() => setSelected(e)} className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-purple-50 transition-colors ${selected?.id === e.id ? "bg-purple-50 border-l-2 border-l-purple-500" : ""}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs font-semibold text-gray-900 truncate">{e.from_name || e.from_email}</p>
                <span className="text-xs text-gray-300 flex-shrink-0">{formatTime(e.received_at)}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{e.subject}</p>
            </button>
          ))}
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {selected ? (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">{selected.subject}</h2>
              <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-gray-100">
                <div><p className="text-xs text-gray-400 mb-1">From</p><p className="text-sm text-gray-700">{selected.from_name ? `${selected.from_name} <${selected.from_email}>` : selected.from_email}</p></div>
                {selected.label && <div><p className="text-xs text-gray-400 mb-1">Label</p><span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-medium">{selected.label}</span></div>}
                <div><p className="text-xs text-gray-400 mb-1">Received</p><p className="text-sm text-gray-700">{selected.received_at ? new Date(selected.received_at).toLocaleString() : "—"}</p></div>
              </div>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selected.body}</div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-300"><p className="text-sm">Select an email to read</p></div>
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

export default SharedWithMePage;
