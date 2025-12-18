

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Eye } from 'lucide-react';
import MarkdownDisplay from './MarkdownDisplay';
import type { VisionOut } from '../client/models/VisionOut';

interface VisionHeaderProps {
    visions: VisionOut[];
}

export default function VisionHeader({ visions }: VisionHeaderProps) {
    if (!visions || visions.length === 0) return null;

    // --- Persistence Keys ---
    const STORAGE_KEY_SELECTED = 'selected-vision-id';
    const STORAGE_KEY_COLLAPSED = 'vision-header-collapsed';

    // --- State ---
    const [selectedId, setSelectedId] = useState<string>(() => {
        const stored = localStorage.getItem(STORAGE_KEY_SELECTED);
        // Verify stored ID exists in current visions, else default to first
        if (stored && visions.find(v => v.aid === stored)) return stored;
        return visions[0].aid;
    });

    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEY_COLLAPSED) === 'true';
    });

    // --- Effects ---
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_SELECTED, selectedId);
    }, [selectedId]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_COLLAPSED, isCollapsed.toString());
    }, [isCollapsed]);

    // Derived
    const selectedVision = visions.find(v => v.aid === selectedId) || visions[0];

    return (
        <div className="bg-white rounded shadow mb-4 border border-slate-200 overflow-hidden">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                        title={isCollapsed ? "Expand Vision" : "Collapse Vision"}
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>

                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-slate-700">Project Vision</span>
                    </div>

                    {/* Selector (only if multiple) */}
                    {visions.length > 1 && (
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            className="ml-2 text-sm border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-1 pl-2 pr-8"
                            onClick={(e) => e.stopPropagation()} // Prevent collapse trigger if we had one on the bar
                        >
                            {visions.map(v => (
                                <option key={v.aid} value={v.aid}>
                                    {v.title}
                                </option>
                            ))}
                        </select>
                    )}
                    {visions.length === 1 && (
                        <span className="ml-2 text-sm text-slate-500 font-medium">{selectedVision.title}</span>
                    )}
                </div>
            </div>

            {/* Content Body */}
            {!isCollapsed && (
                <div className="p-4 bg-slate-50/50">
                    <div className="prose prose-sm max-w-none text-slate-700">
                        <MarkdownDisplay content={selectedVision.description || ''} />
                    </div>
                </div>
            )}
        </div>
    );
}
