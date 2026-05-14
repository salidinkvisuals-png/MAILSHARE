import React, { useEffect, useState } from "react";
import api from "@/lib/api";

const COLOR = {
  "account.connect": "#002FA7",
  "account.disconnect": "#FF2A00",
  "filter.create": "#002FA7",
  "filter.delete": "#FF2A00",
  "share.create": "#00C853",
  "share.revoke": "#FF2A00",
  "shared.view": "#525252",
};

export default function ActivityPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/activity");
      setItems(data);
    })();
  }, []);

  return (
    <div className="px-6 lg:px-10 py-10 max-w-[1400px]" data-testid="activity-page">
      <div className="mb-10 animate-fade-up">
        <div className="overline">▸ 05 · ACTIVITY LOG</div>
        <h1 className="font-heading font-black tracking-tighter text-4xl sm:text-5xl mt-2">Every event, recorded.</h1>
        <p className="mt-3 text-neutral-600 max-w-xl">Append-only ledger of every action you take. Use it for audits, debugging and accountability.</p>
      </div>

      <div className="border border-neutral-900 bg-white">
        <div className="bg-neutral-950 text-white px-4 py-3 flex justify-between items-center">
          <span className="font-mono text-xs uppercase tracking-wider">▸ EVENT LEDGER</span>
          <span className="font-mono text-[11px] text-neutral-400">{items.length} events</span>
        </div>
        <div className="divide-y divide-neutral-200" data-testid="activity-list">
          {items.length === 0 && <div className="p-12 text-center font-mono text-xs text-neutral-500">No events yet.</div>}
          {items.map((i) => (
            <div key={i.id} className="grid grid-cols-12 gap-2 px-4 py-3 font-mono text-xs">
              <span className="col-span-3 text-neutral-500">{i.at}</span>
              <span className="col-span-3" style={{ color: COLOR[i.action] || "#0a0a0a" }}>{i.action}</span>
              <span className="col-span-6 text-neutral-700 truncate">
                {Object.entries(i.meta || {}).map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`).join("  ·  ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
