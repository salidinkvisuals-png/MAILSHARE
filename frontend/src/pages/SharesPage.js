import React, { useEffect, useState } from "react";
import { API } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Trash2, Share2, Loader2, Copy, Check } from "lucide-react";

export default function SharesPage() {
  const [shares, setShares] = useState([]);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    filter_id: "", recipient_email: "",
    forward_enabled: false, forward_to_email: "", note: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [copied, setCopied] = useState(null);

  const load = async () => {
    try {
      const [s, f] = await Promise.all([
        API.get("/api/shares"),
        API.get("/api/filters"),
      ]);
      setShares(s.data);
      setFilters(f.data);
      if (f.data.length > 0 && !form.filter_id) {
        setForm((p) => ({ ...p, filter_id: f.data[0].id }));
      }
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => () => setForm((f) => ({ ...f, [k]: !f[k] }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.filter_id) return toast.error("Please create a filter first");
    setSaving(true);
    try {
      await API.post("/api/shares", {
        ...form,
        forward_to_email: form.forward_enabled ? form.forward_to_email || form.recipient_email : undefined,
      });
      toast.success("Share created — recipient can now access the filtered view");
      setShowForm(false);
      setForm((f) => ({ filter_id: f.filter_id, recipient_email: "", forward_enabled: false, forward_to_email: "", note: "" }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create share");
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (id) => {
    if (!window.confirm("Revoke this share? The recipient will immediately lose access.")) return;
    setDeleting(id);
    try {
      await API.delete(`/api/shares/${id}`);
      toast.success("Share revoked");
      setShares((s) => s.filter((x) => x.id !== id));
    } catch {
      toast.error("Failed to revoke");
    } finally {
      setDeleting(null);
    }
  };

  const copyShareId = (id) => {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filterName = (id) => filters.find((f) => f.id === id)?.name || id;

  return (
    <div className="animate-fade-up" data-testid="shares-page">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="overline mb-1">Access sharing</p>
          <h1 className="font-heading font-bold text-3xl tracking-tight">My shares</h1>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          disabled={filters.length === 0}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-[#002FA7] transition-colors disabled:opacity-40"
          data-testid="btn-new-share"
          title={filters.length === 0 ? "Create a filter first" : undefined}
        >
          <Plus size={15} />
          New share
        </button>
      </div>

      {filters.length === 0 && !loading && (
        <div className="border border-amber-400 bg-amber-50 px-5 py-4 mb-6 font-mono text-xs text-amber-800">
          ⚠ No filters available. Create a filter on the Filters page first.
        </div>
      )}

      {showForm && (
        <form
          onSubmit={save}
          className="border border-black bg-white p-6 mb-6 animate-fade-up"
          data-testid="share-form"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">Create share</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="overline block mb-1.5">Filter *</label>
              <select
                required
                value={form.filter_id}
                onChange={set("filter_id")}
                className="w-full border border-black px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#002FA7]"
                data-testid="select-share-filter"
              >
                <option value="">Select filter…</option>
                {filters.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="overline block mb-1.5">Recipient email *</label>
              <input
                type="email"
                required
                value={form.recipient_email}
                onChange={set("recipient_email")}
                placeholder="colleague@company.com"
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none focus:border-[#002FA7]"
                data-testid="input-recipient-email"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="overline block mb-1.5">Note (optional)</label>
              <input
                value={form.note}
                onChange={set("note")}
                placeholder="e.g. Finance invoices for Q1 audit"
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none focus:border-[#002FA7]"
                data-testid="input-share-note"
              />
            </div>
          </div>

          {/* Forward toggle */}
          <div className="border border-neutral-200 p-4 mb-4">
            <label className="flex items-center gap-3 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={form.forward_enabled}
                onChange={toggle("forward_enabled")}
                className="w-4 h-4 border border-black"
                data-testid="toggle-forward"
              />
              <span className="text-sm font-medium">Enable email forwarding</span>
            </label>
            <p className="font-mono text-xs text-neutral-400 mb-3">
              Automatically forward matching emails to the recipient.
            </p>
            {form.forward_enabled && (
              <div>
                <label className="overline block mb-1.5">Forward to (defaults to recipient)</label>
                <input
                  type="email"
                  value={form.forward_to_email}
                  onChange={set("forward_to_email")}
                  placeholder={form.recipient_email || "forward@example.com"}
                  className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none focus:border-[#002FA7]"
                  data-testid="input-forward-email"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-black text-white px-5 py-2 text-sm font-medium hover:bg-[#002FA7] transition-colors disabled:opacity-60"
              data-testid="btn-save-share"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Create share
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 text-sm border border-black hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={20} className="animate-spin text-neutral-400" />
        </div>
      ) : shares.length === 0 ? (
        <div className="border border-dashed border-neutral-300 p-16 text-center" data-testid="shares-empty">
          <Share2 size={32} className="mx-auto text-neutral-300 mb-4" />
          <p className="font-heading font-bold text-lg mb-1">No active shares</p>
          <p className="text-sm text-neutral-500">Create a share to give someone filtered access to your emails.</p>
        </div>
      ) : (
        <div className="border border-black bg-white" data-testid="shares-table">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black bg-neutral-50">
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3">Recipient</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3 hidden sm:table-cell">Filter</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3 hidden md:table-cell">Note</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3 hidden lg:table-cell">Forward</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3 hidden lg:table-cell">Share ID</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {shares.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
                  data-testid={`share-row-${s.id}`}
                >
                  <td className="px-5 py-4 text-sm font-medium">{s.recipient_email}</td>
                  <td className="px-5 py-4 text-sm text-neutral-500 hidden sm:table-cell">{filterName(s.filter_id)}</td>
                  <td className="px-5 py-4 text-sm text-neutral-400 hidden md:table-cell">{s.note || "—"}</td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className={`font-mono text-xs px-2 py-0.5 border ${s.forward_enabled ? "border-black bg-neutral-100" : "border-neutral-200 text-neutral-400"}`}>
                      {s.forward_enabled ? "On" : "Off"}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <button
                      onClick={() => copyShareId(s.id)}
                      className="flex items-center gap-1 font-mono text-xs text-neutral-400 hover:text-black transition-colors"
                      title="Copy share ID"
                      data-testid={`btn-copy-${s.id}`}
                    >
                      {copied === s.id ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                      {s.id.slice(0, 8)}…
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => revoke(s.id)}
                      disabled={deleting === s.id}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Revoke share"
                      data-testid={`btn-revoke-${s.id}`}
                    >
                      {deleting === s.id
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Trash2 size={15} />
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
