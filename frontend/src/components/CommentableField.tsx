import { type ReactNode } from 'react';
import { MessageSquare } from 'lucide-react';

interface CommentableFieldProps {
    fieldName: string;
    artifactAid: string;
    commentCount: number;
    onClick: () => void;
    isSelected: boolean;
    children: ReactNode;
}

export default function CommentableField({
    fieldName,
    commentCount,
    onClick,
    isSelected,
    children
}: CommentableFieldProps) {
    return (
        <div
            onClick={onClick}
            className={`
                relative cursor-pointer transition-all rounded-sm
                ${isSelected ? 'bg-blue-50 ring-2 ring-blue-400' : 'hover:bg-blue-25'}
                ${commentCount > 0 ? 'pr-12' : ''}
            `}
            title={`Click to view/add comments for ${fieldName}`}
        >
            {children}

            {commentCount > 0 && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    <MessageSquare className="w-3 h-3" />
                    <span>{commentCount}</span>
                </div>
            )}
        </div>
    );
}
