import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Conflict {
    type: 'Area' | 'Owner';
    value: string;
}

interface ImportConflictModalProps {
    isOpen: boolean;
    conflicts: Conflict[];
    existingAreas: { code: string; name: string }[];
    existingPeople: { id: string; name: string }[];
    onResolve: (resolutions: Map<string, string>) => void;
    onCancel: () => void;
}

export default function ImportConflictModal({
    isOpen,
    conflicts,
    existingAreas,
    existingPeople,
    onResolve,
    onCancel
}: ImportConflictModalProps) {
    const [resolutions, setResolutions] = useState<Map<string, string>>(new Map());

    // Initialize resolutions with "create_new" for all conflicts
    useEffect(() => {
        if (isOpen && conflicts.length > 0) {
            const initialResolutions = new Map<string, string>();
            conflicts.forEach(c => {
                initialResolutions.set(`${c.type}:${c.value}`, 'create_new');
            });
            setResolutions(initialResolutions);
        }
    }, [isOpen, conflicts]);

    if (!isOpen) return null;

    const handleResolutionChange = (key: string, value: string) => {
        const newResolutions = new Map(resolutions);
        newResolutions.set(key, value);
        setResolutions(newResolutions);
    };

    const handleConfirm = () => {
        onResolve(resolutions);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-slate-800">Import Conflicts Detected</h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <p className="mb-4 text-slate-600">
                        The following items in your import file do not match existing records.
                        Please choose whether to map them to an existing item or create a new one.
                    </p>

                    <div className="space-y-4">
                        {conflicts.map((conflict, index) => {
                            const key = `${conflict.type}:${conflict.value}`;
                            const currentValue = resolutions.get(key) || 'create_new';

                            return (
                                <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border">
                                    <div className="flex-1">
                                        <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                                            {conflict.type}
                                        </span>
                                        <div className="font-medium text-slate-800">{conflict.value}</div>
                                    </div>

                                    <div className="w-1/2">
                                        <select
                                            value={currentValue}
                                            onChange={(e) => handleResolutionChange(key, e.target.value)}
                                            className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="create_new" className="font-semibold text-blue-600">
                                                + Create New "{conflict.value}"
                                            </option>
                                            <optgroup label="Map to Existing">
                                                {conflict.type === 'Area' ? (
                                                    existingAreas.map(area => (
                                                        <option key={area.code} value={area.name}>
                                                            {area.name} ({area.code})
                                                        </option>
                                                    ))
                                                ) : (
                                                    existingPeople.map(person => (
                                                        <option key={person.id} value={person.name}>
                                                            {person.name}
                                                        </option>
                                                    ))
                                                )}
                                            </optgroup>
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 border-t bg-slate-50 flex justify-end gap-3 rounded-b-lg">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                    >
                        Cancel Import
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                        Confirm Import
                    </button>
                </div>
            </div>
        </div>
    );
}
