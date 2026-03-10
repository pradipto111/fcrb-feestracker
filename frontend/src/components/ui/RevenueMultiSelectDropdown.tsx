import React, { useEffect, useMemo, useRef, useState } from "react";

type RevenueMultiSelectOption = {
  value: string;
  label: string;
};

type RevenueMultiSelectDropdownProps = {
  label: string;
  options: RevenueMultiSelectOption[];
  selectedValues: string[];
  onChange: (nextValues: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
};

export const RevenueMultiSelectDropdown: React.FC<RevenueMultiSelectDropdownProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "All",
  searchPlaceholder = "Search...",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const selectedSummary = useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const option = options.find((item) => item.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    return `${selectedValues.length} selected`;
  }, [options, placeholder, selectedValues]);

  useEffect(() => {
    if (!open) return;
    const onDocumentPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocumentPointerDown);
    return () => document.removeEventListener("mousedown", onDocumentPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      return;
    }
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const toggleValue = (value: string) => {
    const next = new Set(selectedSet);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onChange(Array.from(next));
  };

  return (
    <div className="rv-filter-field rv-multi-select" ref={containerRef}>
      <label>{label}</label>
      <button
        type="button"
        className={`rv-multi-select__trigger${open ? " rv-multi-select__trigger--open" : ""}`}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="rv-multi-select__summary">{selectedSummary}</span>
        <span className="rv-multi-select__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="rv-multi-select__panel" role="dialog" aria-label={`${label} options`}>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="rv-multi-select__search"
          />

          <div className="rv-multi-select__list" role="listbox" aria-multiselectable="true">
            {filteredOptions.length === 0 ? (
              <div className="rv-multi-select__empty">No matching options</div>
            ) : (
              filteredOptions.map((option) => {
                const checked = selectedSet.has(option.value);
                return (
                  <label key={option.value} className="rv-multi-select__option">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleValue(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
