"use client";

import { useState } from "react";

const data = {
  "7 days": ["0,130 95,118 190,122 285,88 380,96 475,70 585,52", "12 Aug", "18 Aug"],
  "30 days": ["0,140 95,126 190,111 285,100 380,82 475,67 585,48", "20 Jul", "18 Aug"],
  "90 days": ["0,146 95,134 190,119 285,95 380,84 475,55 585,40", "21 May", "18 Aug"],
} as const;

export function DashboardActivityCard() {
  const [period, setPeriod] = useState<keyof typeof data>("7 days");
  const [points, start, end] = data[period];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-900">Marketplace activity</h2>
          <p className="mt-0.5 text-xs text-slate-500">Listings created vs. new users</p>
        </div>
        <div className="flex self-start rounded-xl bg-slate-100 p-1 text-[10px] font-bold text-slate-500" role="group" aria-label="Activity period">
          {(Object.keys(data) as (keyof typeof data)[]).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setPeriod(item)}
              aria-pressed={item === period}
              className={`min-h-11 rounded-xl px-3 py-2 transition ${
                item === period ? "bg-white text-slate-800 shadow-sm" : "hover:text-slate-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-4 h-[230px] w-full overflow-hidden" aria-label="Marketplace activity chart" role="img">
        <div className="absolute inset-0 flex flex-col justify-between pb-7 text-[10px] text-slate-400">
          {["20k", "15k", "10k", "5k", "0"].map((value) => (
            <div key={value} className="flex items-center gap-2">
              <span className="w-7">{value}</span><span className="h-px flex-1 bg-slate-100" />
            </div>
          ))}
        </div>
        <svg viewBox="0 0 585 150" preserveAspectRatio="none" className="absolute bottom-7 left-9 h-[175px] w-[calc(100%-42px)] overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b63f6" stopOpacity=".16" />
              <stop offset="100%" stopColor="#0b63f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline points={`${points} 585,150 0,150`} fill="url(#dash-area)" stroke="none" />
          <polyline points="0,124 45,119 90,114 135,108 180,111 225,95 270,101 315,89 360,92 405,77 450,81 495,68 540,72 585,58" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
          <polyline points={points} fill="none" stroke="#0b63f6" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="absolute bottom-0 left-10 right-0 flex justify-between text-[10px] text-slate-400"><span>{start}</span><span>{end}</span></div>
      </div>

      <div className="mt-2 flex items-center gap-5 text-[11px] font-semibold text-slate-500">
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#0b63f6]" />Listings</span>
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-slate-400" />Users</span>
      </div>
    </div>
  );
}
