import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Filter, Users, Eye, Zap, Lock } from "lucide-react";

export default function LandingPage() {
  const nav = useNavigate();

  const features = [
    { icon: Filter, title: "Precise filters", body: "Share by label, sender, subject, or date range. Recipients see only what you allow." },
    { icon: Shield, title: "Zero credential exposure", body: "Your password never leaves you. OAuth tokens stay server-side, encrypted at rest." },
    { icon: Users, title: "Multiple recipients", body: "Grant the same filtered view to your whole team, contractors, or auditors." },
    { icon: Eye, title: "Audit log", body: "Every share, view, and revoke is logged. Know exactly who accessed what." },
    { icon: Zap, title: "Gmail & Outlook", body: "Connect both providers in the same workspace. Filters work across accounts." },
    { icon: Lock, title: "Revoke anytime", body: "One click to cut off access. Recipients lose the view instantly." },
  ];

  return (
    <div className="min-h-screen bg-white brutalist-grid-bg font-body">
      {/* NAV */}
      <nav className="border-b border-black bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <span className="font-heading font-black text-lg tracking-tighter">MAILSHARE</span>
          <div className="flex items-center gap-0">
            <button
              onClick={() => nav("/login")}
              className="px-5 py-2 text-sm font-medium border-r border-black hover:bg-neutral-100 transition-colors"
              data-testid="nav-login"
            >
              Sign in
            </button>
            <button
              onClick={() => nav("/register")}
              className="px-5 py-2 text-sm font-medium bg-black text-white hover:bg-[#002FA7] transition-colors"
              data-testid="nav-register"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 border-b border-black">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="overline mb-6">Email access, redefined</p>
            <h1 className="font-heading font-black text-5xl sm:text-6xl tracking-tighter leading-none mb-8">
              Share your inbox<br />
              <span className="klein">without sharing</span><br />
              your password.
            </h1>
            <p className="text-neutral-600 text-lg leading-relaxed mb-10 max-w-md">
              Give teammates, clients, or auditors a filtered view of your Gmail or Outlook. 
              They see exactly what you choose — nothing else. Revoke in one click.
            </p>
            <div className="flex gap-0">
              <button
                onClick={() => nav("/register")}
                className="flex items-center gap-2 bg-black text-white px-8 py-3.5 font-medium hard-shadow hover:bg-[#002FA7] transition-colors"
                data-testid="hero-cta"
              >
                Start for free <ArrowRight size={16} />
              </button>
              <button
                onClick={() => nav("/login")}
                className="flex items-center gap-2 border border-black px-8 py-3.5 font-medium hover:bg-neutral-50 transition-colors"
              >
                Sign in
              </button>
            </div>
          </div>

          {/* Mock UI preview */}
          <div className="border border-black hard-shadow-sm bg-white hidden lg:block">
            <div className="border-b border-black bg-neutral-50 px-4 py-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-black" />
              <div className="w-3 h-3 rounded-full border border-black" />
              <div className="w-3 h-3 rounded-full border border-black" />
              <span className="font-mono text-xs text-neutral-500 ml-2">mailshare.app/shared/inv_abc123</span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">Shared view</p>
                  <p className="font-heading font-bold text-sm mt-0.5">Finance — from billing@stripe.com</p>
                </div>
                <span className="border border-black font-mono text-xs px-2 py-0.5 bg-green-50 text-green-800">Active</span>
              </div>
              {[
                { from: "Stripe", subj: "Invoice January — $129.00", time: "2h ago" },
                { from: "AWS", subj: "Billing alert: $312 this month", time: "1d ago" },
                { from: "Vercel", subj: "Pro plan renewed — $20", time: "3d ago" },
              ].map((e, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-neutral-100 last:border-0">
                  <div className="w-7 h-7 border border-black bg-neutral-100 flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 mt-0.5">
                    {e.from[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{e.from}</p>
                    <p className="text-xs text-neutral-500 truncate">{e.subj}</p>
                  </div>
                  <span className="text-xs text-neutral-400 flex-shrink-0">{e.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-b border-black bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 divide-x divide-neutral-700">
          {[
            { n: "2", label: "Email providers" },
            { n: "∞", label: "Filters per account" },
            { n: "1-click", label: "Revoke access" },
          ].map((s) => (
            <div key={s.label} className="py-8 px-8 text-center">
              <p className="font-heading font-black text-4xl tracking-tighter mb-1">{s.n}</p>
              <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-b border-black">
        <p className="overline mb-3">How it works</p>
        <h2 className="font-heading font-bold text-3xl tracking-tight mb-12">Everything you need, nothing you don't.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black border border-black">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white p-8 hover:bg-neutral-50 transition-colors">
              <div className="w-10 h-10 border border-black flex items-center justify-center mb-5">
                <Icon size={18} />
              </div>
              <h3 className="font-heading font-bold text-base mb-2">{title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS STEPS */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-b border-black">
        <p className="overline mb-3">Three steps</p>
        <h2 className="font-heading font-bold text-3xl tracking-tight mb-12">Up and running in minutes.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black border border-black">
          {[
            { n: "01", title: "Connect your email", body: "Authorise Gmail or Outlook via OAuth. Your credentials never touch our servers." },
            { n: "02", title: "Define a filter", body: "Set rules: show only emails from billing@stripe.com, label Finance, last 30 days." },
            { n: "03", title: "Share with a recipient", body: "Enter a recipient email. They get a view-only link to exactly those emails." },
          ].map((s) => (
            <div key={s.n} className="bg-white p-10">
              <span className="font-heading font-black text-5xl text-neutral-200 block mb-4">{s.n}</span>
              <h3 className="font-heading font-bold text-lg mb-3">{s.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#002FA7] text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-heading font-black text-3xl tracking-tight mb-2">Ready to share smarter?</h2>
            <p className="text-blue-200 text-sm">Free to start. No credit card required.</p>
          </div>
          <button
            onClick={() => nav("/register")}
            className="flex items-center gap-2 bg-white text-black px-8 py-3.5 font-medium hard-shadow hover:bg-neutral-100 transition-colors flex-shrink-0"
            data-testid="footer-cta"
          >
            Create your account <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="font-heading font-black text-sm tracking-tighter">MAILSHARE</span>
          <p className="font-mono text-xs text-neutral-400">© 2025 Mailshare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
