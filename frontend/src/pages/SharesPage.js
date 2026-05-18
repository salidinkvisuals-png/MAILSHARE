import React, { useEffect, useState } from "react";
import { API } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Trash2, Share2, Loader2, Copy, Check } from "lucide-react";

export default function SharesPage() {
  const [shares, setShares] = useState([]);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ filter_id: "", recipient_email: "", forward_enabled: false, forward_to_email: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [copied, setCopied] = useState(null);

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

  const save = async (e) => {
    e.preventDefault();
    if (!form.filter_id) return toast.error("Please create a filter first");
    setSaving(true);
    try {
      await API.post("/api/shares", { ...form, forward_to_email: form.forward_enabled ? form.forward_to_email || form.recipient_email : undefined });
      toast.success("Share created — recipient can now access the filtered view");
      setShowForm(false);
      setForm((f) => ({ filter_id: f.filter_id, recipient_email: "", forward_enabled: false, forward_to_email: "", note: "" }));
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed to create share"); }
    finally { setSaving(false); }
  };

  const revoke = async (id) => {
    if (!window.confirm("Revoke this share? The recipient will immediately lose access.")) return;
    setDeleting(id);
    try {
      await API.delete(`/api/shares/${id}`);
      toast.success("Share revoked");
      setShares((s) => s.filter((x) => x.id !== id));
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
        <button onClick={() => setShowForm((p) => !p)} disabled={filters.length === 0} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-40" data-testid="btn-new-share">
          <Plus size={15} /> New share
        </button>
      </div>

      {filters.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6 text-sm text-amber-700">
          ⚠ No filters available. Create a filter on the Filters page first.
        </div>
      )}

      {showForm && (
        <form onSubmit={save} className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 animate-fade-up" data-testid="share-form">
          <p className="text-sm font-semibold text-gray-700 mb-4">Create share</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Filter *</label>
              <select required value={form.filter_id} onChange={set("filter_id")} className={inputClass}>
                <option value="">Select filter…</option>
                {filters.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Recipient email *</label><input type="email" required value={form.recipient_email} onChange={set("recipient_email")} placeholder="colleague@company.com" className={inputClass} /></div>
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
              {saving && <Loader2 size={14} className="animate-spin" />} Create share
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
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
          {shares.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${i !== shares.length - 1 ? "border-b border-gray-50" : ""}`}>
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
                <button onClick={() => copyShareId(s.id)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Copy share ID">
                  {copied === s.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
                <button onClick={() => revoke(s.id)} disabled={deleting === s.id} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  {deleting === s.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
