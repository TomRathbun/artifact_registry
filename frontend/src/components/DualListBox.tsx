import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, Search, ArrowUpDown, Filter } from 'lucide-react';

interface DualListBoxProps<T> {
    available: T[];
    selected: T[];
    onChange: (selected: T[]) => void;
    getKey: (item: T) => string | number;
    getLabel: (item: T) => string;
    availableLabel?: string;
    selectedLabel?: string;
    height?: string;
}

export default function DualListBox<T>({
    available,
    selected,
    onChange,
    getKey,
    getLabel,
    availableLabel = 'Available',
    selectedLabel = 'Selected',
    height = 'h-64'
}: DualListBoxProps<T>) {
    const [selectedAvailable, setSelectedAvailable] = useState<Set<string | number>>(new Set());
    const [selectedChosen, setSelectedChosen] = useState<Set<string | number>>(new Set());

    // Search, Sort, Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
    const [filterType, setFilterType] = useState<string>('all');

    // Extract unique types from available items if they have a 'type' property
    const availableTypes = useMemo(() => {
        const types = new Set<string>();
        available.forEach((item: any) => {
            if (item.type) types.add(item.type);
        });
        return Array.from(types).sort();
    }, [available]);

    // Filter out already selected items from available list
    const selectedKeys = new Set(selected.map(getKey));

    // Process available items with search, sort, and filter
    const processedAvailableItems = useMemo(() => {
        let items = available.filter(item => !selectedKeys.has(getKey(item)));

        // Filter by Type
        if (filterType !== 'all') {
            items = items.filter((item: any) => item.type === filterType);
        }

        // Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            items = items.filter(item => getLabel(item).toLowerCase().includes(lowerTerm));
        }

        // Sort
        if (sortOrder !== 'none') {
            items.sort((a, b) => {
                const labelA = getLabel(a).toLowerCase();
                const labelB = getLabel(b).toLowerCase();
                if (labelA < labelB) return sortOrder === 'asc' ? -1 : 1;
                if (labelA > labelB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return items;
    }, [available, selectedKeys, searchTerm, sortOrder, filterType, getKey, getLabel]);

    const moveToSelected = (items: T[]) => {
        onChange([...selected, ...items]);
        setSelectedAvailable(new Set());
    };

    const moveToAvailable = (keys: Set<string | number>) => {
        const newSelected = selected.filter(item => !keys.has(getKey(item)));
        onChange(newSelected);
        setSelectedChosen(new Set());
    };

    const moveAllToSelected = () => {
        onChange([...selected, ...processedAvailableItems]);
        setSelectedAvailable(new Set());
    };

    const moveAllToAvailable = () => {
        onChange([]);
        setSelectedChosen(new Set());
    };

    const handleAvailableClick = (key: string | number, isCtrlKey: boolean) => {
        const newSet = new Set(selectedAvailable);
        if (isCtrlKey) {
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
        } else {
            newSet.clear();
            newSet.add(key);
        }
        setSelectedAvailable(newSet);
    };

    const handleChosenClick = (key: string | number, isCtrlKey: boolean) => {
        const newSet = new Set(selectedChosen);
        if (isCtrlKey) {
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
        } else {
            newSet.clear();
            newSet.add(key);
        }
        setSelectedChosen(newSet);
    };

    const handleAvailableDoubleClick = (item: T) => {
        moveToSelected([item]);
    };

    const handleChosenDoubleClick = (key: string | number) => {
        moveToAvailable(new Set([key]));
    };

    const moveSelectedToChosen = () => {
        const itemsToMove = processedAvailableItems.filter(item => selectedAvailable.has(getKey(item)));
        moveToSelected(itemsToMove);
    };

    const moveSelectedToAvailable = () => {
        moveToAvailable(selectedChosen);
    };

    const toggleSort = () => {
        setSortOrder(current => {
            if (current === 'none') return 'asc';
            if (current === 'asc') return 'desc';
            return 'none';
        });
    };

    return (
        <div className="flex gap-2 items-stretch">
            {/* Available Items */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700">{availableLabel}</label>
                    <div className="flex gap-1">
                        {availableTypes.length > 0 && (
                            <div className="relative group">
                                <button
                                    type="button"
                                    className={`p-1 rounded hover:bg-slate-100 ${filterType !== 'all' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
                                    title="Filter by Type"
                                >
                                    <Filter className="w-4 h-4" />
                                </button>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                >
                                    <option value="all">All Types</option>
                                    {availableTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={toggleSort}
                            className={`p-1 rounded hover:bg-slate-100 ${sortOrder !== 'none' ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}`}
                            title="Sort Alphabetically"
                        >
                            <ArrowUpDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className={`border border-slate-300 rounded-md overflow-y-auto ${height} bg-white`}>
                    {processedAvailableItems.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-sm italic">
                            {searchTerm || filterType !== 'all' ? 'No matching items' : 'All items selected'}
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {processedAvailableItems.map(item => {
                                const key = getKey(item);
                                const isSelected = selectedAvailable.has(key);
                                return (
                                    <li
                                        key={key}
                                        onClick={(e) => handleAvailableClick(key, e.ctrlKey || e.metaKey)}
                                        onDoubleClick={() => handleAvailableDoubleClick(item)}
                                        className={`px-3 py-2 cursor-pointer text-sm transition-colors ${isSelected
                                            ? 'bg-blue-100 text-blue-900'
                                            : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        {getLabel(item)}
                                        {(item as any).type && (
                                            <span className="ml-2 text-xs text-slate-400 border border-slate-200 px-1 rounded">
                                                {(item as any).type}
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-1">Double-click or use arrows to move</p>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col justify-center gap-2 pt-8">
                <button
                    type="button"
                    onClick={moveSelectedToChosen}
                    disabled={selectedAvailable.size === 0}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    title="Move selected to chosen"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={moveAllToSelected}
                    disabled={processedAvailableItems.length === 0}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    title="Move all to chosen"
                >
                    <ChevronsRight className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={moveSelectedToAvailable}
                    disabled={selectedChosen.size === 0}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    title="Remove selected from chosen"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={moveAllToAvailable}
                    disabled={selected.length === 0}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    title="Remove all from chosen"
                >
                    <ChevronsLeft className="w-5 h-5" />
                </button>
            </div>

            {/* Selected Items */}
            <div className="flex-1 flex flex-col">
                <div className="mb-2 h-6 flex items-end">
                    <label className="block text-sm font-medium text-slate-700">{selectedLabel}</label>
                </div>
                {/* Spacer to align with search box */}
                <div className="h-[34px] mb-2"></div>

                <div className={`border border-slate-300 rounded-md overflow-y-auto ${height} bg-white`}>
                    {selected.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-sm italic">
                            No items selected
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {selected.map(item => {
                                const key = getKey(item);
                                const isSelected = selectedChosen.has(key);
                                return (
                                    <li
                                        key={key}
                                        onClick={(e) => handleChosenClick(key, e.ctrlKey || e.metaKey)}
                                        onDoubleClick={() => handleChosenDoubleClick(key)}
                                        className={`px-3 py-2 cursor-pointer text-sm transition-colors ${isSelected
                                            ? 'bg-blue-100 text-blue-900'
                                            : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        {getLabel(item)}
                                        {(item as any).type && (
                                            <span className="ml-2 text-xs text-slate-400 border border-slate-200 px-1 rounded">
                                                {(item as any).type}
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-1">Ctrl+Click to select multiple</p>
            </div>
        </div>
    );
}
