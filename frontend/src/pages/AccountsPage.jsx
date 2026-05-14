import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "@/lib/api";
import { Plus, Trash2, Mail, X } from "lucide-react";
import { toast } from "sonner";

const PROVIDERS = [
  { id: "gmail", label: "Gmail" },
  { id: "outlook", label: "Outlook" },
  { id: "yahoo", label: "Yahoo" },
  { id: "icloud", label: "iCloud" },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ provider: "gmail", email: "", label: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await api.get("/accounts");
    setAccounts(data);
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/accounts", form);
      toast.success("Mailbox connected (mock).");
      setModal(false);
      setForm({ provider: "gmail", email: "", label: "" });
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally { setLoading(false); }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Disconnect mailbox and remove all related filters & shares?")) return;
    await api.delete(`/accounts/${id}`);
    toast.success("Mailbox disconnected.");
    load();
  };

  return (
    <div className="px-6 lg:px-10 py-10 max-w-[1400px]" data-testid="accounts-page">
      <div className="flex items-end justify-between mb-10 gap-6 flex-wrap animate-fade-up">
        <div>
          <div className="overline">▸ 01 · ACCOUNTS</div>
          <h1 className="font-heading font-black tracking-tighter text-4xl sm:text-5xl mt-2">Mailboxes.</h1>
          <p className="mt-3 text-neutral-600 max-w-xl">Connect a mailbox to start delegating. Mock mode — no real authentication is performed yet.</p>
        </div>
        <button onClick={() => setModal(true)} data-testid="connect-mailbox-button" className="inline-flex items-center gap-2 bg-neutral-950 text-white px-5 py-3 font-mono text-xs uppercase tracking-wider hard-shadow-sm">
          <Plus size={14} /> Connect mailbox
        </button>
      </div>

      <div className="border border-neutral-900 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-900 bg-neutral-50">
              <th className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 py-3 px-4">Provider</th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 py-3 px-4">Email</th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 py-3 px-4">Label</th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 py-3 px-4">Status</th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-neutral-500 py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody data-testid="accounts-table-body">
            {accounts.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center font-mono text-xs text-neutral-500">No mailboxes yet. Click "Connect mailbox".</td></tr>
            )}
            {accounts.map((a) => (
              <tr key={a.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                <td className="py-3 px-4 font-mono text-xs uppercase">{a.provider}</td>
                <td className="py-3 px-4">
                  <Link to={`/app/accounts/${a.id}`} data-testid={`account-inbox-link-${a.id}`} className="flex items-center gap-2 hover:text-[#002FA7]">
                    <Mail size={14} /> {a.email}
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-neutral-700">{a.label}</td>
                <td className="py-3 px-4"><span className="inline-flex items-center gap-1 border border-neutral-900 px-2 py-0.5 font-mono text-[10px] uppercase bg-[#00C853]/10">● Connected</span></td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => onDelete(a.id)} data-testid={`delete-account-${a.id}`} className="inline-flex items-center gap-1 border border-neutral-950 px-3 py-1.5 font-mono text-[11px] uppercase hover:bg-[#FF2A00] hover:text-white hover:border-[#FF2A00] transition-colors">
                    <Trash2 size={12} /> Disconnect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4" onClick={() => setModal(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={onCreate} className="bg-white border border-neutral-950 hard-shadow w-full max-w-lg p-8" data-testid="connect-mailbox-modal">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="overline">▸ CONNECT MAILBOX</div>
                <h2 className="font-heading font-bold text-2xl mt-1 tracking-tight">New connection</h2>
              </div>
              <button type="button" onClick={() => setModal(false)} className="border border-neutral-950 p-2 hover:bg-neutral-950 hover:text-white"><X size={14} /></button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="overline">Provider</label>
                <div className="mt-2 grid grid-cols-4 gap-px bg-neutral-200 border border-neutral-950">
                  {PROVIDERS.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setForm({ ...form, provider: p.id })}
                      data-testid={`provider-${p.id}`}
                      className={`bg-white px-3 py-3 font-mono text-xs uppercase transition-colors ${form.provider === p.id ? "bg-neutral-950 text-white" : "hover:bg-neutral-100"}`}
                      style={form.provider === p.id ? { background: "#0a0a0a", color: "#fff" } : {}}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="overline">Email address</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  data-testid="account-email-input"
                  className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#002FA7]"
                  placeholder="founder@acme.io"
                />
              </div>
              <div>
                <label className="overline">Label (optional)</label>
                <input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  data-testid="account-label-input"
                  className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#002FA7]"
                  placeholder="Primary work"
                />
              </div>
              <div className="border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-[11px] text-neutral-600">
                ▸ MOCK MODE — no real OAuth is performed. Sample emails will be seeded for previewing filters.
              </div>
            </div>

            <button disabled={loading} type="submit" data-testid="account-submit-button" className="mt-8 w-full bg-neutral-950 text-white px-6 py-4 font-mono text-sm uppercase tracking-wider hard-shadow-sm hover:bg-[#002FA7] transition-colors disabled:opacity-60">
              {loading ? "Connecting…" : "Connect mailbox"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
