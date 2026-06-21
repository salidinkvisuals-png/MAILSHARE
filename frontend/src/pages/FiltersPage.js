import React, { useEffect, useState } from "react";
import { API } from "@/lib/auth";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Trash2, Filter, Loader2, Eye, Pencil, X, Check } from "lucide-react";

export default function FiltersPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", account_id: "", from_contains: "", subject_contains: "", label: "", date_from: "", date_to: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [viewingId, setViewingId] = useState(null);

  const load = async () => {
    try {
      const [f, a] = await Promise.all([API.get("/api/filters"), API.get("/api/accounts")]);
      setFilters(f.data);
      setAccounts(a.data);
      if (a.data.length > 0 && !form.account_id) setForm((p) => ({ ...p, account_id: a.data[0].id }));
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", account_id: accounts[0]?.id || "", from_contains: "", subject_contains: "", label: "", date_from: "", date_to: "" });
    setShowForm(true);
    setViewingId(null);
  };

  const openEdit = (f) => {
    setEditingId(f.id);
    setForm({ name: f.name, account_id: f.account_id, from_contains: f.from_contains || "", subject_contains: f.subject_contains || "", label: f.label || "", date_from: f.date_from || "", date_to: f.date_to || "" });
    setShowForm(true);
    setViewingId(null);
    setPreviewId(null);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.account_id) return toast.error("Please connect an account first");
    setSaving(true);
    try {
      if (editingId) {
        await API.put(`/api/filters/${editingId}`, form);
        toast.success("Filter updated");
      } else {
        await API.post("/api/filters", form);
        toast.success("Filter created");
      }
      setShowForm(false);
      setEditingId(null);
      setForm((f) => ({ name: "", account_id: f.account_id, from_contains: "", subject_contains: "", label: "", date_from: "", date_to: "" }));
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Failed to save filter"); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this filter? Any shares using it will also be removed.")) return;
    setDeleting(id);
    try {
      await API.delete(`/api/filters/${id}`);
      toast.success("Filter deleted");
      setFilters((f) => f.filter((x) => x.id !== id));
      if (previewId === id) { setPreviewId(null); setPreview(null); }
      if (viewingId === id) setViewingId(null);
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(null); }
  };

  const loadPreview = async (id) => {
    if (previewId === id) { setPreviewId(null); setPreview(null); return; }
    setPreviewId(id);
    setViewingId(null);
    setLoadingPreview(true);
    try {
      const r = await API.get(`/api/filters/${id}/preview`);
      setPreview(r.data);
    } catch { toast.error("Preview failed"); }
    finally { setLoadingPreview(false); }
  };

  const toggleView = (id) => {
    setViewingId(viewingId === id ? null : id);
    setPreviewId(null);
    setPreview(null);
  };

  const accountEmail = (id) => accounts.find((a) => a.id === id)?.email || id;
  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white";

  return (
    <div className="animate-fade-up" data-testid="filters-page">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-gray-400 mb-1">Email filters</p>
          <h1 className="text-2xl font-bold text-gray-900">Filters</h1>
        </div>
        <button onClick={openCreate} disabled={accounts.length === 0} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-40">
          <Plus size={15} /> New filter
        </button>
      </div>

      {accounts.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6 text-sm text-amber-700">
          ⚠ No email accounts connected. Go to Accounts and connect one first.
        </div>
      )}

      {showForm && (
        <form onSubmit={save} className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">{editingId ? "Edit filter" : "Define filter"}</p>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Filter name *</label><input required value={form.name} onChange={set("name")} placeholder="Finance emails" className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Account *</label>
              <select required value={form.account_id} onChange={set("account_id")} className={inputClass}>
                <option value="">Select account…</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.email}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1.5">From contains</label><input value={form.from_contains} onChange={set("from_contains")} placeholder="billing@stripe.com" className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Subject contains</label><input value={form.subject_contains} onChange={set("subject_contains")} placeholder="Invoice" className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Label</label><input value={form.label} onChange={set("label")} placeholder="Finance" className={inputClass} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Date from</label><input type="date" value={form.date_from} onChange={set("date_from")} className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Date to</label><input type="date" value={form.date_to} onChange={set("date_to")} className={inputClass} /></div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-4">Leave fields blank to match all emails.</p>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Save changes" : "Create filter"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={20} className="animate-spin text-purple-400" /></div>
      ) : filters.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Filter size={24} className="text-purple-400" /></div>
          <p className="font-semibold text-gray-900 mb-1">No filters yet</p>
          <p className="text-sm text-gray-400">Create a filter to define what emails to share.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {filters.map((f, i) => {
            const isOwner = f.owner_id === user?.id;
            const expanded = viewingId === f.id || previewId === f.id;
            return (
              <React.Fragment key={f.id}>
                <div className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${i !== filters.length - 1 || expanded ? "border-b border-gray-50" : ""}`}>
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0"><Filter size={16} className="text-blue-500" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {f.from_contains && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">from: {f.from_contains}</span>}
                      {f.subject_contains && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">subject: {f.subject_contains}</span>}
                      {f.label && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">label: {f.label}</span>}
                      {!f.from_contains && !f.subject_contains && !f.label && <span className="text-xs text-gray-400">All emails</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* View details */}
                    <button onClick={() => toggleView(f.id)} className={`p-2 rounded-xl transition-colors ${viewingId === f.id ? "bg-purple-100 text-purple-600" : "hover:bg-purple-50 text-gray-400 hover:text-purple-600"}`} title="View details">
                      <Eye size={16} />
                    </button>
                    {/* Preview matching emails */}
                    <button onClick={() => loadPreview(f.id)} className={`p-2 rounded-xl transition-colors ${previewId === f.id ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50 text-gray-400 hover:text-blue-500"}`} title="Preview matched emails">
                      <Check size={16} />
                    </button>
                    {/* Edit — only owner */}
                    {isOwner && (
                      <button onClick={() => openEdit(f)} className="p-2 rounded-xl hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 transition-colors" title="Edit filter">
                        <Pencil size={16} />
                      </button>
                    )}
                    {/* Delete — only owner */}
                    {isOwner && (
                      <button onClick={() => remove(f.id)} disabled={deleting === f.id} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete filter">
                        {deleting === f.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* View details panel */}
                {viewingId === f.id && (
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Filter details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div><p className="text-xs text-gray-400">Name</p><p className="text-sm text-gray-700 font-medium">{f.name}</p></div>
                      <div><p className="text-xs text-gray-400">Account</p><p className="text-sm text-gray-700">{accountEmail(f.account_id)}</p></div>
                      <div><p className="text-xs text-gray-400">From contains</p><p className="text-sm text-gray-700">{f.from_contains || <span className="text-gray-300">—</span>}</p></div>
                      <div><p className="text-xs text-gray-400">Subject contains</p><p className="text-sm text-gray-700">{f.subject_contains || <span className="text-gray-300">—</span>}</p></div>
                      <div><p className="text-xs text-gray-400">Label</p><p className="text-sm text-gray-700">{f.label || <span className="text-gray-300">—</span>}</p></div>
                      <div><p className="text-xs text-gray-400">Created</p><p className="text-sm text-gray-700">{f.created_at ? new Date(f.created_at).toLocaleDateString() : "—"}</p></div>
                    </div>
                  </div>
                )}

                {/* Preview panel */}
                {previewId === f.id && (
                  <div className="px-6 py-4 bg-purple-50 border-b border-gray-50">
                    {loadingPreview ? (
                      <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 size={14} className="animate-spin" /> Loading preview…</div>
                    ) : preview?.length === 0 ? (
                      <p className="text-sm text-gray-400">No emails match this filter.</p>
                    ) : (
                      <div>
                        <p className="text-xs text-purple-600 font-medium mb-2">{preview?.length} email(s) matched</p>
                        {preview?.slice(0, 5).map((e) => (
                          <div key={e.id} className="text-xs py-1.5 border-b border-purple-100 last:border-0">
                            <span className="font-medium text-gray-700">{e.from_name || e.from_email}</span>
                            <span className="text-gray-400 mx-2">·</span>{e.subject}
                          </div>
                        ))}
                        {preview?.length > 5 && <p className="text-xs text-gray-400 mt-1">…and {preview.length - 5} more</p>}
                      </div>
                    )}
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
