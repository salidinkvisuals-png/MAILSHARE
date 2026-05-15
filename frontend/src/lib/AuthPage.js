import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AuthPage({ mode }) {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const nav = useNavigate();
  const isLogin = mode === "login";

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password, form.name);
      }
      nav("/app");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-body grid grid-cols-1 lg:grid-cols-2">
      {/* Left — decorative */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 bg-black text-white noise-overlay"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1482053450283-3e0b78b09a70?crop=entropy&cs=srgb&fm=jpg&q=85&w=800')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-black bg-opacity-50 absolute inset-0" />
        <div className="relative z-10">
          <span className="font-heading font-black text-xl tracking-tighter">MAILSHARE</span>
        </div>
        <div className="relative z-10">
          <blockquote className="font-heading font-bold text-3xl leading-tight mb-4">
            "Share what they need.<br />Hide what they don't."
          </blockquote>
          <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
            Email access without credential exposure.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <div className="lg:hidden mb-8">
              <span className="font-heading font-black text-xl tracking-tighter">MAILSHARE</span>
            </div>
            <p className="overline mb-2">{isLogin ? "Welcome back" : "Get started"}</p>
            <h1 className="font-heading font-bold text-3xl tracking-tight">
              {isLogin ? "Sign in to your workspace" : "Create your account"}
            </h1>
          </div>

          <form onSubmit={submit} className="space-y-4" data-testid="auth-form">
            {!isLogin && (
              <div>
                <label className="overline block mb-1.5">Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Jane Smith"
                  className="w-full border border-black px-4 py-3 text-sm focus:outline-none focus:border-[#002FA7] bg-white"
                  data-testid="input-name"
                />
              </div>
            )}

            <div>
              <label className="overline block mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="you@company.com"
                className="w-full border border-black px-4 py-3 text-sm focus:outline-none focus:border-[#002FA7] bg-white"
                data-testid="input-email"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="overline block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={set("password")}
                  placeholder={isLogin ? "Your password" : "Min. 6 characters"}
                  className="w-full border border-black px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#002FA7] bg-white"
                  data-testid="input-password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 font-medium flex items-center justify-center gap-2 hover:bg-[#002FA7] transition-colors disabled:opacity-60"
              data-testid="auth-submit"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isLogin ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-200 text-center">
            <p className="text-sm text-neutral-500">
              {isLogin ? "No account yet?" : "Already have an account?"}{" "}
              <Link
                to={isLogin ? "/register" : "/login"}
                className="text-black font-medium underline underline-offset-2 hover:text-[#002FA7]"
                data-testid="auth-switch"
              >
                {isLogin ? "Sign up free" : "Sign in"}
              </Link>
            </p>
          </div>

          {isLogin && (
            <div className="mt-4 p-4 border border-neutral-200 bg-neutral-50">
              <p className="font-mono text-xs text-neutral-500 mb-1">Demo credentials</p>
              <p className="font-mono text-xs">owner@mailshare.app / Owner123!</p>
              <p className="font-mono text-xs text-neutral-400">viewer@mailshare.app / Viewer123!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
