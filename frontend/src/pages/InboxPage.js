import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "@/lib/auth";
import { toast } from "sonner";
import { ArrowLeft, Mail, Loader2, Clock, Tag } from "lucide-react";

export default function InboxPage() {
  const { accountId } = useParams();
  const [emails, setEmails] = useState([]);
  const [account, setAccount] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get("/api/accounts"),
      API.get(`/api/accounts/${accountId}/emails`),
    ])
      .then(([acc, em]) => {
        setAccount(acc.data.find((a) => a.id === accountId));
        setEmails(em.data);
        if (em.data.length > 0) setSelected(em.data[0]);
      })
      .catch(() => toast.error("Failed to load inbox"))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={20} className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up" data-testid="inbox-page">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => nav("/app/accounts")}
          className="p-1.5 hover:bg-neutral-200 transition-colors"
          data-testid="btn-back"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="overline">{account?.provider || "Account"}</p>
          <h1 className="font-heading font-bold text-2xl tracking-tight">{account?.email || accountId}</h1>
        </div>
      </div>

      <div className="border border-black bg-white flex" style={{ minHeight: "500px" }}>
        {/* Email list */}
        <div className="w-72 border-r border-black flex-shrink-0 overflow-y-auto" data-testid="email-list">
          {emails.length === 0 ? (
            <div className="p-8 text-center">
              <Mail size={24} className="mx-auto text-neutral-300 mb-2" />
              <p className="text-sm text-neutral-400">No emails</p>
            </div>
          ) : (
            emails.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className={`w-full text-left px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                  selected?.id === e.id ? "bg-neutral-100 border-l-2 border-l-black" : ""
                }`}
                data-testid={`email-item-${e.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-medium truncate">{e.from_name || e.from_email}</p>
                  <span className="font-mono text-xs text-neutral-400 flex-shrink-0">
                    {formatTime(e.received_at)}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 truncate mb-1">{e.subject}</p>
                {e.label && (
                  <span className="font-mono text-xs border border-neutral-200 px-1.5 py-0.5 text-neutral-500">
                    {e.label}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Email detail */}
        <div className="flex-1 p-6 overflow-y-auto" data-testid="email-detail">
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
                  <p className="text-sm">{selected.received_at ? new Date(selected.received_at).toLocaleString() : "—"}</p>
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

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
