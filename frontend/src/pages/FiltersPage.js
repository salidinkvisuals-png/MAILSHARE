import React, { useEffect, useState } from "react";
import { API } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Trash2, Filter, Loader2, Eye } from "lucide-react";

export default function FiltersPage() {
  const [filters, setFilters] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", account_id: "", from_contains: "",
    subject_contains: "", label: "", date_from: "", date_to: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const load = async () => {
    try {
      const [f, a] = await Promise.all([
        API.get("/api/filters"),
        API.get("/api/accounts"),
      ]);
      setFilters(f.data);
      setAccounts(a.data);
      if (a.data.length > 0 && !form.account_id) {
        setForm((prev) => ({ ...prev, account_id: a.data[0].id }));
      }
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.account_id) return toast.error("Please connect an account first");
    setSaving(true);
    try {
      await API.post("/api/filters", form);
      toast.success("Filter created");
      setShowForm(false);
      setForm((f) => ({ name: "", account_id: f.account_id, from_contains: "", subject_contains: "", label: "", date_from: "", date_to: "" }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create filter");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this filter? Associated shares will also be removed.")) return;
    setDeleting(id);
    try {
      await API.delete(`/api/filters/${id}`);
      toast.success("Filter deleted");
      setFilters((f) => f.filter((x) => x.id !== id));
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const loadPreview = async (id) => {
    if (previewId === id) { setPreviewId(null); setPreview(null); return; }
    setPreviewId(id);
    setLoadingPreview(true);
    try {
      const r = await API.get(`/api/filters/${id}/preview`);
      setPreview(r.data);
    } catch {
      toast.error("Preview failed");
    } finally {
      setLoadingPreview(false);
    }
  };

  const accountLabel = (id) => {
    const a = accounts.find((x) => x.id === id);
    return a ? a.email : id;
  };

  return (
    <div className="animate-fade-up" data-testid="filters-page">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="overline mb-1">Email filters</p>
          <h1 className="font-heading font-bold text-3xl tracking-tight">Filters</h1>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          disabled={accounts.length === 0}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-[#002FA7] transition-colors disabled:opacity-40"
          data-testid="btn-new-filter"
          title={accounts.length === 0 ? "Connect an account first" : undefined}
        >
          <Plus size={15} />
          New filter
        </button>
      </div>

      {accounts.length === 0 && !loading && (
        <div className="border border-amber-400 bg-amber-50 px-5 py-4 mb-6 font-mono text-xs text-amber-800">
          ⚠ No email accounts connected. Go to Accounts and connect one first.
        </div>
      )}

      {showForm && (
        <form
          onSubmit={save}
          className="border border-black bg-white p-6 mb-6 animate-fade-up"
          data-testid="filter-form"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">Define filter</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="overline block mb-1.5">Filter name *</label>
              <input
                required
                value={form.name}
                onChange={set("name")}
                placeholder="Finance emails"
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none focus:border-[#002FA7]"
                data-testid="input-filter-name"
              />
            </div>
            <div>
              <label className="overline block mb-1.5">Account *</label>
              <select
                required
                value={form.account_id}
                onChange={set("account_id")}
                className="w-full border border-black px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#002FA7]"
                data-testid="select-filter-account"
              >
                <option value="">Select account…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="overline block mb-1.5">From contains</label>
              <input
                value={form.from_contains}
                onChange={set("from_contains")}
                placeholder="billing@stripe.com"
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none focus:border-[#002FA7]"
                data-testid="input-from-contains"
              />
            </div>
            <div>
              <label className="overline block mb-1.5">Subject contains</label>
              <input
                value={form.subject_contains}
                onChange={set("subject_contains")}
                placeholder="Invoice"
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none focus:border-[#002FA7]"
                data-testid="input-subject-contains"
              />
            </div>
            <div>
              <label className="overline block mb-1.5">Label</label>
              <input
                value={form.label}
                onChange={set("label")}
                placeholder="Finance"
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none focus:border-[#002FA7]"
                data-testid="input-filter-label"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="overline block mb-1.5">Date from</label>
                <input
                  type="date"
                  value={form.date_from}
                  onChange={set("date_from")}
                  className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none focus:border-[#002FA7]"
                  data-testid="input-date-from"
                />
              </div>
              <div>
                <label className="overline block mb-1.5">Date to</label>
                <input
                  type="date"
                  value={form.date_to}
                  onChange={set("date_to")}
                  className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none focus:border-[#002FA7]"
                  data-testid="input-date-to"
                />
              </div>
            </div>
          </div>
          <p className="font-mono text-xs text-neutral-400 mb-4">
            Leave fields blank to match all emails. Multiple criteria are ANDed together.
          </p>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-black text-white px-5 py-2 text-sm font-medium hover:bg-[#002FA7] transition-colors disabled:opacity-60"
              data-testid="btn-save-filter"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Create filter
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
      ) : filters.length === 0 ? (
        <div className="border border-dashed border-neutral-300 p-16 text-center" data-testid="filters-empty">
          <Filter size={32} className="mx-auto text-neutral-300 mb-4" />
          <p className="font-heading font-bold text-lg mb-1">No filters yet</p>
          <p className="text-sm text-neutral-500">Create a filter to define what emails to share.</p>
        </div>
      ) : (
        <div className="border border-black bg-white" data-testid="filters-table">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black bg-neutral-50">
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3">Name</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3 hidden sm:table-cell">Account</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3 hidden md:table-cell">Criteria</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filters.map((f) => (
                <React.Fragment key={f.id}>
                  <tr
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
                    data-testid={`filter-row-${f.id}`}
                  >
                    <td className="px-5 py-4 text-sm font-medium">{f.name}</td>
                    <td className="px-5 py-4 text-sm text-neutral-500 hidden sm:table-cell">{accountLabel(f.account_id)}</td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {f.from_contains && <Chip>from: {f.from_contains}</Chip>}
                        {f.subject_contains && <Chip>subject: {f.subject_contains}</Chip>}
                        {f.label && <Chip>label: {f.label}</Chip>}
                        {!f.from_contains && !f.subject_contains && !f.label && (
                          <span className="text-xs text-neutral-400">All emails</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => loadPreview(f.id)}
                          className="p-1.5 hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-black"
                          title="Preview matched emails"
                          data-testid={`btn-preview-${f.id}`}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => remove(f.id)}
                          disabled={deleting === f.id}
                          className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                          title="Delete"
                          data-testid={`btn-delete-filter-${f.id}`}
                        >
                          {deleting === f.id
                            ? <Loader2 size={15} className="animate-spin" />
                            : <Trash2 size={15} />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                  {previewId === f.id && (
                    <tr key={`preview-${f.id}`} className="bg-neutral-50 border-b border-neutral-100">
                      <td colSpan={4} className="px-5 py-4">
                        {loadingPreview ? (
                          <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <Loader2 size={14} className="animate-spin" /> Loading preview…
                          </div>
                        ) : preview && preview.length === 0 ? (
                          <p className="text-sm text-neutral-400">No emails match this filter.</p>
                        ) : (
                          <div>
                            <p className="font-mono text-xs text-neutral-400 mb-2">{preview?.length} email(s) matched</p>
                            {preview?.slice(0, 5).map((e) => (
                              <div key={e.id} className="text-xs border-b border-neutral-100 py-1.5 last:border-0">
                                <span className="font-medium">{e.from_name || e.from_email}</span>
                                <span className="text-neutral-400 mx-2">·</span>
                                {e.subject}
                              </div>
                            ))}
                            {preview?.length > 5 && (
                              <p className="text-xs text-neutral-400 mt-1">…and {preview.length - 5} more</p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="font-mono text-xs border border-neutral-200 px-2 py-0.5 text-neutral-500 bg-neutral-50">
      {children}
    </span>
  );
}
