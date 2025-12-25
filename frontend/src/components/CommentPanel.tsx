import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Trash2, MessageSquare, Quote } from 'lucide-react';

interface Comment {
    id: string;
    artifact_aid: string;
    field_name: string;
    comment_text: string;
    author: string;
    created_at: string;
    resolved: boolean;
    resolved_at?: string;
    resolved_by?: string;
    selected_text?: string;
    resolution_action?: string;
}

interface CommentPanelProps {
    artifactAid: string;
    artifactType: string;
    selectedField: string | null;
    fieldLabel: string;
    selectedText?: string | null;
    onCommentFocus?: (fieldId: string, text: string | undefined) => void;
}

const FIELD_ORDER: Record<string, string[]> = {
    need: ['area', 'level', 'owner', 'stakeholder', 'description', 'rationale', 'related_sites', 'related_components'],
    use_case: ['area', 'primary_actor', 'description', 'trigger', 'preconditions', 'mss', 'postconditions'],
    requirement: ['short_name', 'area', 'level', 'text', 'rationale'],
    vision: ['description'],
    document: ['type', 'mime_type', 'content_url', 'pdf_content', 'content_text', 'description']
};

export default function CommentPanel({ artifactAid, artifactType, selectedField, fieldLabel, selectedText, onCommentFocus }: CommentPanelProps) {
    const [newComment, setNewComment] = useState('');
    const [currentUser] = useState('Reviewer'); // TODO: Get from auth context
    const [resolvingId, setResolvingId] = useState<string | null>(null);
    const [resolutionAction, setResolutionAction] = useState('Fixed');
    const [viewMode, setViewMode] = useState<'field' | 'all'>('all');
    const queryClient = useQueryClient();

    // Fetch comments for this artifact
    const { data: allComments = [] } = useQuery<Comment[]>({
        queryKey: ['comments', artifactAid],
        queryFn: async () => {
            const response = await fetch(`/api/v1/comments/?artifact_aid=${artifactAid}`);
            if (!response.ok) throw new Error('Failed to fetch comments');
            return response.json();
        },
        enabled: !!artifactAid
    });

    // Filter comments for selected field or show all
    const displayComments = (selectedField && viewMode === 'field')
        ? allComments.filter(c => c.field_name === selectedField)
        : allComments;

    const unresolvedComments = displayComments.filter(c => !c.resolved);
    const resolvedComments = displayComments.filter(c => c.resolved);

    // Group unresolved comments by field
    const groupedComments = unresolvedComments.reduce((acc, comment) => {
        const field = comment.field_name;
        if (!acc[field]) acc[field] = [];
        acc[field].push(comment);
        return acc;
    }, {} as Record<string, Comment[]>);

    // Sort fields based on artifact definition
    const sortedFields = Object.keys(groupedComments).sort((a, b) => {
        const order = FIELD_ORDER[artifactType] || [];
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);
        // If both are found, sort by index
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        // If only A is found, it comes first
        if (indexA !== -1) return -1;
        // If only B is found, it comes first
        if (indexB !== -1) return 1;
        // If neither found, sort alphabetically (fallback) or by whatever
        return a.localeCompare(b);
    });

    // Create comment mutation
    const createMutation = useMutation({
        mutationFn: async (commentText: string) => {
            const response = await fetch('/api/v1/comments/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    artifact_aid: artifactAid,
                    field_name: selectedField,
                    comment_text: commentText,
                    author: currentUser,
                    selected_text: selectedText
                })
            });
            if (!response.ok) throw new Error('Failed to create comment');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', artifactAid] });
            setNewComment('');
            // Keep view mode as is to prevent "comments go away" confusion
        }
    });

    // Resolve comment mutation
    const resolveMutation = useMutation({
        mutationFn: async ({ commentId, action }: { commentId: string, action: string }) => {
            const response = await fetch(`/api/v1/comments/${commentId}/resolve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resolved_by: currentUser,
                    resolution_action: action
                })
            });
            if (!response.ok) throw new Error('Failed to resolve comment');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', artifactAid] });
            setResolvingId(null);
        }
    });

    // Unresolve comment mutation
    const unresolveMutation = useMutation({
        mutationFn: async (commentId: string) => {
            const response = await fetch(`/api/v1/comments/${commentId}/unresolve`, {
                method: 'PATCH'
            });
            if (!response.ok) throw new Error('Failed to unresolve comment');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', artifactAid] });
        }
    });

    // Delete comment mutation
    const deleteMutation = useMutation({
        mutationFn: async (commentId: string) => {
            const response = await fetch(`/api/v1/comments/${commentId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete comment');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', artifactAid] });
        }
    });

    const handleAddComment = () => {
        if (newComment.trim() && selectedField) {
            createMutation.mutate(newComment);
        }
    };

    const handleCommentHover = (comment: Comment | null) => {
        if (onCommentFocus && comment) {
            onCommentFocus(comment.field_name, comment.selected_text);
        } else if (onCommentFocus) {
            onCommentFocus('', undefined);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">
                        {selectedField && viewMode === 'field' ? `Comments: ${fieldLabel}` : 'All Comments'}
                    </h3>
                    {selectedField && (
                        <button
                            onClick={() => setViewMode(prev => prev === 'field' ? 'all' : 'field')}
                            className="text-xs px-2 py-1 bg-white border border-slate-300 rounded text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            {viewMode === 'field' ? 'Show All' : 'Show Field Only'}
                        </button>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                    {unresolvedComments.length} unresolved, {resolvedComments.length} resolved
                </p>
                {selectedText && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800 italic flex items-start gap-2">
                        <Quote className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        "{selectedText}"
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Unresolved Comments - Grouped */}
                {unresolvedComments.length > 0 && (
                    <div className="space-y-6">
                        {sortedFields.map(field => (
                            <div key={field} className="space-y-2">
                                {/* Field Header (Only if viewMode is 'all' and we have multiple fields) */}
                                {viewMode === 'all' && (
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                                        {field.replace(/_/g, ' ')}
                                    </div>
                                )}
                                <div className="space-y-3">
                                    {groupedComments[field].map(comment => (
                                        <div
                                            key={comment.id}
                                            className={`rounded-lg p-3 shadow-sm transition-all duration-200 ${selectedField === comment.field_name
                                                ? 'bg-blue-50 border border-blue-500 ring-1 ring-blue-500' /* Highlighted state */
                                                : 'bg-white border border-slate-200 hover:border-blue-300' /* Default state */
                                                }`}
                                            onMouseEnter={() => handleCommentHover(comment)}
                                            onMouseLeave={() => handleCommentHover(null)}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-slate-900">{comment.author}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => setResolvingId(resolvingId === comment.id ? null : comment.id)}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                        title="Resolve comment"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteMutation.mutate(comment.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete comment"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {comment.selected_text && (
                                                <div className="mb-2 pl-2 border-l-2 border-slate-200 text-xs text-slate-500 italic">
                                                    "{comment.selected_text}"
                                                </div>
                                            )}

                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.comment_text}</p>

                                            {/* Resolution Dialog */}
                                            {resolvingId === comment.id && (
                                                <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-200">
                                                    <label className="block text-xs font-medium text-slate-700 mb-1">Resolution Action:</label>
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={resolutionAction}
                                                            onChange={(e) => setResolutionAction(e.target.value)}
                                                            className="flex-1 text-xs border border-slate-300 rounded px-2 py-1"
                                                        >
                                                            <option value="Fixed">Fixed</option>
                                                            <option value="Rejected">Rejected</option>
                                                            <option value="Updated">Updated</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                        <button
                                                            onClick={() => resolveMutation.mutate({ commentId: comment.id, action: resolutionAction })}
                                                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                                        >
                                                            Confirm
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Resolved Comments */}
                {resolvedComments.length > 0 && (
                    <div className="space-y-2">
                        <details className="group">
                            <summary className="text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700">
                                Resolved Comments ({resolvedComments.length})
                            </summary>
                            <div className="mt-2 space-y-2">
                                {resolvedComments.map(comment => (
                                    <div
                                        key={comment.id}
                                        className="bg-slate-50 border border-slate-200 rounded p-2 opacity-60 hover:opacity-100 transition-opacity"
                                        onMouseEnter={() => handleCommentHover(comment)}
                                        onMouseLeave={() => handleCommentHover(null)}
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-slate-700">{comment.author}</span>
                                                    {(!selectedField || viewMode === 'all') && (
                                                        <span className="text-[10px] px-1 py-0.5 bg-white text-slate-500 rounded border border-slate-200">
                                                            {comment.field_name.replace(/_/g, ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => unresolveMutation.mutate(comment.id)}
                                                className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                                                title="Reopen comment"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {comment.selected_text && (
                                            <div className="mb-1 pl-2 border-l-2 border-slate-300 text-[10px] text-slate-500 italic">
                                                "{comment.selected_text}"
                                            </div>
                                        )}

                                        <p className="text-xs text-slate-600 whitespace-pre-wrap">{comment.comment_text}</p>
                                        {comment.resolved_by && (
                                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                <Check className="w-3 h-3" />
                                                Resolved by {comment.resolved_by}
                                                {comment.resolution_action && (
                                                    <span className="font-semibold">({comment.resolution_action})</span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </details>
                    </div>
                )}

                {/* No Comments */}
                {displayComments.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center min-h-[200px]">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm">
                            {selectedField
                                ? "No comments on this field yet."
                                : "No comments on this artifact yet."}
                        </p>
                    </div>
                )}
            </div>

            {/* Add Comment */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
                {selectedField ? (
                    <>
                        <div className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                            <span>Commenting on <span className="text-blue-600">{fieldLabel}</span></span>
                        </div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={`Add a comment to ${fieldLabel}...`}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            spellCheck={true}
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || createMutation.isPending}
                            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {createMutation.isPending ? 'Adding...' : 'Add Comment'}
                        </button>
                    </>
                ) : (
                    <div className="text-center p-2 text-slate-500 text-sm italic bg-slate-100 rounded border border-slate-200 border-dashed">
                        Select a field above to point out a specific issue or add a comment.
                    </div>
                )}
            </div>
        </div>
    );
}
