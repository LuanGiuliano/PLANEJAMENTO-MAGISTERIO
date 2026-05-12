import { ChevronDown } from "lucide-react";

export function FilterDropdown({ label, options, value, onChange }: { 
  label: string; 
  options: string[]; 
  value?: string; 
  onChange?: (val: string) => void 
}) {
  return (
    <div className="relative flex flex-col gap-1 rounded bg-[#132F4C] border border-white/5 p-2.5 transition-colors hover:border-[#F4A300]/50 group shadow-sm">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full appearance-none bg-transparent text-sm font-bold text-white outline-none cursor-pointer pr-6"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[#102A43] text-white font-medium">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-hover:text-[#F4A300] transition-colors" />
      </div>
    </div>
  );
}