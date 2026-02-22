// @ts-nocheck
import { useState, useRef, useEffect } from 'react';

/**
 * Custom glass-style select dropdown.
 * Props:
 *   value       – current value
 *   onChange    – called as onChange({ target: { value } }) to match native select API
 *   options     – [{ value, label }]
 *   className   – extra classes on the trigger button
 *   required    – (unused visually, kept for form compat)
 *   placeholder – shown when no value matches (optional)
 */
const CustomSelect = ({ value, onChange, options = [], className = '', required, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = (val) => {
    onChange({ target: { value: val } });
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input w-full flex items-center justify-between gap-2 text-left"
      >
        <span className={selected ? 'text-white' : 'text-slate-400'}>
          {selected ? selected.label : (placeholder || 'Select…')}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-slate-950/90 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
          <div className="max-h-52 overflow-y-auto custom-scroll">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => pick(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  String(opt.value) === String(value)
                    ? 'bg-orange-500/20 text-orange-300 font-semibold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
