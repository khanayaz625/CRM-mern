import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

const MultiSelect = ({ options, selected, onChange, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (value) => {
        const newSelected = selected.includes(value)
            ? selected.filter(item => item !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    const clearSelection = (e) => {
        e.stopPropagation();
        onChange([]);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-surface border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 text-white min-w-[200px]"
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="truncate text-gray-300">
                        {selected.length === 0
                            ? placeholder
                            : selected.length === 1
                                ? options.find(o => o.value === selected[0])?.label
                                : `${selected.length} Selected`}
                    </span>
                    {selected.length > 0 && (
                        <span onClick={clearSelection} className="text-gray-500 hover:text-white cursor-pointer p-0.5 rounded-full hover:bg-white/10">
                            <X size={12} />
                        </span>
                    )}
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[220px] bg-[#1a1a1a] border border-white/20 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-100">
                    {options.map(option => (
                        <div
                            key={option.value}
                            onClick={() => toggleOption(option.value)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${selected.includes(option.value) ? 'bg-primary/20 text-white' : 'hover:bg-white/5 text-gray-300'}`}
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.includes(option.value) ? 'bg-primary border-primary' : 'bg-transparent border-white/30'}`}>
                                {selected.includes(option.value) && <Check size={10} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium">{option.label}</span>
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="p-3 text-center text-sm text-muted">No options available</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
