import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Copy, Image as ImageIcon, Check, Trash2 } from 'lucide-react';
import axios from 'axios';

interface ImageFile {
    filename: string;
    url: string;
    size: number;
    created: number;
}

const ImageGallery: React.FC = () => {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const { data: images, isLoading } = useQuery<ImageFile[]>({
        queryKey: ['images'],
        queryFn: async () => {
            const response = await axios.get('/api/v1/images/');
            return response.data;
        }
    });

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            await axios.post('/api/v1/images/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
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
            await axios.delete(`/api/v1/images/${filename}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images'] });
        },
        onError: (error) => {
            console.error('Delete failed:', error);
            alert('Failed to delete image');
        }
    });

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

    const copyToClipboard = (url: string, filename: string) => {
        // Use relative URL for portability within the app
        const markdown = `![${filename}](${url})`;

        navigator.clipboard.writeText(markdown).then(() => {
            setCopiedUrl(url);
            setTimeout(() => setCopiedUrl(null), 2000);
        });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <ImageIcon className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-slate-800">Image Gallery</h1>
                </div>
                <div>
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-sm">
                        <Upload className="w-4 h-4" />
                        <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading images...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images?.map((image) => (
                        <div key={image.url} className="group bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                            <div className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center p-2">
                                <img
                                    src={image.url}
                                    alt={image.filename}
                                    className="object-contain w-full h-full"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => copyToClipboard(image.url, image.filename)}
                                        className="bg-white text-slate-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-blue-50"
                                    >
                                        {copiedUrl === image.url ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                        {copiedUrl === image.url ? 'Copied!' : 'Copy'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(image.filename)}
                                        className="bg-white text-red-600 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3 bg-white border-t border-slate-100">
                                <p className="text-sm font-medium text-slate-700 truncate" title={image.filename}>{image.filename}</p>
                                <p className="text-xs text-slate-400 mt-1">{(image.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                    ))}

                    {images?.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-slate-700">No images yet</h3>
                            <p className="text-slate-500">Upload an image to get started</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
