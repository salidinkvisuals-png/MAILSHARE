import React, { useEffect, useMemo, useState } from "react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { Plus, Trash2, X, Send, User } from "lucide-react";
import { toast } from "sonner";

export default function SharesPage() {
  const [shares, setShares] = useState([]);
  const [filters, setFilters] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ filter_id: "", recipient_email: "", forward_enabled: false, forward_to_email: "", note: "" });
  const [loading, setLoading] = useState(false);

  const filterMap = useMemo(() => Object.fromEntries(filters.map((f) => [f.id, f])), [filters]);
  const accountMap = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts]);

  const load = async () => {
    const [s, f, a] = await Promise.all([api.get("/shares"), api.get("/filters"), api.get("/accounts")]);
    setShares(s.data);
    setFilters(f.data);
    setAccounts(a.data);
    if (f.data[0] && !form.filter_id) setForm((p) => ({ ...p, filter_id: f.data[0].id }));
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.filter_id) { toast.error("Create a filter first."); return; }
    setLoading(true);
    try {
      await api.post("/shares", {
        ...form,
        forward_to_email: form.forward_enabled ? (form.forward_to_email || form.recipient_email) : null,
      });
      toast.success("Access shared.");
      setModal(false);
      setForm({ filter_id: filters[0]?.id || "", recipient_email: "", forward_enabled: false, forward_to_email: "", note: "" });
      load();
    } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message); }
    finally { setLoading(false); }
  };

  const onRevoke = async (id) => {
    if (!window.confirm("Revoke this share?")) return;
    await api.delete(`/shares/${id}`);
    toast.success("Share revoked.");
    load();
  };

  return (
    <div className="px-6 lg:px-10 py-10 max-w-[1400px]" data-testid="shares-page">
      <div className="flex items-end justify-between mb-10 gap-6 flex-wrap animate-fade-up">
        <div>
          <div className="overline">▸ 03 · SHARED ACCESS</div>
          <h1 className="font-heading font-black tracking-tighter text-4xl sm:text-5xl mt-2">Delegations.</h1>
          <p className="mt-3 text-neutral-600 max-w-xl">Grant access to a filter. The recipient sees only matching emails when they sign in.</p>
        </div>
        <button onClick={() => setModal(true)} disabled={filters.length === 0} data-testid="create-share-button" className="inline-flex items-center gap-2 bg-neutral-950 text-white px-5 py-3 font-mono text-xs uppercase tracking-wider hard-shadow-sm disabled:opacity-50">
          <Plus size={14} /> Share access
        </button>
      </div>

      {filters.length === 0 && (
        <div className="border border-neutral-950 p-6 mb-6 bg-neutral-50 font-mono text-xs">
          ▸ Create a filter first to share access.
        </div>
      )}

      <div className="border border-neutral-900 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-900 bg-neutral-50">
              <th className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 py-3 px-4">Recipient</th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 py-3 px-4">Filter</th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 py-3 px-4">Mailbox</th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 py-3 px-4">Forward</th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 py-3 px-4">Granted</th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody data-testid="shares-table-body">
            {shares.length === 0 && <tr><td colSpan={6} className="py-12 text-center font-mono text-xs text-neutral-500">No shares yet.</td></tr>}
            {shares.map((s) => {
              const f = filterMap[s.filter_id];
              const a = accountMap[s.account_id];
              return (
                <tr key={s.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2"><User size={14} /> <span className="text-sm">{s.recipient_email}</span></div>
                  </td>
                  <td className="py-3 px-4 text-sm">{f?.name || "—"}</td>
                  <td className="py-3 px-4 text-sm text-neutral-700">{a?.email || "—"}</td>
                  <td className="py-3 px-4 font-mono text-xs">
                    {s.forward_enabled ? <span className="inline-flex items-center gap-1 text-[#002FA7]"><Send size={12} /> {s.forward_to_email}</span> : <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">{(s.created_at || "").slice(0, 10)}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => onRevoke(s.id)} data-testid={`revoke-share-${s.id}`} className="inline-flex items-center gap-1 border border-neutral-950 px-3 py-1.5 font-mono text-[11px] uppercase hover:bg-[#FF2A00] hover:text-white hover:border-[#FF2A00]">
                      <Trash2 size={12} /> Revoke
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4" onClick={() => setModal(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={onCreate} className="bg-white border border-neutral-950 hard-shadow w-full max-w-lg p-8" data-testid="share-modal">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="overline">▸ SHARE ACCESS</div>
                <h2 className="font-heading font-bold text-2xl mt-1 tracking-tight">Grant filter</h2>
              </div>
              <button type="button" onClick={() => setModal(false)} className="border border-neutral-950 p-2 hover:bg-neutral-950 hover:text-white"><X size={14} /></button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="overline">Filter</label>
                <select required value={form.filter_id} onChange={(e) => setForm({ ...form, filter_id: e.target.value })} data-testid="share-filter-select"
                  className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm bg-white">
                  {filters.map((f) => <option key={f.id} value={f.id}>{f.name} · {accountMap[f.account_id]?.email}</option>)}
                </select>
              </div>
              <div>
                <label className="overline">Recipient email</label>
                <input required type="email" value={form.recipient_email} onChange={(e) => setForm({ ...form, recipient_email: e.target.value })}
                  data-testid="share-recipient-input"
                  className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#002FA7]" placeholder="viewer@mailshare.app" />
                <div className="overline mt-2 text-neutral-500">Use viewer@mailshare.app to test login as recipient.</div>
              </div>
              <div className="border border-neutral-200 p-4 bg-neutral-50">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.forward_enabled} onChange={(e) => setForm({ ...form, forward_enabled: e.target.checked })} data-testid="share-forward-toggle"
                    className="mt-1 w-4 h-4 accent-[#002FA7]" />
                  <span>
                    <span className="font-medium text-sm">Also forward matching emails</span>
                    <span className="block text-[11px] text-neutral-600 mt-0.5 font-mono">Mock: real forwarding will activate once Gmail integration ships.</span>
                  </span>
                </label>
                {form.forward_enabled && (
                  <input type="email" value={form.forward_to_email} onChange={(e) => setForm({ ...form, forward_to_email: e.target.value })}
                    data-testid="share-forward-email"
                    placeholder="forward-to@external.com"
                    className="mt-3 w-full border border-neutral-950 px-4 py-2 font-mono text-sm focus:outline-none focus:border-[#002FA7]" />
                )}
              </div>
              <div>
                <label className="overline">Note (optional)</label>
                <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} data-testid="share-note-input"
                  className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm" placeholder="For Q1 audit only" />
              </div>
            </div>

            <button disabled={loading} type="submit" data-testid="share-submit-button" className="mt-8 w-full bg-neutral-950 text-white px-6 py-4 font-mono text-sm uppercase tracking-wider hard-shadow-sm hover:bg-[#002FA7] disabled:opacity-60">
              {loading ? "Sharing…" : "Grant access"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
