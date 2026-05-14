import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { ArrowUpRight, Mail, Filter, Share2, Inbox, Activity } from "lucide-react";

const STAT_CARDS = [
  { key: "accounts", label: "Connected mailboxes", code: "01", to: "/app/accounts", icon: Mail },
  { key: "filters", label: "Active filters", code: "02", to: "/app/filters", icon: Filter },
  { key: "shares", label: "Active shares", code: "03", to: "/app/shares", icon: Share2 },
  { key: "shared_with_me", label: "Shared with me", code: "04", to: "/app/shared", icon: Inbox },
];

export default function OverviewPage() {
  const [stats, setStats] = useState({ accounts: 0, filters: 0, shares: 0, emails: 0, shared_with_me: 0 });
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, a] = await Promise.all([api.get("/overview"), api.get("/activity")]);
        setStats(s.data);
        setActivity(a.data.slice(0, 8));
      } catch (_e) {}
    })();
  }, []);

  return (
    <div className="px-6 lg:px-10 py-10 max-w-[1400px]" data-testid="overview-page">
      <div className="mb-10 animate-fade-up">
        <div className="overline">▸ 00 · OVERVIEW</div>
        <h1 className="font-heading font-black tracking-tighter text-4xl sm:text-5xl mt-2">Control room.</h1>
        <p className="mt-3 text-neutral-600 max-w-xl">Snapshot of everything you delegate, what's shared with you, and recent activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 border border-neutral-900">
        {STAT_CARDS.map((c) => (
          <Link key={c.key} to={c.to} className="bg-white p-6 group transition-colors hover:bg-neutral-50" data-testid={`stat-${c.key}`}>
            <div className="flex items-start justify-between">
              <c.icon size={20} strokeWidth={1.5} className="text-neutral-950 group-hover:text-[#002FA7]" />
              <span className="overline">{c.code}</span>
            </div>
            <div className="mt-6 font-heading font-black text-5xl tracking-tighter leading-none">{stats[c.key] ?? 0}</div>
            <div className="mt-2 text-sm text-neutral-600">{c.label}</div>
            <div className="mt-6 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider group-hover:text-[#002FA7]">
              Open <ArrowUpRight size={12} />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-px bg-neutral-200 border border-neutral-900">
        <div className="lg:col-span-7 bg-white p-8">
          <div className="overline mb-3 flex items-center justify-between">
            <span>▸ QUICK ACTIONS</span>
            <span>05</span>
          </div>
          <h2 className="font-heading font-bold text-2xl tracking-tight">Get to work</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/app/accounts" className="border border-neutral-950 p-5 hard-shadow-sm hover:bg-neutral-50" data-testid="quick-connect-account">
              <div className="overline text-[#002FA7]">STEP 01</div>
              <div className="font-heading font-bold text-lg mt-1">Connect a mailbox</div>
              <div className="text-xs text-neutral-600 mt-1">Gmail · Outlook · Yahoo · iCloud</div>
            </Link>
            <Link to="/app/filters" className="border border-neutral-950 p-5 hard-shadow-sm hover:bg-neutral-50" data-testid="quick-create-filter">
              <div className="overline text-[#002FA7]">STEP 02</div>
              <div className="font-heading font-bold text-lg mt-1">Build a filter</div>
              <div className="text-xs text-neutral-600 mt-1">From · Subject · Label · Date range</div>
            </Link>
            <Link to="/app/shares" className="border border-neutral-950 p-5 hard-shadow-sm hover:bg-neutral-50" data-testid="quick-share-access">
              <div className="overline text-[#002FA7]">STEP 03</div>
              <div className="font-heading font-bold text-lg mt-1">Share access</div>
              <div className="text-xs text-neutral-600 mt-1">Optionally forward to external email</div>
            </Link>
            <Link to="/app/activity" className="border border-neutral-950 p-5 hard-shadow-sm hover:bg-neutral-50" data-testid="quick-audit">
              <div className="overline text-[#002FA7]">STEP 04</div>
              <div className="font-heading font-bold text-lg mt-1">Review audit log</div>
              <div className="text-xs text-neutral-600 mt-1">Every action is traceable</div>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-8">
          <div className="overline mb-3 flex items-center justify-between"><span>▸ RECENT ACTIVITY</span><Activity size={14} /></div>
          <h2 className="font-heading font-bold text-2xl tracking-tight">Last events</h2>
          <div className="mt-6 divide-y divide-neutral-200" data-testid="overview-activity-list">
            {activity.length === 0 && <div className="font-mono text-xs text-neutral-500">No activity yet.</div>}
            {activity.map((a) => (
              <div key={a.id} className="py-2 grid grid-cols-12 gap-2 font-mono text-[11px]">
                <span className="col-span-3 text-neutral-500">{(a.at || "").slice(11, 19)}</span>
                <span className="col-span-3 text-[#002FA7]">{a.action}</span>
                <span className="col-span-6 truncate text-neutral-700">
                  {Object.entries(a.meta || {}).map(([k, v]) => `${k}=${typeof v === "string" ? v.slice(0, 24) : v}`).join("  ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
