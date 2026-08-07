import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Copy, Image as ImageIcon, Check, Trash2, Edit2, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ProjectsService, ImagesService } from '../client';

interface ImageFile {
    filename: string;
    url: string;
    size: number;
    created: number;
    project_id?: string;
}

const ImageGallery: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => ProjectsService.getProjectApiV1ProjectsProjectIdGet(projectId!),
        enabled: !!projectId
    });

    const realProjectId = project?.id || projectId;

    const { data: images, isLoading } = useQuery<ImageFile[]>({
        queryKey: ['images', realProjectId],
        queryFn: async () => {
            const data = await ImagesService.listImagesApiV1ImagesGet(realProjectId);
            return data as ImageFile[];
        },
        enabled: !!realProjectId
    });

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            await ImagesService.uploadImageApiV1ImagesUploadPost({
                file,
                project_id: realProjectId,
            } as any);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images'] });
            setUploading(false);
        },
        onError: (error) => {
            console.error('Upload failed:', error);
            setUploading(false);
            alert('Failed to upload image');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (filename: string) => {
            await ImagesService.deleteImageApiV1ImagesFilenameDelete(filename);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images'] });
        },
        onError: (error) => {
            console.error('Delete failed:', error);
            alert('Failed to delete image');
        }
    });

    const [renamingImage, setRenamingImage] = useState<string | null>(null);
    const [newFilename, setNewFilename] = useState('');

    const renameMutation = useMutation({
        mutationFn: async ({ oldName, newName }: { oldName: string; newName: string }) => {
            await ImagesService.renameImageApiV1ImagesFilenameRenamePut(oldName, {
                new_filename: newName,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images'] });
            setRenamingImage(null);
            setNewFilename('');
        },
        onError: (error: any) => {
            console.error('Rename failed:', error);
            alert(error?.body?.detail || error?.message || 'Failed to rename image');
        }
    });

    const startRenaming = (filename: string) => {
        setRenamingImage(filename);
        setNewFilename(filename);
    };

    const submitRename = () => {
        if (renamingImage && newFilename && newFilename !== renamingImage) {
            renameMutation.mutate({ oldName: renamingImage, newName: newFilename });
        } else {
            setRenamingImage(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            uploadMutation.mutate(e.target.files[0]);
        }
    };

    const handleDelete = (filename: string) => {
        if (confirm(`Are you sure you want to delete ${filename}?`)) {
            deleteMutation.mutate(filename);
        }
    };

    const copyToClipboard = (url: string) => {
        const markdown = `![](${url})`;
        navigator.clipboard.writeText(markdown);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Image Gallery</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Upload images for use in artifact documentation (Markdown)
                    </p>
                </div>
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading images...</div>
            ) : !images || images.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No images yet. Upload one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div
                            key={img.filename}
                            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                <img
                                    src={img.url}
                                    alt={img.filename}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="p-3">
                                {renamingImage === img.filename ? (
                                    <div className="flex gap-1 mb-2">
                                        <input
                                            value={newFilename}
                                            onChange={(e) => setNewFilename(e.target.value)}
                                            className="flex-1 text-xs border rounded px-2 py-1"
                                            onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                                            autoFocus
                                        />
                                        <button onClick={submitRename} className="p-1 text-green-600">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setRenamingImage(null)} className="p-1 text-slate-400">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium text-slate-700 truncate mb-1" title={img.filename}>
                                        {img.filename}
                                    </p>
                                )}
                                <p className="text-xs text-slate-400 mb-2">{formatSize(img.size || 0)}</p>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => copyToClipboard(img.url)}
                                        className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                                        title="Copy Markdown"
                                    >
                                        {copiedUrl === img.url ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copiedUrl === img.url ? 'Copied' : 'Copy MD'}
                                    </button>
                                    <button
                                        onClick={() => startRenaming(img.filename)}
                                        className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                                        title="Rename"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(img.filename)}
                                        className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
