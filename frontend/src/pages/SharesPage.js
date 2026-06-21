import React, { useEffect, useState } from "react";
import { API } from "@/lib/auth";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Trash2, Share2, Loader2, Copy, Check, Eye, Pencil, X } from "lucide-react";

export default function SharesPage() {
  const { user } = useAuth();
  const [shares, setShares] = useState([]);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ filter_id: "", recipient_email: "", forward_enabled: false, forward_to_email: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [copied, setCopied] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  const load = async () => {
    try {
      const [s, f] = await Promise.all([API.get("/api/shares"), API.get("/api/filters")]);
      setShares(s.data);
      setFilters(f.data);
      if (f.data.length > 0 && !form.filter_id) setForm((p) => ({ ...p, filter_id: f.data[0].id }));
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => () => setForm((f) => ({ ...f, [k]: !f[k] }));

  const openCreate = () => {
    setEditingId(null);
    setForm({ filter_id: filters[0]?.id || "", recipient_email: "", forward_enabled: false, forward_to_email: "", note: "" });
    setShowForm(true);
    setViewingId(null);
  };

  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({
      filter_id: s.filter_id,
      recipient_email: s.recipient_email,
      forward_enabled: s.forward_enabled || false,
      forward_to_email: s.forward_to_email || "",
      note: s.note || "",
    });
    setShowForm(true);
    setViewingId(null);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.filter_id) return toast.error("Please create a filter first");
    setSaving(true);
    try {
      const payload = { ...form, forward_to_email: form.forward_enabled ? form.forward_to_email || form.recipient_email : undefined };
      if (editingId) {
        await API.put(`/api/shares/${editingId}`, payload);
        toast.success("Share updated");
      } else {
        await API.post("/api/shares", payload);
        toast.success("Share created — recipient can now access the filtered view");
      }
      setShowForm(false);
      setEditingId(null);
      setForm((f) => ({ filter_id: f.filter_id, recipient_email: "", forward_enabled: false, forward_to_email: "", note: "" }));
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed to save share"); }
    finally { setSaving(false); }
  };

  const revoke = async (id) => {
    if (!window.confirm("Revoke this share? The recipient will immediately lose access.")) return;
    setDeleting(id);
    try {
      await API.delete(`/api/shares/${id}`);
      toast.success("Share revoked");
      setShares((s) => s.filter((x) => x.id !== id));
      if (viewingId === id) setViewingId(null);
    } catch { toast.error("Failed to revoke"); }
    finally { setDeleting(null); }
  };

  const copyShareId = (id) => {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filterName = (id) => filters.find((f) => f.id === id)?.name || id;
  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white";

  return (
    <div className="animate-fade-up" data-testid="shares-page">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-gray-400 mb-1">Access sharing</p>
          <h1 className="text-2xl font-bold text-gray-900">My shares</h1>
        </div>
        <button onClick={openCreate} disabled={filters.length === 0} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-40">
          <Plus size={15} /> New share
        </button>
      </div>

      {filters.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6 text-sm text-amber-700">
          ⚠ No filters available. Create a filter on the Filters page first.
        </div>
      )}

      {showForm && (
        <form onSubmit={save} className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">{editingId ? "Edit share" : "Create share"}</p>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Filter *</label>
              <select required value={form.filter_id} onChange={set("filter_id")} className={inputClass}>
                <option value="">Select filter…</option>
                {filters.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Recipient email *</label>
              <input type="email" required value={form.recipient_email} onChange={set("recipient_email")} placeholder="colleague@company.com" className={inputClass}
                disabled={!!editingId} // can't change recipient on edit — revoke and recreate instead
              />
              {editingId && <p className="text-xs text-gray-400 mt-1">To change recipient, revoke this share and create a new one.</p>}
            </div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-600 mb-1.5">Note (optional)</label><input value={form.note} onChange={set("note")} placeholder="e.g. Finance invoices for Q1 audit" className={inputClass} /></div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input type="checkbox" checked={form.forward_enabled} onChange={toggle("forward_enabled")} className="w-4 h-4 accent-purple-600" />
              <span className="text-sm font-medium text-gray-700">Enable email forwarding</span>
            </label>
            <p className="text-xs text-gray-400 ml-7">Automatically forward matching emails to the recipient.</p>
            {form.forward_enabled && (
              <div className="mt-3 ml-7"><input type="email" value={form.forward_to_email} onChange={set("forward_to_email")} placeholder={form.recipient_email || "forward@example.com"} className={inputClass} /></div>
            )}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Save changes" : "Create share"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={20} className="animate-spin text-purple-400" /></div>
      ) : shares.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Share2 size={24} className="text-purple-400" /></div>
          <p className="font-semibold text-gray-900 mb-1">No active shares</p>
          <p className="text-sm text-gray-400">Create a share to give someone filtered access to your emails.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {shares.map((s, i) => {
            const isOwner = s.owner_id === user?.id;
            const expanded = viewingId === s.id;
            return (
              <React.Fragment key={s.id}>
                <div className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${i !== shares.length - 1 || expanded ? "border-b border-gray-50" : ""}`}>
                  <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0"><Share2 size={16} className="text-green-500" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.recipient_email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{filterName(s.filter_id)}</span>
                      {s.forward_enabled && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">Forwarding on</span>}
                      {s.note && <span className="text-xs text-gray-400 truncate">· {s.note}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View */}
                    <button onClick={() => setViewingId(viewingId === s.id ? null : s.id)} className={`p-2 rounded-xl transition-colors ${viewingId === s.id ? "bg-purple-100 text-purple-600" : "hover:bg-purple-50 text-gray-400 hover:text-purple-600"}`} title="View details">
                      <Eye size={16} />
                    </button>
                    {/* Copy ID */}
                    <button onClick={() => copyShareId(s.id)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Copy share ID">
                      {copied === s.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    {/* Edit — only owner */}
                    {isOwner && (
                      <button onClick={() => openEdit(s)} className="p-2 rounded-xl hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition-colors" title="Edit share">
                        <Pencil size={16} />
                      </button>
                    )}
                    {/* Delete — only owner */}
                    {isOwner && (
                      <button onClick={() => revoke(s.id)} disabled={deleting === s.id} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Revoke share">
                        {deleting === s.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* View details panel */}
                {viewingId === s.id && (
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Share details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div><p className="text-xs text-gray-400">Recipient</p><p className="text-sm text-gray-700 font-medium">{s.recipient_email}</p></div>
                      <div><p className="text-xs text-gray-400">Filter</p><p className="text-sm text-gray-700">{filterName(s.filter_id)}</p></div>
                      <div><p className="text-xs text-gray-400">Forwarding</p><p className="text-sm text-gray-700">{s.forward_enabled ? `On → ${s.forward_to_email}` : "Off"}</p></div>
                      <div><p className="text-xs text-gray-400">Status</p><span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">{s.status}</span></div>
                      {s.note && <div className="col-span-2"><p className="text-xs text-gray-400">Note</p><p className="text-sm text-gray-700">{s.note}</p></div>}
                      <div><p className="text-xs text-gray-400">Created</p><p className="text-sm text-gray-700">{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</p></div>
                      <div><p className="text-xs text-gray-400">Share ID</p><p className="text-xs text-gray-400 font-mono truncate">{s.id}</p></div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
