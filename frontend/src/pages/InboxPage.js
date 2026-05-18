import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "@/lib/auth";
import { toast } from "sonner";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";

export default function InboxPage() {
  const { accountId } = useParams();
  const [emails, setEmails] = useState([]);
  const [account, setAccount] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    Promise.all([API.get("/api/accounts"), API.get(`/api/accounts/${accountId}/emails`)])
      .then(([acc, em]) => {
        setAccount(acc.data.find((a) => a.id === accountId));
        setEmails(em.data);
        if (em.data.length > 0) setSelected(em.data[0]);
      })
      .catch(() => toast.error("Failed to load inbox"))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={20} className="animate-spin text-purple-400" /></div>;

  return (
    <div className="animate-fade-up" data-testid="inbox-page">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => nav("/app/accounts")} className="p-2 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-xs text-gray-400 capitalize">{account?.provider}</p>
          <h1 className="text-xl font-bold text-gray-900">{account?.email || accountId}</h1>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex" style={{ minHeight: "500px" }}>
        {/* Email list */}
        <div className="w-72 border-r border-gray-100 flex-shrink-0 overflow-y-auto">
          {emails.length === 0 ? (
            <div className="p-8 text-center">
              <Mail size={24} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No emails</p>
            </div>
          ) : emails.map((e) => (
            <button key={e.id} onClick={() => setSelected(e)} className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-purple-50 transition-colors ${selected?.id === e.id ? "bg-purple-50 border-l-2 border-l-purple-500" : ""}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs font-semibold text-gray-900 truncate">{e.from_name || e.from_email}</p>
                <span className="text-xs text-gray-300 flex-shrink-0">{formatTime(e.received_at)}</span>
              </div>
              <p className="text-xs text-gray-500 truncate mb-1">{e.subject}</p>
              {e.label && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{e.label}</span>}
            </button>
          ))}
        </div>

        {/* Email detail */}
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
            <div className="h-full flex items-center justify-center text-gray-300">
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
