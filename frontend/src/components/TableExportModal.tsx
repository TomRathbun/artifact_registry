import { useState } from 'react';
import { X } from 'lucide-react';

interface TableExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (config: TableExportConfig) => void;
    availableColumns: { key: string; label: string }[];
    defaultTitle: string;
}

export interface TableExportConfig {
    title: string;
    columns: string[];
    truncateDescription: boolean;
}

export function TableExportModal({ isOpen, onClose, onExport, availableColumns, defaultTitle }: TableExportModalProps) {
    const [title, setTitle] = useState(defaultTitle);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(availableColumns.map(col => col.key));
    const [truncateDescription, setTruncateDescription] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string>('');

    if (!isOpen) return null;

    const toggleColumn = (columnKey: string) => {
        setSelectedColumns(prev =>
            prev.includes(columnKey)
                ? prev.filter(k => k !== columnKey)
                : [...prev, columnKey]
        );
    };

    const handleExport = () => {
        if (selectedColumns.length === 0) {
            alert('Please select at least one column');
            return;
        }
        // Preserve the original column order from availableColumns
        const orderedColumns = availableColumns
            .map(col => col.key)
            .filter(key => selectedColumns.includes(key));

        onExport({ title, columns: orderedColumns, truncateDescription });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Configure Table Export</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Table Title (optional)
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter table title..."
                        />
                    </div>

                    {/* Column Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Columns
                        </label>
                        <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                            {availableColumns.map(col => (
                                <label key={col.key} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={selectedColumns.includes(col.key)}
                                        onChange={() => toggleColumn(col.key)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{col.label}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {selectedColumns.length} column{selectedColumns.length !== 1 ? 's' : ''} selected
                        </p>
                    </div>

                    {/* Truncation Option */}
                    <div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={truncateDescription}
                                onChange={(e) => setTruncateDescription(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Truncate long descriptions (100 chars)</span>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 p-4 border-t bg-gray-50">
                    {successMessage && (
                        <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                            {successMessage}
                        </span>
                    )}
                    <div className={`flex gap-2 ${successMessage ? 'ml-auto' : 'ml-auto'}`}>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors"
                        >
                            Copy Table
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
