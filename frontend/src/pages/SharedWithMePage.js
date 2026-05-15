import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
        <p className="overline mb-1">Received access</p>
        <h1 className="font-heading font-bold text-3xl tracking-tight">Shared with me</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={20} className="animate-spin text-neutral-400" />
        </div>
      ) : shares.length === 0 ? (
        <div className="border border-dashed border-neutral-300 p-16 text-center" data-testid="shared-empty">
          <Inbox size={32} className="mx-auto text-neutral-300 mb-4" />
          <p className="font-heading font-bold text-lg mb-1">Nothing shared with you yet</p>
          <p className="text-sm text-neutral-500">When someone shares a filtered inbox with you, it will appear here.</p>
        </div>
      ) : (
        <div className="border border-black bg-white" data-testid="shared-table">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black bg-neutral-50">
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3">From</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3 hidden sm:table-cell">Account</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3 hidden md:table-cell">Filter</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3 hidden md:table-cell">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {shares.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => nav(`/app/shared/${s.id}`)}
                  data-testid={`shared-row-${s.id}`}
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium">{s.owner?.name || s.owner?.email}</p>
                      {s.owner?.name && (
                        <p className="font-mono text-xs text-neutral-400">{s.owner.email}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div>
                      <p className="text-sm">{s.account?.email}</p>
                      {s.account?.provider && (
                        <p className="font-mono text-xs text-neutral-400 capitalize">{s.account.provider}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div>
                      <p className="text-sm">{s.filter?.name || "—"}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.filter?.from_contains && (
                          <span className="font-mono text-xs border border-neutral-200 px-1.5 py-0.5 text-neutral-400">
                            from: {s.filter.from_contains}
                          </span>
                        )}
                        {s.filter?.label && (
                          <span className="font-mono text-xs border border-neutral-200 px-1.5 py-0.5 text-neutral-400">
                            label: {s.filter.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="border border-black font-mono text-xs px-2 py-0.5 bg-green-50 text-green-700">
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <ChevronRight size={15} className="text-neutral-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    Promise.all([
      API.get("/api/shared-with-me"),
      API.get(`/api/shared-with-me/${shareId}/emails`),
    ])
      .then(([shares, emails]) => {
        setShareInfo(shares.data.find((s) => s.id === shareId));
        setEmails(emails.data);
        if (emails.data.length > 0) setSelected(emails.data[0]);
      })
      .catch(() => toast.error("Failed to load shared inbox"))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={20} className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up" data-testid="shared-inbox-page">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => nav("/app/shared")}
          className="p-1.5 hover:bg-neutral-200 transition-colors"
          data-testid="btn-back"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="overline">Shared view from {shareInfo?.owner?.name || shareInfo?.owner?.email}</p>
          <h1 className="font-heading font-bold text-2xl tracking-tight">
            {shareInfo?.filter?.name || "Shared inbox"}
          </h1>
        </div>
      </div>

      {/* Filter summary */}
      {shareInfo?.filter && (
        <div className="border border-neutral-200 bg-neutral-50 px-5 py-3 mb-6 flex flex-wrap gap-4">
          <div>
            <p className="overline">Account</p>
            <p className="text-sm">{shareInfo.account?.email}</p>
          </div>
          {shareInfo.filter.from_contains && (
            <div>
              <p className="overline">From</p>
              <p className="text-sm">{shareInfo.filter.from_contains}</p>
            </div>
          )}
          {shareInfo.filter.label && (
            <div>
              <p className="overline">Label</p>
              <p className="text-sm">{shareInfo.filter.label}</p>
            </div>
          )}
          {shareInfo.note && (
            <div>
              <p className="overline">Note</p>
              <p className="text-sm">{shareInfo.note}</p>
            </div>
          )}
        </div>
      )}

      <div className="border border-black bg-white flex" style={{ minHeight: "500px" }}>
        {/* Email list */}
        <div className="w-72 border-r border-black flex-shrink-0 overflow-y-auto" data-testid="shared-email-list">
          {emails.length === 0 ? (
            <div className="p-8 text-center">
              <Mail size={24} className="mx-auto text-neutral-300 mb-2" />
              <p className="text-sm text-neutral-400">No emails match this filter</p>
            </div>
          ) : (
            emails.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className={`w-full text-left px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                  selected?.id === e.id ? "bg-neutral-100 border-l-2 border-l-[#002FA7]" : ""
                }`}
                data-testid={`shared-email-${e.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-medium truncate">{e.from_name || e.from_email}</p>
                  <span className="font-mono text-xs text-neutral-400 flex-shrink-0">
                    {formatTime(e.received_at)}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 truncate">{e.subject}</p>
              </button>
            ))
          )}
        </div>

        {/* Email detail */}
        <div className="flex-1 p-6 overflow-y-auto" data-testid="shared-email-detail">
          {selected ? (
            <div>
              <h2 className="font-heading font-bold text-xl tracking-tight mb-4">{selected.subject}</h2>
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-neutral-100">
                <div>
                  <p className="overline mb-0.5">From</p>
                  <p className="text-sm">
                    {selected.from_name
                      ? `${selected.from_name} <${selected.from_email}>`
                      : selected.from_email}
                  </p>
                </div>
                {selected.label && (
                  <div>
                    <p className="overline mb-0.5">Label</p>
                    <span className="font-mono text-xs border border-black px-2 py-0.5">
                      {selected.label}
                    </span>
                  </div>
                )}
                <div>
                  <p className="overline mb-0.5">Received</p>
                  <p className="text-sm">
                    {selected.received_at ? new Date(selected.received_at).toLocaleString() : "—"}
                  </p>
                </div>
              </div>
              <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {selected.body}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-400">
              <p className="text-sm">Select an email to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
import { useParams } from "react-router-dom";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default SharedWithMePage;
