import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Trash2, Mail, Loader2, ExternalLink, ChevronRight } from "lucide-react";

const PROVIDERS = [
  { id: "gmail", label: "Gmail", color: "bg-red-50 border-red-200 text-red-700" },
  { id: "outlook", label: "Outlook", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "yahoo", label: "Yahoo", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { id: "icloud", label: "iCloud", color: "bg-neutral-50 border-neutral-200 text-neutral-700" },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ provider: "gmail", email: "", label: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const nav = useNavigate();

  const load = () =>
    API.get("/api/accounts")
      .then((r) => setAccounts(r.data))
      .catch(() => toast.error("Failed to load accounts"))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const connect = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/api/accounts", form);
      toast.success("Account connected");
      setShowForm(false);
      setForm({ provider: "gmail", email: "", label: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to connect account");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Disconnect this account? All its filters and shares will be removed.")) return;
    setDeleting(id);
    try {
      await API.delete(`/api/accounts/${id}`);
      toast.success("Account disconnected");
      setAccounts((a) => a.filter((x) => x.id !== id));
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="animate-fade-up" data-testid="accounts-page">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="overline mb-1">Email accounts</p>
          <h1 className="font-heading font-bold text-3xl tracking-tight">Connected accounts</h1>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-[#002FA7] transition-colors"
          data-testid="btn-add-account"
        >
          <Plus size={15} />
          Connect account
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={connect}
          className="border border-black bg-white p-6 mb-6 animate-fade-up"
          data-testid="account-form"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-4">New connection</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="overline block mb-1.5">Provider</label>
              <select
                value={form.provider}
                onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                className="w-full border border-black px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#002FA7]"
                data-testid="select-provider"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="overline block mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@gmail.com"
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none focus:border-[#002FA7]"
                data-testid="input-account-email"
              />
            </div>
            <div>
              <label className="overline block mb-1.5">Label (optional)</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Work, Personal…"
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none focus:border-[#002FA7]"
                data-testid="input-account-label"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-black text-white px-5 py-2 text-sm font-medium hover:bg-[#002FA7] transition-colors disabled:opacity-60"
              data-testid="btn-save-account"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Connect
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 text-sm border border-black hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
          </div>
          <p className="font-mono text-xs text-neutral-400 mt-3">
            ℹ In production, this triggers an OAuth flow. Currently loads sample emails for demo purposes.
          </p>
        </form>
      )}

      {/* Accounts table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={20} className="animate-spin text-neutral-400" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="border border-dashed border-neutral-300 p-16 text-center" data-testid="accounts-empty">
          <Mail size={32} className="mx-auto text-neutral-300 mb-4" />
          <p className="font-heading font-bold text-lg mb-1">No accounts connected</p>
          <p className="text-sm text-neutral-500">Connect your first Gmail or Outlook account to get started.</p>
        </div>
      ) : (
        <div className="border border-black bg-white" data-testid="accounts-table">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black bg-neutral-50">
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3">Account</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3 hidden sm:table-cell">Provider</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3 hidden md:table-cell">Label</th>
                <th className="text-left font-mono text-xs uppercase tracking-wider text-neutral-500 px-5 py-3 hidden md:table-cell">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
                  data-testid={`account-row-${a.id}`}
                >
                  <td className="px-5 py-4">
                    <button
                      onClick={() => nav(`/app/accounts/${a.id}`)}
                      className="flex items-center gap-3 group"
                      data-testid={`view-inbox-${a.id}`}
                    >
                      <div className="w-8 h-8 border border-black bg-neutral-100 flex items-center justify-center font-mono text-xs font-bold">
                        {a.email[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium group-hover:underline underline-offset-2">{a.email}</span>
                    </button>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <ProviderBadge provider={a.provider} />
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-500 hidden md:table-cell">
                    {a.label || "—"}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="border border-black font-mono text-xs px-2 py-0.5 bg-green-50 text-green-700">
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => nav(`/app/accounts/${a.id}`)}
                        className="p-1.5 hover:bg-neutral-100 transition-colors"
                        title="View inbox"
                        data-testid={`btn-view-${a.id}`}
                      >
                        <ChevronRight size={15} className="text-neutral-400" />
                      </button>
                      <button
                        onClick={() => remove(a.id)}
                        disabled={deleting === a.id}
                        className="p-1.5 hover:bg-red-50 transition-colors text-neutral-400 hover:text-red-600"
                        title="Disconnect"
                        data-testid={`btn-delete-${a.id}`}
                      >
                        {deleting === a.id
                          ? <Loader2 size={15} className="animate-spin" />
                          : <Trash2 size={15} />
                        }
                      </button>
                    </div>
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

function ProviderBadge({ provider }) {
  const p = PROVIDERS.find((x) => x.id === provider);
  return (
    <span className={`font-mono text-xs px-2 py-0.5 border ${p?.color || "border-neutral-200 text-neutral-500"}`}>
      {p?.label || provider}
    </span>
  );
}
