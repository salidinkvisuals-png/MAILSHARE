import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "@/lib/auth";
import { toast } from "sonner";
import { Plus, Trash2, Mail, Loader2, ChevronRight, RefreshCw } from "lucide-react";

const PROVIDERS = [
  { id: "gmail", label: "Gmail", color: "bg-red-50 text-red-600" },
  { id: "outlook", label: "Outlook", color: "bg-blue-50 text-blue-600" },
  { id: "yahoo", label: "Yahoo", color: "bg-purple-50 text-purple-600" },
  { id: "icloud", label: "iCloud", color: "bg-gray-50 text-gray-600" },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ provider: "yahoo", email: "", label: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [syncing, setSyncing] = useState(null);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const nav = useNavigate();

  const load = () =>
    API.get("/api/accounts")
      .then((r) => setAccounts(r.data))
      .catch(() => toast.error("Failed to load accounts"))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "gmail") {
      toast.success("Gmail account connected!");
      window.history.replaceState({}, "", "/app/accounts");
      load();
    }
    if (params.get("error")) {
      toast.error(`Gmail connection failed: ${params.get("error")}`);
      window.history.replaceState({}, "", "/app/accounts");
    }
  }, []);

  const connectGmail = async () => {
    setConnectingGmail(true);
    try {
      const r = await API.get("/api/auth/gmail/url");
      window.location.href = r.data.url;
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to start Gmail connection");
      setConnectingGmail(false);
    }
  };

  const syncAccount = async (id) => {
    setSyncing(id);
    try {
      // force=true deletes old emails and re-fetches fresh from Gmail
      const r = await API.post(`/api/accounts/${id}/sync?force=true`);
      toast.success(`Synced ${r.data.synced} emails`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Sync failed");
    } finally {
      setSyncing(null);
    }
  };

  const connect = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/api/accounts", form);
      toast.success("Account connected");
      setShowForm(false);
      setForm({ provider: "yahoo", email: "", label: "" });
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
          <p className="text-sm text-gray-400 mb-1">Email accounts</p>
          <h1 className="text-2xl font-bold text-gray-900">Connected accounts</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={connectGmail}
            disabled={connectingGmail}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60"
            data-testid="btn-connect-gmail"
          >
            {connectingGmail ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
            Connect Gmail
          </button>
          <button
            onClick={() => setShowForm((p) => !p)}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            data-testid="btn-add-account"
          >
            <Plus size={15} />
            Other
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
        <Mail size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-purple-900">Connect your real Gmail account</p>
          <p className="text-xs text-purple-600 mt-0.5">Click "Connect Gmail" to authorize with Google OAuth. Your emails will be synced securely. Use the refresh icon to force a full re-sync.</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={connect} className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 animate-fade-up" data-testid="account-form">
          <p className="text-sm font-semibold text-gray-700 mb-4">Connect other provider</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Provider</label>
              <select
                value={form.provider}
                onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {PROVIDERS.filter(p => p.id !== "gmail").map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Email address</label>
              <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@outlook.com" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Label (optional)</label>
              <input type="text" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Work, Personal…" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60">
              {saving && <Loader2 size={14} className="animate-spin" />} Connect
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={20} className="animate-spin text-purple-400" /></div>
      ) : accounts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center" data-testid="accounts-empty">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail size={24} className="text-purple-400" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">No accounts connected</p>
          <p className="text-sm text-gray-400 mb-6">Connect your first Gmail account to get started.</p>
          <button onClick={connectGmail} disabled={connectingGmail} className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 mx-auto">
            {connectingGmail ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />} Connect Gmail
          </button>
        </div>
      ) : (
        <div className="space-y-3" data-testid="accounts-table">
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-5 py-4 bg-white border border-gray-100 rounded-2xl hover:border-purple-200 transition-colors" data-testid={`account-row-${a.id}`}>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                {a.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{a.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PROVIDERS.find(p => p.id === a.provider)?.color || "bg-gray-50 text-gray-500"}`}>
                    {PROVIDERS.find(p => p.id === a.provider)?.label || a.provider}
                  </span>
                  <span className="text-xs bg-green-50 text-green-600 font-medium px-2 py-0.5 rounded-full">{a.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => nav(`/app/accounts/${a.id}`)}
                  className="flex items-center gap-1.5 bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Open inbox
                  <ChevronRight size={15} />
                </button>
                {a.provider === "gmail" && (
                  <button
                    onClick={() => syncAccount(a.id)}
                    disabled={syncing === a.id}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                    title="Force re-sync emails from Gmail"
                  >
                    {syncing === a.id ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  </button>
                )}
                <button
                  onClick={() => remove(a.id)}
                  disabled={deleting === a.id}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition-colors"
                  title="Disconnect account"
                >
                  {deleting === a.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
