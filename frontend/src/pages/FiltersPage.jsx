import React, { useEffect, useMemo, useState } from "react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { Plus, Trash2, X, Filter as FilterIcon, Eye } from "lucide-react";
import { toast } from "sonner";

const blank = { name: "", account_id: "", from_contains: "", subject_contains: "", label: "", date_from: "", date_to: "" };

export default function FiltersPage() {
  const [filters, setFilters] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(blank);
  const [preview, setPreview] = useState(null); // filter id => emails
  const [loading, setLoading] = useState(false);

  const accountMap = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts]);

  const load = async () => {
    const [f, a] = await Promise.all([api.get("/filters"), api.get("/accounts")]);
    setFilters(f.data);
    setAccounts(a.data);
    if (a.data[0] && !form.account_id) setForm((s) => ({ ...s, account_id: a.data[0].id }));
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.account_id) { toast.error("Connect a mailbox first."); return; }
    setLoading(true);
    try {
      await api.post("/filters", { ...form, date_from: form.date_from || null, date_to: form.date_to || null });
      toast.success("Filter created.");
      setModal(false);
      setForm({ ...blank, account_id: form.account_id });
      load();
    } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message); }
    finally { setLoading(false); }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this filter and all its shares?")) return;
    await api.delete(`/filters/${id}`);
    toast.success("Filter deleted.");
    load();
  };

  const onPreview = async (id) => {
    const { data } = await api.get(`/filters/${id}/preview`);
    setPreview({ id, emails: data });
  };

  return (
    <div className="px-6 lg:px-10 py-10 max-w-[1400px]" data-testid="filters-page">
      <div className="flex items-end justify-between mb-10 gap-6 flex-wrap animate-fade-up">
        <div>
          <div className="overline">▸ 02 · FILTERS</div>
          <h1 className="font-heading font-black tracking-tighter text-4xl sm:text-5xl mt-2">Slice the inbox.</h1>
          <p className="mt-3 text-neutral-600 max-w-xl">Build rules to scope what a shared user can see. Combine sender, subject, label and date.</p>
        </div>
        <button onClick={() => setModal(true)} data-testid="create-filter-button" disabled={accounts.length === 0} className="inline-flex items-center gap-2 bg-neutral-950 text-white px-5 py-3 font-mono text-xs uppercase tracking-wider hard-shadow-sm disabled:opacity-50">
          <Plus size={14} /> New filter
        </button>
      </div>

      {accounts.length === 0 && (
        <div className="border border-neutral-950 p-6 mb-6 bg-neutral-50 font-mono text-xs">
          ▸ Connect a mailbox first to create filters.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-neutral-200 border border-neutral-900">
        {filters.length === 0 && (
          <div className="bg-white p-12 col-span-full text-center font-mono text-xs text-neutral-500">No filters yet.</div>
        )}
        {filters.map((f) => (
          <div key={f.id} className="bg-white p-6" data-testid={`filter-card-${f.id}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="overline">▸ FILTER</div>
                <h3 className="font-heading font-bold text-xl mt-1 tracking-tight">{f.name}</h3>
                <div className="font-mono text-[11px] text-neutral-500 mt-1">{accountMap[f.account_id]?.email || "—"}</div>
              </div>
              <FilterIcon size={18} className="text-neutral-400" />
            </div>
            <div className="mt-5 space-y-1 font-mono text-xs">
              {f.from_contains && <div><span className="text-neutral-500">from:</span> {f.from_contains}</div>}
              {f.subject_contains && <div><span className="text-neutral-500">subject:</span> {f.subject_contains}</div>}
              {f.label && <div><span className="text-neutral-500">label:</span> {f.label}</div>}
              {f.date_from && <div><span className="text-neutral-500">from-date:</span> {f.date_from.slice(0, 10)}</div>}
              {f.date_to && <div><span className="text-neutral-500">to-date:</span> {f.date_to.slice(0, 10)}</div>}
              {!f.from_contains && !f.subject_contains && !f.label && !f.date_from && !f.date_to && (
                <div className="text-neutral-500">▸ matches all emails</div>
              )}
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => onPreview(f.id)} data-testid={`preview-filter-${f.id}`} className="inline-flex items-center gap-1 border border-neutral-950 px-3 py-1.5 font-mono text-[11px] uppercase hover:bg-neutral-950 hover:text-white">
                <Eye size={12} /> Preview
              </button>
              <button onClick={() => onDelete(f.id)} data-testid={`delete-filter-${f.id}`} className="inline-flex items-center gap-1 border border-neutral-950 px-3 py-1.5 font-mono text-[11px] uppercase hover:bg-[#FF2A00] hover:text-white hover:border-[#FF2A00]">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4" onClick={() => setModal(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={onCreate} className="bg-white border border-neutral-950 hard-shadow w-full max-w-2xl p-8" data-testid="filter-modal">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="overline">▸ NEW FILTER</div>
                <h2 className="font-heading font-bold text-2xl mt-1 tracking-tight">Build a rule</h2>
              </div>
              <button type="button" onClick={() => setModal(false)} className="border border-neutral-950 p-2 hover:bg-neutral-950 hover:text-white"><X size={14} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="overline">Filter name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="filter-name-input"
                  className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#002FA7]" placeholder="Stripe Invoices" />
              </div>
              <div className="sm:col-span-2">
                <label className="overline">Mailbox</label>
                <select required value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} data-testid="filter-account-select"
                  className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:border-[#002FA7]">
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.email}</option>)}
                </select>
              </div>
              <div>
                <label className="overline">From contains</label>
                <input value={form.from_contains} onChange={(e) => setForm({ ...form, from_contains: e.target.value })} data-testid="filter-from-input"
                  className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#002FA7]" placeholder="stripe.com" />
              </div>
              <div>
                <label className="overline">Subject contains</label>
                <input value={form.subject_contains} onChange={(e) => setForm({ ...form, subject_contains: e.target.value })} data-testid="filter-subject-input"
                  className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#002FA7]" placeholder="invoice" />
              </div>
              <div>
                <label className="overline">Label</label>
                <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} data-testid="filter-label-input"
                  className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#002FA7]" placeholder="Finance" />
              </div>
              <div>
                <label className="overline">Date from</label>
                <input type="date" value={form.date_from} onChange={(e) => setForm({ ...form, date_from: e.target.value })} data-testid="filter-date-from"
                  className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#002FA7]" />
              </div>
              <div>
                <label className="overline">Date to</label>
                <input type="date" value={form.date_to} onChange={(e) => setForm({ ...form, date_to: e.target.value })} data-testid="filter-date-to"
                  className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#002FA7]" />
              </div>
            </div>

            <button disabled={loading} type="submit" data-testid="filter-submit-button" className="mt-8 w-full bg-neutral-950 text-white px-6 py-4 font-mono text-sm uppercase tracking-wider hard-shadow-sm hover:bg-[#002FA7] disabled:opacity-60">
              {loading ? "Saving…" : "Save filter"}
            </button>
          </form>
        </div>
      )}

      {/* Preview drawer */}
      {preview && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-neutral-950/60 p-4" onClick={() => setPreview(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white border border-neutral-950 hard-shadow w-full max-w-3xl max-h-[80vh] overflow-y-auto" data-testid="filter-preview-modal">
            <div className="px-6 py-4 border-b border-neutral-950 flex justify-between items-center bg-neutral-50">
              <div className="overline">▸ PREVIEW · {preview.emails.length} MATCH</div>
              <button onClick={() => setPreview(null)} className="border border-neutral-950 p-2 hover:bg-neutral-950 hover:text-white"><X size={14} /></button>
            </div>
            <div className="divide-y divide-neutral-200">
              {preview.emails.length === 0 && <div className="p-8 font-mono text-xs text-neutral-500">No matches.</div>}
              {preview.emails.map((e) => (
                <div key={e.id} className="p-4">
                  <div className="flex justify-between font-mono text-xs text-neutral-500">
                    <span>{e.from_email}</span><span>{(e.received_at || "").slice(0, 10)}</span>
                  </div>
                  <div className="text-sm font-medium mt-1">{e.subject}</div>
                  <div className="overline mt-1">{e.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
