import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, Filter, Share2, ShieldCheck, Eye, Send } from "lucide-react";

const HEADLINE_WORDS = ["SHARE", "INBOX", "ACCESS", "—", "WITHOUT", "SHARING", "PASSWORDS."];

const FEATURES = [
  { icon: Mail, title: "Link any mailbox", text: "Connect Gmail, Outlook, Yahoo, iCloud — keep credentials private." },
  { icon: Filter, title: "Slice with filters", text: "Sender, subject, label, date range. Stack rules. Preview instantly." },
  { icon: Share2, title: "Delegate access", text: "Share only what matches the filter. Revoke in one click." },
  { icon: Send, title: "Or forward instead", text: "Optionally forward matching mail to an external address." },
  { icon: ShieldCheck, title: "Audit every action", text: "Every connect, share, revoke and view is logged." },
  { icon: Eye, title: "Recipient view", text: "Shared users log in and see only what you allowed. Nothing more." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-950">
      {/* Nav */}
      <header className="border-b border-neutral-900">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-neutral-950 flex items-center justify-center">
              <span className="font-heading font-black text-white text-sm">M</span>
            </div>
            <span className="font-heading font-bold text-lg tracking-tighter">MAILSHARE</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 overline">
            <a href="#features" className="hover:text-[#002FA7] transition-colors">01 · Features</a>
            <a href="#how" className="hover:text-[#002FA7] transition-colors">02 · How</a>
            <a href="#audit" className="hover:text-[#002FA7] transition-colors">03 · Audit</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" data-testid="nav-login-link" className="px-4 py-2 border border-neutral-950 font-mono text-xs uppercase tracking-wider hover:bg-neutral-950 hover:text-white transition-colors">
              Log in
            </Link>
            <Link to="/register" data-testid="nav-register-link" className="px-4 py-2 bg-neutral-950 text-white font-mono text-xs uppercase tracking-wider hard-shadow-sm hover:bg-[#002FA7] transition-colors inline-flex items-center gap-1">
              Get started <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-neutral-900 relative overflow-hidden">
        <div className="brutalist-grid-bg absolute inset-0 opacity-40" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10 relative">
          <div className="lg:col-span-8 animate-fade-up">
            <div className="overline mb-6">▸ EMAIL DELEGATION · v0.1 · MOCK MODE</div>
            <h1 className="font-heading font-black tracking-tighter text-5xl sm:text-6xl lg:text-8xl leading-[0.9]">
              {HEADLINE_WORDS.map((w, i) => (
                <span key={i} className={i === 2 ? "text-[#002FA7]" : i === 3 ? "text-[#FF2A00]" : ""}>
                  {w}{" "}
                </span>
              ))}
            </h1>
            <p className="mt-8 max-w-2xl text-base sm:text-lg text-neutral-700 leading-relaxed">
              Mailshare lets you link a mailbox, build a precise filter, and grant a teammate, accountant, or assistant
              access to <em>only the emails that match</em>. No forwarding spaghetti. No shared passwords. Auditable.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link to="/register" data-testid="hero-cta-register" className="px-6 py-4 bg-neutral-950 text-white font-mono text-sm uppercase tracking-wider hard-shadow inline-flex items-center gap-2">
                Open the workspace <ArrowUpRight size={16} />
              </Link>
              <Link to="/login" data-testid="hero-cta-login" className="px-6 py-4 border border-neutral-950 font-mono text-sm uppercase tracking-wider hover:bg-neutral-950 hover:text-white transition-colors">
                I already have an account
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-px bg-neutral-200 border border-neutral-900 max-w-2xl">
              {[
                { k: "4", v: "Providers" },
                { k: "1-click", v: "Revoke" },
                { k: "100%", v: "Auditable" },
              ].map((s) => (
                <div key={s.v} className="bg-white p-5">
                  <div className="font-heading font-black text-3xl tracking-tighter">{s.k}</div>
                  <div className="overline mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative panel */}
          <div className="lg:col-span-4 relative">
            <div className="border border-neutral-900 bg-white hard-shadow p-6">
              <div className="overline mb-4">▸ FILTER · PREVIEW</div>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-neutral-200 pb-2"><span className="text-neutral-500">from:</span><span>billing@stripe.com</span></div>
                <div className="flex justify-between border-b border-neutral-200 pb-2"><span className="text-neutral-500">subject:</span><span>invoice</span></div>
                <div className="flex justify-between border-b border-neutral-200 pb-2"><span className="text-neutral-500">label:</span><span>Finance</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">shared with:</span><span className="text-[#002FA7]">accountant@firm.com</span></div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-900">
                <div className="flex items-center justify-between">
                  <span className="overline">12 emails match</span>
                  <span className="px-2 py-1 bg-[#002FA7] text-white text-[10px] font-mono uppercase">Active</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#FF2A00] -z-10 hidden lg:block" />
          </div>
        </div>

        {/* Ticker */}
        <div className="border-t border-neutral-900 bg-neutral-950 text-white overflow-hidden">
          <div className="ticker-track whitespace-nowrap font-mono uppercase text-xs py-3 tracking-[0.2em]">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                ▸ link mailbox  ·  ▸ build filter  ·  ▸ grant access  ·  ▸ revoke anytime  ·  ▸ audit log  ·  ▸ no shared passwords  ·  ▸ delegate finance, hr, sales  ·  
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-neutral-900">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
            <div className="lg:col-span-5">
              <div className="overline mb-3">02 · CAPABILITIES</div>
              <h2 className="font-heading font-black tracking-tighter text-4xl sm:text-5xl leading-tight">
                Built like a control room, <span className="text-[#002FA7]">not a folder.</span>
              </h2>
            </div>
            <p className="lg:col-span-7 text-neutral-700 lg:pt-12 max-w-2xl text-base sm:text-lg leading-relaxed">
              Mailshare reduces email delegation to four primitives: <strong>account</strong>, <strong>filter</strong>, <strong>share</strong>, <strong>audit</strong>. Everything else is noise.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200 border border-neutral-900">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white p-8 group">
                <f.icon size={28} className="text-neutral-950 group-hover:text-[#002FA7] transition-colors" strokeWidth={1.5} />
                <h3 className="font-heading font-bold text-xl mt-6 tracking-tight">{f.title}</h3>
                <p className="mt-3 text-neutral-600 text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b border-neutral-900 bg-neutral-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20">
          <div className="overline mb-3">03 · WORKFLOW</div>
          <h2 className="font-heading font-black tracking-tighter text-4xl sm:text-5xl mb-12">Four steps. No theater.</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-neutral-900 border border-neutral-900">
            {[
              ["01", "Connect", "Link your Gmail / Outlook / Yahoo (mocked in v1)."],
              ["02", "Filter", "From, subject, label, date range — combine freely."],
              ["03", "Share", "Pick a recipient. Optionally forward to external address."],
              ["04", "Revoke", "One click. The recipient loses access immediately."],
            ].map(([n, t, d]) => (
              <div key={n} className="bg-white p-8">
                <div className="font-mono text-xs text-[#FF2A00] mb-4">[STEP {n}]</div>
                <div className="font-heading font-bold text-2xl tracking-tight">{t}</div>
                <p className="mt-3 text-sm text-neutral-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audit */}
      <section id="audit" className="border-b border-neutral-900">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <div className="overline mb-3">04 · ACCOUNTABILITY</div>
            <h2 className="font-heading font-black tracking-tighter text-4xl sm:text-5xl mb-6">Every access leaves a trace.</h2>
            <p className="text-neutral-700 max-w-xl leading-relaxed">
              Mailshare records every connect, every filter created, every share granted, every revoke and every view performed by a recipient. Your audit log is one click away.
            </p>
            <Link to="/register" className="mt-8 inline-flex items-center gap-2 px-6 py-4 bg-[#002FA7] text-white font-mono text-sm uppercase tracking-wider hard-shadow-sm">
              Start delegating <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="lg:col-span-6 border border-neutral-900 bg-white p-2">
            <div className="font-mono text-xs">
              <div className="bg-neutral-950 text-white px-4 py-2 flex justify-between"><span>AUDIT LOG · LIVE</span><span className="text-[#FF2A00]">●</span></div>
              <div className="divide-y divide-neutral-200">
                {[
                  ["12:04:21", "share.create", "accountant@firm.com  ←  Stripe Invoices"],
                  ["11:58:09", "filter.create", "Stripe Invoices  ·  3 rules"],
                  ["11:55:17", "account.connect", "gmail · founder@acme.io"],
                  ["09:31:02", "shared.view", "accountant viewed 4 emails"],
                  ["08:15:48", "share.revoke", "intern@acme.io  ⊘  HR digest"],
                ].map(([t, a, m]) => (
                  <div key={t} className="grid grid-cols-12 py-2 px-4">
                    <span className="col-span-2 text-neutral-500">{t}</span>
                    <span className="col-span-3 text-[#002FA7]">{a}</span>
                    <span className="col-span-7 truncate">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral-950 text-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 text-center">
          <div className="overline text-neutral-400 mb-3">▸ START NOW</div>
          <h2 className="font-heading font-black tracking-tighter text-4xl sm:text-6xl">Stop forwarding. Start <span className="text-[#FF2A00]">delegating.</span></h2>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/register" data-testid="footer-cta-register" className="px-8 py-4 bg-white text-neutral-950 font-mono text-sm uppercase tracking-wider hard-shadow-sm hover:bg-[#FFD700]">
              Create workspace
            </Link>
            <Link to="/login" data-testid="footer-cta-login" className="px-8 py-4 border border-white font-mono text-sm uppercase tracking-wider">
              Sign in
            </Link>
          </div>
        </div>
        <div className="border-t border-neutral-800">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 flex justify-between text-xs font-mono text-neutral-500">
            <span>© 2026 MAILSHARE · v0.1 MOCK</span>
            <span>Built brutally. Used quietly.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
