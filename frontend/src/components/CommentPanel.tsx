import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Trash2, MessageSquare } from 'lucide-react';

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
}

interface CommentPanelProps {
    artifactAid: string;
    selectedField: string | null;
    fieldLabel: string;
}

export default function CommentPanel({ artifactAid, selectedField, fieldLabel }: CommentPanelProps) {
    const [newComment, setNewComment] = useState('');
    const [currentUser] = useState('Reviewer'); // TODO: Get from auth context
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

    // Filter comments for selected field
    const fieldComments = selectedField
        ? allComments.filter(c => c.field_name === selectedField)
        : [];

    const unresolvedComments = fieldComments.filter(c => !c.resolved);
    const resolvedComments = fieldComments.filter(c => c.resolved);

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
                    author: currentUser
                })
            });
            if (!response.ok) throw new Error('Failed to create comment');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', artifactAid] });
            setNewComment('');
        }
    });

    // Resolve comment mutation
    const resolveMutation = useMutation({
        mutationFn: async (commentId: string) => {
            const response = await fetch(`/api/v1/comments/${commentId}/resolve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resolved_by: currentUser })
            });
            if (!response.ok) throw new Error('Failed to resolve comment');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', artifactAid] });
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
        if (newComment.trim()) {
            createMutation.mutate(newComment);
        }
    };

    if (!selectedField) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <MessageSquare className="w-12 h-12 mb-4" />
                <p className="text-sm">Click on a field to view or add comments</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900">Comments: {fieldLabel}</h3>
                <p className="text-xs text-slate-500 mt-1">
                    {unresolvedComments.length} unresolved, {resolvedComments.length} resolved
                </p>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Unresolved Comments */}
                {unresolvedComments.length > 0 && (
                    <div className="space-y-3">
                        {unresolvedComments.map(comment => (
                            <div key={comment.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <span className="text-sm font-medium text-slate-900">{comment.author}</span>
                                        <span className="text-xs text-slate-500 ml-2">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => resolveMutation.mutate(comment.id)}
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
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.comment_text}</p>
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
                                    <div key={comment.id} className="bg-slate-50 border border-slate-200 rounded p-2 opacity-60">
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <span className="text-xs font-medium text-slate-700">{comment.author}</span>
                                                <span className="text-xs text-slate-500 ml-2">
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
                                        <p className="text-xs text-slate-600 whitespace-pre-wrap">{comment.comment_text}</p>
                                        {comment.resolved_by && (
                                            <p className="text-xs text-green-600 mt-1">
                                                ✓ Resolved by {comment.resolved_by}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </details>
                    </div>
                )}

                {/* No Comments */}
                {fieldComments.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-8">
                        No comments yet. Add one below.
                    </div>
                )}
            </div>

            {/* Add Comment */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                />
                <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || createMutation.isPending}
                    className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {createMutation.isPending ? 'Adding...' : 'Add Comment'}
                </button>
            </div>
        </div>
    );
}
