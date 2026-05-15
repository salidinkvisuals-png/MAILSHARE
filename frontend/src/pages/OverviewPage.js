import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "@/lib/auth";
import { useAuth } from "@/lib/auth";
import { Mail, Filter, Share2, Inbox, Activity, ArrowRight, Loader2 } from "lucide-react";

export default function OverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    API.get("/api/overview")
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Connected accounts", value: stats.accounts, icon: Mail, to: "/app/accounts", color: "bg-[#002FA7] text-white" },
        { label: "Active filters", value: stats.filters, icon: Filter, to: "/app/filters", color: "bg-black text-white" },
        { label: "Active shares", value: stats.shares, icon: Share2, to: "/app/shares", color: "bg-[#002FA7] text-white" },
        { label: "Shared with me", value: stats.shared_with_me, icon: Inbox, to: "/app/shared", color: "bg-black text-white" },
        { label: "Emails indexed", value: stats.emails, icon: Mail, to: "/app/accounts", color: "bg-neutral-800 text-white" },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="overview-loading">
        <Loader2 size={24} className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up" data-testid="overview-page">
      {/* Header */}
      <div className="mb-8">
        <p className="overline mb-1">Dashboard</p>
        <h1 className="font-heading font-bold text-3xl tracking-tight">
          Good {getGreeting()}, {user?.name?.split(" ")[0] || "there"}.
        </h1>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-black border border-black mb-8">
        {cards.map(({ label, value, icon: Icon, to, color }) => (
          <button
            key={label}
            onClick={() => nav(to)}
            className="bg-white p-6 text-left hover:bg-neutral-50 transition-colors group flex items-start justify-between"
            data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div>
              <p className="overline mb-3">{label}</p>
              <p className="font-heading font-black text-4xl tracking-tighter">{value ?? "—"}</p>
            </div>
            <div className={`w-10 h-10 flex items-center justify-center ${color} group-hover:opacity-80 transition-opacity`}>
              <Icon size={18} />
            </div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <p className="overline mb-4">Quick actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-black border border-black">
          {[
            { label: "Connect an email account", to: "/app/accounts", desc: "Gmail or Outlook" },
            { label: "Create a filter", to: "/app/filters", desc: "Define what to share" },
            { label: "Share with someone", to: "/app/shares", desc: "Grant filtered access" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => nav(a.to)}
              className="bg-white p-5 text-left hover:bg-neutral-50 transition-colors flex items-center justify-between group"
              data-testid={`quick-${a.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div>
                <p className="text-sm font-medium">{a.label}</p>
                <p className="font-mono text-xs text-neutral-400 mt-0.5">{a.desc}</p>
              </div>
              <ArrowRight size={16} className="text-neutral-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Activity shortcut */}
      <button
        onClick={() => nav("/app/activity")}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition-colors"
        data-testid="view-activity"
      >
        <Activity size={14} />
        View full activity log
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
