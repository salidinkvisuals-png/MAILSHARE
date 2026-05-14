import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Inbox, ArrowRight } from "lucide-react";

export default function SharedWithMePage() {
  const [shares, setShares] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/shared-with-me");
      setShares(data);
    })();
  }, []);

  return (
    <div className="px-6 lg:px-10 py-10 max-w-[1400px]" data-testid="shared-with-me-page">
      <div className="mb-10 animate-fade-up">
        <div className="overline">▸ 04 · SHARED WITH ME</div>
        <h1 className="font-heading font-black tracking-tighter text-4xl sm:text-5xl mt-2">Inboxes I can see.</h1>
        <p className="mt-3 text-neutral-600 max-w-xl">When someone shares a filter with your email, it shows up here. You only see emails that match.</p>
      </div>

      {shares.length === 0 ? (
        <div className="border border-neutral-900 p-12 text-center bg-white">
          <Inbox size={32} className="mx-auto text-neutral-400" />
          <div className="overline mt-4">▸ NOTHING SHARED WITH YOU YET</div>
          <p className="mt-2 text-sm text-neutral-600">Ask a workspace owner to share a filtered view of their inbox with this email.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-neutral-200 border border-neutral-900">
          {shares.map((s) => (
            <Link key={s.id} to={`/app/shared/${s.id}`} className="bg-white p-6 group hover:bg-neutral-50" data-testid={`shared-card-${s.id}`}>
              <div className="overline">▸ FROM {s.owner?.email || "—"}</div>
              <h3 className="font-heading font-bold text-xl mt-2 tracking-tight">{s.filter?.name || "Untitled filter"}</h3>
              <div className="font-mono text-[11px] text-neutral-500 mt-1">Mailbox: {s.account?.email}</div>
              <div className="mt-4 space-y-1 font-mono text-xs">
                {s.filter?.from_contains && <div><span className="text-neutral-500">from:</span> {s.filter.from_contains}</div>}
                {s.filter?.subject_contains && <div><span className="text-neutral-500">subject:</span> {s.filter.subject_contains}</div>}
                {s.filter?.label && <div><span className="text-neutral-500">label:</span> {s.filter.label}</div>}
              </div>
              <div className="mt-6 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-[#002FA7]">
                Open inbox <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
