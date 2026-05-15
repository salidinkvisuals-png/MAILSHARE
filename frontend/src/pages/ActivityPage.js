import React, { useEffect, useState } from "react";
import { API } from "@/lib/auth";
import { toast } from "sonner";
import { Activity, Loader2, Mail, Filter, Share2, Eye, LogIn, Trash2, Link } from "lucide-react";

const ACTION_META = {
  "account.connect":    { label: "Account connected",    icon: Mail,    color: "bg-blue-50 text-blue-700 border-blue-200" },
  "account.disconnect": { label: "Account disconnected", icon: Trash2,  color: "bg-red-50 text-red-600 border-red-200" },
  "filter.create":      { label: "Filter created",       icon: Filter,  color: "bg-neutral-100 text-neutral-700 border-neutral-200" },
  "filter.delete":      { label: "Filter deleted",       icon: Trash2,  color: "bg-red-50 text-red-600 border-red-200" },
  "share.create":       { label: "Share created",        icon: Share2,  color: "bg-green-50 text-green-700 border-green-200" },
  "share.revoke":       { label: "Share revoked",        icon: Trash2,  color: "bg-red-50 text-red-600 border-red-200" },
  "shared.view":        { label: "Shared view accessed", icon: Eye,     color: "bg-[#002FA7]/10 text-[#002FA7] border-[#002FA7]/20" },
};

export default function ActivityPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/activity")
      .then((r) => setEvents(r.data))
      .catch(() => toast.error("Failed to load activity"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-up" data-testid="activity-page">
      <div className="mb-8">
        <p className="overline mb-1">Audit log</p>
        <h1 className="font-heading font-bold text-3xl tracking-tight">Activity</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={20} className="animate-spin text-neutral-400" />
        </div>
      ) : events.length === 0 ? (
        <div className="border border-dashed border-neutral-300 p-16 text-center" data-testid="activity-empty">
          <Activity size={32} className="mx-auto text-neutral-300 mb-4" />
          <p className="font-heading font-bold text-lg mb-1">No activity yet</p>
          <p className="text-sm text-neutral-500">Actions like connecting accounts, creating filters and shares will appear here.</p>
        </div>
      ) : (
        <div className="border border-black bg-white" data-testid="activity-table">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black bg-neutral-50">
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3">Action</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3 hidden sm:table-cell">Details</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const meta = ACTION_META[e.action] || { label: e.action, icon: Activity, color: "bg-neutral-100 text-neutral-600 border-neutral-200" };
                const Icon = meta.icon;
                return (
                  <tr
                    key={e.id}
                    className="border-b border-neutral-100 last:border-0"
                    data-testid={`activity-row-${e.id}`}
                  >
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 border font-mono text-xs px-2 py-0.5 ${meta.color}`}>
                        <Icon size={11} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(e.meta || {}).map(([k, v]) => (
                          <span key={k} className="font-mono text-xs text-neutral-400">
                            {k}: <span className="text-neutral-600">{String(v).slice(0, 40)}{String(v).length > 40 ? "…" : ""}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-neutral-400">
                        {e.at ? new Date(e.at).toLocaleString() : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
