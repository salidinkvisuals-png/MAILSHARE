import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Filter, Users, Eye, Zap, Lock, Mail } from "lucide-react";

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
    <div className="min-h-screen bg-white font-body">
      {/* NAV */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center">
              <Mail size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">Mailshare</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav("/login")}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50"
              data-testid="nav-login"
            >
              Sign in
            </button>
            <button
              onClick={() => nav("/register")}
              className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              data-testid="nav-register"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Zap size={14} />
            Gmail & Outlook supported
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
            Share your inbox
            <span className="text-purple-600"> without sharing</span>
            <br />your password.
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            Give teammates, clients, or auditors a filtered view of your Gmail or Outlook.
            They see exactly what you choose — nothing else.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => nav("/register")}
              className="flex items-center gap-2 bg-purple-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
              data-testid="hero-cta"
            >
              Start for free <ArrowRight size={18} />
            </button>
            <button
              onClick={() => nav("/login")}
              className="flex items-center gap-2 border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Mock UI */}
        <div className="mt-20 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-purple-100/50 overflow-hidden max-w-3xl mx-auto">
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-gray-400 mx-auto">mailshare.app/shared/inv_abc123</span>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Shared view</p>
                <p className="font-semibold text-gray-900">Finance — from billing@stripe.com</p>
              </div>
              <span className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full">Active</span>
            </div>
            {[
              { from: "Stripe", subj: "Invoice January — $129.00", time: "2h ago", color: "bg-blue-100 text-blue-700" },
              { from: "AWS", subj: "Billing alert: $312 this month", time: "1d ago", color: "bg-orange-100 text-orange-700" },
              { from: "Vercel", subj: "Pro plan renewed — $20", time: "3d ago", color: "bg-purple-100 text-purple-700" },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${e.color}`}>
                  {e.from[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{e.from}</p>
                  <p className="text-xs text-gray-400 truncate">{e.subj}</p>
                </div>
                <span className="text-xs text-gray-300">{e.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 divide-x divide-purple-500">
          {[
            { n: "2", label: "Email providers" },
            { n: "∞", label: "Filters per account" },
            { n: "1-click", label: "Revoke access" },
          ].map((s) => (
            <div key={s.label} className="py-10 px-8 text-center">
              <p className="text-4xl font-bold mb-1">{s.n}</p>
              <p className="text-purple-200 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-purple-600 font-semibold text-sm uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl font-bold text-gray-900">Everything you need, nothing you don't.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-50 transition-all">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-purple-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-purple-600 font-semibold text-sm uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-3xl font-bold text-gray-900">Up and running in minutes.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "01", title: "Connect your email", body: "Authorise Gmail or Outlook via OAuth. Your credentials never touch our servers." },
              { n: "02", title: "Define a filter", body: "Set rules: show only emails from billing@stripe.com, label Finance, last 30 days." },
              { n: "03", title: "Share with a recipient", body: "Enter a recipient email. They get a view-only link to exactly those emails." },
            ].map((s) => (
              <div key={s.n} className="bg-white rounded-2xl p-8 border border-purple-100">
                <span className="text-5xl font-bold text-purple-100 block mb-4">{s.n}</span>
                <h3 className="font-semibold text-gray-900 text-lg mb-3">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="bg-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to share smarter?</h2>
          <p className="text-purple-200 mb-8">Free to start. No credit card required.</p>
          <button
            onClick={() => nav("/register")}
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
            data-testid="footer-cta"
          >
            Create your account <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
              <Mail size={12} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Mailshare</span>
          </div>
          <p className="text-sm text-gray-400">© 2025 Mailshare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
