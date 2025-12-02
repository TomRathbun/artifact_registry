

import ReactMarkdown from 'react-markdown';
import type { VisionOut } from '../client/models/VisionOut';

interface VisionHeaderProps {
    vision: VisionOut;
}

export default function VisionHeader({ vision }: VisionHeaderProps) {
    if (!vision) return null;
    return (
        <div className="p-4 bg-white rounded shadow mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Vision: {vision.title}</h2>
            <div className="text-slate-600 mt-2 prose prose-sm max-w-none">
                <ReactMarkdown>{vision.description || ''}</ReactMarkdown>
            </div>
        </div>
    );
}
