import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { ArrowLeft, Mail, Lock } from "lucide-react";

export default function SharedInboxPage() {
  const { shareId } = useParams();
  const [emails, setEmails] = useState([]);
  const [share, setShare] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const list = await api.get("/shared-with-me");
      setShare(list.data.find((s) => s.id === shareId));
      const { data } = await api.get(`/shared-with-me/${shareId}/emails`);
      setEmails(data);
      if (data[0]) setSelected(data[0]);
    })();
  }, [shareId]);

  return (
    <div className="px-6 lg:px-10 py-10 max-w-[1400px]" data-testid="shared-inbox-page">
      <Link to="/app/shared" className="overline inline-flex items-center gap-1 hover:text-[#002FA7]">
        <ArrowLeft size={12} /> Shared with me
      </Link>
      <div className="mt-2 animate-fade-up flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="overline">▸ SHARED INBOX</div>
          <h1 className="font-heading font-black tracking-tighter text-3xl sm:text-4xl mt-2">
            {share?.filter?.name || "…"}
          </h1>
          <p className="text-neutral-600 mt-2 text-sm">
            From <span className="font-mono">{share?.owner?.email}</span> · mailbox <span className="font-mono">{share?.account?.email}</span> · {emails.length} emails
          </p>
        </div>
        <div className="inline-flex items-center gap-2 border border-neutral-950 px-3 py-2 font-mono text-[11px] uppercase">
          <Lock size={12} /> SCOPED VIEW
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-px bg-neutral-200 border border-neutral-900">
        <div className="lg:col-span-5 bg-white max-h-[70vh] overflow-y-auto">
          <div className="overline px-4 py-3 border-b border-neutral-200 sticky top-0 bg-white">▸ MATCHING MAIL</div>
          {emails.length === 0 && <div className="p-6 font-mono text-xs text-neutral-500">No emails matched the filter yet.</div>}
          {emails.map((e) => (
            <button key={e.id} onClick={() => setSelected(e)} data-testid={`shared-email-row-${e.id}`}
              className={`w-full text-left px-4 py-3 border-b border-neutral-200 hover:bg-neutral-50 ${selected?.id === e.id ? "bg-neutral-100" : ""}`}>
              <div className="flex justify-between font-mono text-xs">
                <span className="text-neutral-700 truncate">{e.from_name || e.from_email}</span>
                <span className="text-neutral-500">{(e.received_at || "").slice(5, 10)}</span>
              </div>
              <div className="text-sm font-medium mt-1 truncate">{e.subject}</div>
              <div className="overline mt-1">{e.label}</div>
            </button>
          ))}
        </div>
        <div className="lg:col-span-7 bg-white p-8">
          {selected ? (
            <div>
              <div className="overline mb-2">▸ MESSAGE</div>
              <h2 className="font-heading font-bold text-2xl tracking-tight">{selected.subject}</h2>
              <div className="mt-4 flex items-center gap-3 font-mono text-xs text-neutral-700">
                <Mail size={14} /> {selected.from_name} &lt;{selected.from_email}&gt;
              </div>
              <div className="mt-1 font-mono text-[11px] text-neutral-500">
                {selected.received_at} · LABEL: <span className="text-[#002FA7]">{selected.label}</span>
              </div>
              <div className="mt-6 border-t border-neutral-200 pt-6 text-neutral-800 leading-relaxed">
                {selected.body}
              </div>
            </div>
          ) : (
            <div className="font-mono text-xs text-neutral-500">Select an email.</div>
          )}
        </div>
      </div>
    </div>
  );
}
