import React, { useEffect, useState } from "react";
import { API } from "@/lib/auth";
import { toast } from "sonner";
import { Activity, Loader2, Mail, Filter, Share2, Eye, Trash2 } from "lucide-react";

const ACTION_META = {
  "account.connect":    { label: "Account connected",    icon: Mail,    color: "bg-blue-50 text-blue-600" },
  "account.disconnect": { label: "Account disconnected", icon: Trash2,  color: "bg-red-50 text-red-500" },
  "filter.create":      { label: "Filter created",       icon: Filter,  color: "bg-purple-50 text-purple-600" },
  "filter.delete":      { label: "Filter deleted",       icon: Trash2,  color: "bg-red-50 text-red-500" },
  "share.create":       { label: "Share created",        icon: Share2,  color: "bg-green-50 text-green-600" },
  "share.revoke":       { label: "Share revoked",        icon: Trash2,  color: "bg-red-50 text-red-500" },
  "shared.view":        { label: "Shared view accessed", icon: Eye,     color: "bg-purple-50 text-purple-600" },
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
        <p className="text-sm text-gray-400 mb-1">Audit log</p>
        <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={20} className="animate-spin text-purple-400" /></div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Activity size={24} className="text-purple-400" /></div>
          <p className="font-semibold text-gray-900 mb-1">No activity yet</p>
          <p className="text-sm text-gray-400">Actions like connecting accounts, creating filters and shares will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {events.map((e, i) => {
            const meta = ACTION_META[e.action] || { label: e.action, icon: Activity, color: "bg-gray-50 text-gray-500" };
            const Icon = meta.icon;
            return (
              <div key={e.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${i !== events.length - 1 ? "border-b border-gray-50" : ""}`}>
                <div className={`w-9 h-9 ${meta.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{meta.label}</p>
                  <div className="flex flex-wrap gap-2 mt-0.5">
                    {Object.entries(e.meta || {}).map(([k, v]) => (
                      <span key={k} className="text-xs text-gray-400">
                        {k}: <span className="text-gray-600">{String(v).slice(0, 40)}{String(v).length > 40 ? "…" : ""}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{e.at ? new Date(e.at).toLocaleString() : "—"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
