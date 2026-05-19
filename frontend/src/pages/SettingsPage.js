import React, { useEffect, useState } from "react";
import { API } from "@/lib/auth";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Users, User, Settings, Shield, Plus, Trash2,
  Loader2, Edit2, Check, X, Eye, EyeOff, BarChart2
} from "lucide-react";

const TABS = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "users", label: "Users", icon: Users },
  { id: "app", label: "App Settings", icon: Settings },
  { id: "stats", label: "Usage Stats", icon: BarChart2 },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "owner";
  const [tab, setTab] = useState("profile");

  const visibleTabs = isAdmin ? TABS : TABS.filter(t => t.id === "profile");

  return (
    <div className="animate-fade-up" data-testid="settings-page">
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-1">Configuration</p>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {visibleTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === id
                    ? "bg-purple-600 text-white"
                    : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === "profile" && <ProfileTab user={user} />}
          {tab === "users" && isAdmin && <UsersTab currentUser={user} />}
          {tab === "app" && isAdmin && <AppSettingsTab />}
          {tab === "stats" && isAdmin && <StatsTab />}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user }) {
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", current_password: "", new_password: "", confirm_password: "" });
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (form.new_password && form.new_password !== form.confirm_password) {
      return toast.error("New passwords don't match");
    }
    setSaving(true);
    try {
      await API.put("/api/settings/profile", {
        name: form.name,
        email: form.email,
        current_password: form.current_password,
        new_password: form.new_password,
      });
      toast.success("Profile updated!");
      setForm((f) => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">My Profile</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700 font-bold text-2xl">
          {(user?.name || user?.email || "U")[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
            user?.role === "owner" ? "bg-purple-100 text-purple-700" :
            user?.role === "admin" ? "bg-blue-100 text-blue-700" :
            "bg-gray-100 text-gray-600"
          }`}>{user?.role}</span>
        </div>
      </div>

      <form onSubmit={save} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input value={form.name} onChange={set("name")} className={inputClass} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input type="email" value={form.email} onChange={set("email")} className={inputClass} placeholder="your@email.com" />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-4">Change password</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
              <input type="password" value={form.current_password} onChange={set("current_password")} className={inputClass} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
              <input type="password" value={form.new_password} onChange={set("new_password")} className={inputClass} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
              <input type="password" value={form.confirm_password} onChange={set("confirm_password")} className={inputClass} placeholder="••••••••" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Leave password fields blank to keep your current password.</p>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60">
            {saving && <Loader2 size={15} className="animate-spin" />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showPw, setShowPw] = useState(false);

  const load = () =>
    API.get("/api/settings/users")
      .then((r) => setUsers(r.data))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/api/settings/users", form);
      toast.success("User created!");
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "user" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await API.delete(`/api/settings/users/${id}`);
      toast.success("User deleted");
      setUsers((u) => u.filter((x) => x.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete user");
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (u) => {
    setEditing(u.id);
    setEditForm({ name: u.name, role: u.role, password: "" });
  };

  const saveEdit = async (id) => {
    try {
      await API.put(`/api/settings/users/${id}`, editForm);
      toast.success("User updated!");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update user");
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white";
  const roleColor = (role) => role === "owner" ? "bg-purple-100 text-purple-700" : role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600";

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Users</h2>
          <button onClick={() => setShowForm((p) => !p)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors">
            <Plus size={15} /> Add user
          </button>
        </div>

        {showForm && (
          <form onSubmit={create} className="bg-purple-50 rounded-2xl p-5 mb-6 animate-fade-up">
            <p className="text-sm font-semibold text-gray-700 mb-4">New user</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Full name</label><input value={form.name} onChange={set("name")} placeholder="Jane Smith" className={inputClass} /></div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Email *</label><input type="email" required value={form.email} onChange={set("email")} placeholder="jane@company.com" className={inputClass} /></div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} required minLength={6} value={form.password} onChange={set("password")} placeholder="Min. 6 characters" className={inputClass + " pr-10"} />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Role</label>
                <select value={form.role} onChange={set("role")} className={inputClass}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />} Create user
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-32"><Loader2 size={20} className="animate-spin text-purple-400" /></div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="border border-gray-100 rounded-xl p-4 hover:border-purple-200 transition-colors">
                {editing === u.id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className={inputClass} />
                    <input type="password" value={editForm.password} onChange={(e) => setEditForm(f => ({ ...f, password: e.target.value }))} placeholder="New password (optional)" className={inputClass} />
                    <select value={editForm.role} onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))} className={inputClass} disabled={u.role === "owner"}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      {u.role === "owner" && <option value="owner">Owner</option>}
                    </select>
                    <div className="flex gap-2 sm:col-span-3">
                      <button onClick={() => saveEdit(u.id)} className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors"><Check size={14} /> Save</button>
                      <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 border border-gray-200 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"><X size={14} /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                      {(u.name || u.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{u.name || "—"}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColor(u.role)}`}>{u.role}</span>
                        {u.id === currentUser?.id && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">You</span>}
                      </div>
                      <p className="text-xs text-gray-400">{u.email}</p>
                      <p className="text-xs text-gray-300 mt-0.5">{u.accounts_count} accounts · {u.shares_count} shares</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(u)} className="p-2 rounded-xl hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      {u.role !== "owner" && u.id !== currentUser?.id && (
                        <button onClick={() => remove(u.id)} disabled={deleting === u.id} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          {deleting === u.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App Settings Tab ─────────────────────────────────────────────────────────
function AppSettingsTab() {
  const [form, setForm] = useState({ app_name: "", support_email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/api/settings/app")
      .then((r) => setForm({ app_name: r.data.app_name || "", support_email: r.data.support_email || "" }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/api/settings/app", form);
      toast.success("App settings saved!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white";

  if (loading) return <div className="flex items-center justify-center h-40"><Loader2 size={20} className="animate-spin text-purple-400" /></div>;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">App Settings</h2>
      <form onSubmit={save} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">App name</label>
          <input value={form.app_name} onChange={(e) => setForm(f => ({ ...f, app_name: e.target.value }))} placeholder="Mailshare" className={inputClass} />
          <p className="text-xs text-gray-400 mt-1">Displayed in the browser tab and emails.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Support email</label>
          <input type="email" value={form.support_email} onChange={(e) => setForm(f => ({ ...f, support_email: e.target.value }))} placeholder="support@yourcompany.com" className={inputClass} />
          <p className="text-xs text-gray-400 mt-1">Shown to users when they need help.</p>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">Security</p>
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Registration</p>
                <p className="text-xs text-gray-500 mt-0.5">New users can only be added by admins. Public registration is disabled.</p>
              </div>
              <span className="ml-auto text-xs bg-green-50 text-green-600 font-medium px-2 py-1 rounded-full flex-shrink-0">Secure</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60">
            {saving && <Loader2 size={15} className="animate-spin" />} Save settings
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/settings/stats")
      .then((r) => setStats(r.data))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-40"><Loader2 size={20} className="animate-spin text-purple-400" /></div>;

  const items = stats ? [
    { label: "Total users", value: stats.total_users, color: "bg-purple-50 text-purple-600" },
    { label: "Connected accounts", value: stats.total_accounts, color: "bg-blue-50 text-blue-600" },
    { label: "Filters created", value: stats.total_filters, color: "bg-green-50 text-green-600" },
    { label: "Total shares", value: stats.total_shares, color: "bg-orange-50 text-orange-600" },
    { label: "Active shares", value: stats.active_shares, color: "bg-pink-50 text-pink-600" },
    { label: "Emails indexed", value: stats.total_emails, color: "bg-indigo-50 text-indigo-600" },
  ] : [];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Usage Stats</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-2xl p-5`}>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className="text-xs font-medium opacity-70">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
