import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

const BG_URL = "https://images.unsplash.com/photo-1482053450283-3e0b78b09a70?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80";

export default function AuthPage({ mode = "login" }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [email, setEmail] = useState(isLogin ? "owner@mailshare.app" : "");
  const [password, setPassword] = useState(isLogin ? "Owner123!" : "");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = isLogin ? await login(email, password) : await register(email, password, name);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      toast.error(res.error);
      return;
    }
    toast.success(isLogin ? "Welcome back." : "Workspace created.");
    navigate("/app");
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left image panel */}
      <div className="relative hidden lg:block border-r border-neutral-900 overflow-hidden">
        <img src={BG_URL} alt="" className="absolute inset-0 w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-neutral-950/50 mix-blend-multiply" />
        <div className="relative h-full flex flex-col justify-between p-10 text-white">
          <Link to="/" className="flex items-center gap-3" data-testid="auth-logo-link">
            <div className="w-8 h-8 bg-white text-neutral-950 flex items-center justify-center font-heading font-black">M</div>
            <span className="font-heading font-bold tracking-tight text-xl">MAILSHARE</span>
          </Link>
          <div>
            <div className="overline text-neutral-300 mb-4">▸ DELEGATE · DON'T FORWARD</div>
            <h2 className="font-heading font-black text-5xl tracking-tighter leading-[1] max-w-md">
              Share <span className="text-[#FFD700]">only</span> what you intend to share.
            </h2>
            <p className="mt-6 text-neutral-300 max-w-md text-sm leading-relaxed">
              Connect a mailbox, build a filter, grant access. Revoke any time.
              Every event is logged.
            </p>
          </div>
          <div className="font-mono text-xs text-neutral-400 flex justify-between">
            <span>v0.1 MOCK</span><span>BUILT FOR OPERATORS</span>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex flex-col">
        <div className="px-6 lg:px-12 py-6 border-b border-neutral-900 flex items-center justify-between">
          <Link to="/" className="font-mono text-xs uppercase tracking-wider hover:text-[#002FA7]" data-testid="auth-back-home">← Home</Link>
          <Link to={isLogin ? "/register" : "/login"} className="font-mono text-xs uppercase tracking-wider inline-flex items-center gap-1 hover:text-[#002FA7]" data-testid="auth-switch-mode">
            {isLogin ? "Create workspace" : "Sign in"} <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12">
          <form onSubmit={onSubmit} className="w-full max-w-md" data-testid={isLogin ? "login-form" : "register-form"}>
            <div className="overline mb-3">{isLogin ? "01 · SIGN IN" : "01 · CREATE WORKSPACE"}</div>
            <h1 className="font-heading font-black tracking-tighter text-4xl sm:text-5xl leading-none">
              {isLogin ? "Welcome back." : "New workspace."}
            </h1>
            <p className="mt-3 text-neutral-600 text-sm">
              {isLogin ? "Sign in to manage shares, filters, and audits." : "Spin up a workspace in 10 seconds. No card."}
            </p>

            {!isLogin && (
              <div className="mt-8">
                <label className="overline">Display name</label>
                <input
                  data-testid="auth-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#002FA7]"
                  placeholder="Founder"
                />
              </div>
            )}

            <div className={isLogin ? "mt-8" : "mt-5"}>
              <label className="overline">Email</label>
              <input
                data-testid="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#002FA7]"
                placeholder="you@company.com"
              />
            </div>

            <div className="mt-5">
              <label className="overline">Password</label>
              <input
                data-testid="auth-password-input"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full border border-neutral-950 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#002FA7]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div data-testid="auth-error" className="mt-5 border border-[#FF2A00] bg-[#FF2A00]/5 px-4 py-3 font-mono text-xs text-[#FF2A00]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid={isLogin ? "login-submit-button" : "register-submit-button"}
              className="mt-8 w-full bg-neutral-950 text-white px-6 py-4 font-mono text-sm uppercase tracking-wider hard-shadow-sm hover:bg-[#002FA7] transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "…" : isLogin ? "Sign in" : "Create workspace"} <ArrowRight size={16} />
            </button>

            {isLogin && (
              <div className="mt-6 border border-neutral-200 bg-neutral-50 p-4 font-mono text-[11px] text-neutral-600">
                <div className="text-[#002FA7] mb-2">▸ DEMO CREDENTIALS</div>
                <div>OWNER  → owner@mailshare.app  /  Owner123!</div>
                <div>VIEWER → viewer@mailshare.app /  Viewer123!</div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
