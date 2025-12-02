import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Option {
    value: string;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    className,
}: MultiSelectProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        if (value.includes(optionValue)) {
            onChange(value.filter((v) => v !== optionValue));
        } else {
            onChange([...value, optionValue]);
        }
    };

    const handleRemove = (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== optionValue));
    };



    return (
        <div className={twMerge("relative", className)} ref={containerRef}>
            <div
                className="flex min-h-[38px] w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm cursor-pointer hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setOpen(!open)}
            >
                <div className="flex flex-wrap gap-1">
                    {value.length === 0 && (
                        <span className="text-slate-500 py-1">{placeholder}</span>
                    )}
                    {value.map((v) => {
                        const label = options.find((o) => o.value === v)?.label || v;
                        return (
                            <span
                                key={v}
                                className="inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800"
                            >
                                {label}
                                <button
                                    type="button"
                                    className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full hover:bg-blue-200 focus:outline-none"
                                    onClick={(e) => handleRemove(v, e)}
                                >
                                    <X className="h-2.5 w-2.5" />
                                </button>
                            </span>
                        );
                    })}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </div>

            {open && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {options.length === 0 ? (
                        <div className="relative cursor-default select-none px-4 py-2 text-slate-500">
                            No options found.
                        </div>
                    ) : (
                        options.map((option) => (
                            <div
                                key={option.value}
                                className={clsx(
                                    "relative cursor-default select-none py-2 pl-8 pr-4 hover:bg-slate-100",
                                    value.includes(option.value) ? "bg-slate-50 text-blue-600" : "text-slate-900"
                                )}
                                onClick={() => handleSelect(option.value)}
                            >
                                <span className={clsx("block truncate", value.includes(option.value) && "font-semibold")}>
                                    {option.label}
                                </span>
                                {value.includes(option.value) && (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-blue-600">
                                        <Check className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
