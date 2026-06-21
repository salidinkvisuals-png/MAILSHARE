import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "@/lib/auth";
import { toast } from "sonner";
import { ArrowLeft, Mail, Loader2, ChevronRight, LayoutGrid, List } from "lucide-react";

export default function SharedInboxPage() {
  const { shareId } = useParams();
  const [emails, setEmails] = useState([]);
  const [share, setShare] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
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
      API.get("/api/shared-with-me"),
      API.get(`/api/shared-with-me/${shareId}/emails`),
    ])
      .then(([sh, em]) => {
        const found = sh.data.find((s) => s.id === shareId);
        setShare(found);
        setEmails(em.data);
        if (em.data.length > 0) setSelected(em.data[0]);
      })
      .catch(() => toast.error("Failed to load shared inbox"))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [shareId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={20} className="animate-spin text-purple-400" />
    </div>
  );

  return (
    <div className="animate-fade-up flex flex-col" style={{ height: "calc(100vh - 130px)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <button onClick={() => nav("/app/shared")} className="p-2 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <p className="text-xs text-gray-400">Shared by {share?.owner?.name || share?.owner?.email}</p>
          <h1 className="text-xl font-bold text-gray-900">{share?.filter?.name || "Shared inbox"}</h1>
        </div>
        {/* View toggle */}
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
            title="Compact list"
          >
            <List size={14} /> List
          </button>
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-1 min-h-0">
        {/* Email list */}
        <div className={`w-72 border-r border-gray-100 flex-shrink-0 overflow-y-auto h-full ${viewStyle === "card" ? "p-2 space-y-2" : ""}`}>
          {emails.length === 0 ? (
            <div className="p-8 text-center">
              <Mail size={24} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No emails match this filter</p>
            </div>
          ) : emails.map((e) => {
            const isOpen = selected?.id === e.id;

            if (viewStyle === "compact") {
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
                    <p className={`text-xs truncate ${e.read ? "text-gray-500" : "text-gray-900 font-semibold"}`}>
                      {e.from_name || e.from_email}
                    </p>
                    <span className="text-xs text-gray-300 flex-shrink-0">{formatTime(e.received_at)}</span>
                  </div>
                  <p className={`text-xs truncate mb-1 ${isOpen ? "text-purple-700 font-medium" : e.read ? "text-gray-400" : "text-gray-600"}`}>
                    {e.subject}
                  </p>
                  <div className="flex items-center gap-1">
                    {!e.read && <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />}
                    {e.label && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full truncate">{e.label}</span>}
                    {isOpen && <ChevronRight size={12} className="text-purple-500 ml-auto" />}
                  </div>
                </button>
              );
            }

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
                    <p className={`text-xs truncate ${e.read ? "text-gray-500" : "text-gray-900 font-semibold"}`}>
                      {e.from_name || e.from_email}
                    </p>
                    <span className="text-xs text-gray-300 flex-shrink-0">{formatTime(e.received_at)}</span>
                  </div>
                  <p className={`text-xs truncate mb-1 ${isOpen ? "text-purple-700 font-medium" : e.read ? "text-gray-400" : "text-gray-600"}`}>
                    {e.subject}
                  </p>
                  <div className="flex items-center gap-1">
                    {!e.read && <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />}
                    {e.label && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full truncate">{e.label}</span>}
                  </div>
                </div>
                <ChevronRight size={16} className={`flex-shrink-0 ${isOpen ? "text-purple-600" : "text-gray-300"}`} />
              </button>
            );
          })}
        </div>

        {/* Email detail */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {selected ? (
            <div className="flex-1 p-6 overflow-y-auto min-h-0">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{selected.subject}</h2>
              <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 mb-1">From</p>
                  <p className="text-sm text-gray-700">
                    {selected.from_name ? `${selected.from_name} <${selected.from_email}>` : selected.from_email}
                  </p>
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
              </div>
              {selected.body_type === "html" ? (
                <div className="email-html-body" dangerouslySetInnerHTML={{ __html: selected.body }} style={{ maxWidth: "100%", overflow: "auto" }} />
              ) : (
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selected.body}</div>
              )}
            </div>
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
