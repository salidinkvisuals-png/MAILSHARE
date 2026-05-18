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
        { label: "Connected accounts", value: stats.accounts, icon: Mail, to: "/app/accounts", bg: "bg-purple-50", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
        { label: "Active filters", value: stats.filters, icon: Filter, to: "/app/filters", bg: "bg-blue-50", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
        { label: "Active shares", value: stats.shares, icon: Share2, to: "/app/shares", bg: "bg-green-50", iconBg: "bg-green-100", iconColor: "text-green-600" },
        { label: "Shared with me", value: stats.shared_with_me, icon: Inbox, to: "/app/shared", bg: "bg-orange-50", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
        { label: "Emails indexed", value: stats.emails, icon: Mail, to: "/app/accounts", bg: "bg-pink-50", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="overview-loading">
        <Loader2 size={24} className="animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up" data-testid="overview-page">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-1">Dashboard</p>
        <h1 className="text-2xl font-bold text-gray-900">
          Good {getGreeting()}, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, to, bg, iconBg, iconColor }) => (
          <button
            key={label}
            onClick={() => nav(to)}
            className={`${bg} rounded-2xl p-6 text-left hover:opacity-90 transition-all group`}
            data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                <Icon size={18} className={iconColor} />
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value ?? "—"}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Connect an email account", to: "/app/accounts", desc: "Gmail or Outlook", icon: Mail, color: "text-purple-600 bg-purple-50" },
            { label: "Create a filter", to: "/app/filters", desc: "Define what to share", icon: Filter, color: "text-blue-600 bg-blue-50" },
            { label: "Share with someone", to: "/app/shares", desc: "Grant filtered access", icon: Share2, color: "text-green-600 bg-green-50" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => nav(a.to)}
              className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-purple-200 hover:shadow-sm transition-all group flex items-center gap-4"
              data-testid={`quick-${a.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className={`w-10 h-10 ${a.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <a.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{a.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
              </div>
              <ArrowRight size={16} className="text-gray-200 group-hover:text-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Activity shortcut */}
      <button
        onClick={() => nav("/app/activity")}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-600 transition-colors"
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
