import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function FilterDropdown({ label, options }: { label: string; options: string[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(options[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-white"
      >
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">{label}</span>
          <span className="text-sm font-medium">{selected}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-amber-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-amber-500/20 bg-slate-900/95 backdrop-blur-md shadow-xl">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { setSelected(opt); setOpen(false); }}
              className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-amber-500/10 hover:text-amber-300 ${selected === opt ? "text-amber-400" : "text-slate-200"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
