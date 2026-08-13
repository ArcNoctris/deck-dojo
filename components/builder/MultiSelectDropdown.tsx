'use client';

import React, { useState } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

/** For tags with too many options to browse as a flat chip row (e.g. Archetype, Race). */
export const MultiSelectDropdown = ({ label, options, selected, onChange }: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const summary = selected.length === 0
    ? `Any ${label.toLowerCase()}`
    : selected.length <= 2
      ? selected.join(', ')
      : `${selected.length} selected`;

  return (
    <div>
      <span className="font-mono font-bold text-[9.5px] tracking-widest text-[var(--color-arcade-cyan)]">{label}</span>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-2 w-full h-10 px-3 flex items-center justify-between bg-[var(--color-arcade-surface)] border border-[var(--color-arcade-border)] rounded-lg"
      >
        <span
          className="font-heading font-semibold text-[12.5px] truncate text-left"
          style={{ color: selected.length > 0 ? 'var(--color-arcade-text)' : 'var(--color-arcade-text-muted)' }}
        >
          {summary}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[var(--color-arcade-text-muted)] flex-none ml-2" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-[var(--color-arcade-bg)] z-50 flex flex-col">
          <div className="flex-none px-4 pt-4 flex items-center justify-between">
            <span className="font-mono font-bold text-xs tracking-widest text-[var(--color-arcade-text-muted)]">{label.toUpperCase()}</span>
            <button onClick={() => setIsOpen(false)} className="w-7 h-7 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-none px-4 pt-3.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-arcade-text-muted)]" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}`}
                className="w-full h-9 pl-9 pr-3 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg font-mono font-semibold text-xs text-[var(--color-arcade-text)] outline-none focus:border-[var(--color-arcade-cyan)]"
              />
            </div>
          </div>

          {selected.length > 0 && (
            <div className="flex-none px-4 pt-3 flex flex-wrap gap-1.5">
              {selected.map((v) => (
                <button
                  key={v}
                  onClick={() => toggle(v)}
                  className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-[rgba(25,211,206,.14)] border border-[var(--color-arcade-cyan)]"
                >
                  <span className="font-mono font-semibold text-[10px] text-[var(--color-arcade-cyan)]">{v}</span>
                  <X className="w-2.5 h-2.5 text-[var(--color-arcade-cyan)]" />
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto thin-scroll px-4 py-3 flex flex-col gap-0.5">
            {filtered.length === 0 ? (
              <div className="text-center font-mono text-xs text-[var(--color-arcade-text-muted)] py-8">No matches</div>
            ) : (
              filtered.map((opt) => {
                const active = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggle(opt)}
                    className="h-10 px-3 rounded-lg flex items-center justify-between text-left flex-none"
                    style={{ background: active ? 'rgba(25,211,206,.12)' : 'transparent' }}
                  >
                    <span
                      className="font-heading font-semibold text-[13px]"
                      style={{ color: active ? 'var(--color-arcade-cyan)' : 'var(--color-arcade-text)' }}
                    >
                      {opt}
                    </span>
                    {active && <Check className="w-4 h-4 text-[var(--color-arcade-cyan)] flex-none" />}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex-none px-4 py-3.5">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full h-[42px] bg-[var(--color-arcade-cyan)] rounded-lg font-heading font-bold text-xs tracking-wide text-[var(--color-arcade-bg)]"
            >
              DONE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
