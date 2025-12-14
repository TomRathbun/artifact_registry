import { useEffect, useState, useRef, useMemo } from 'react';
import plantumlEncoder from 'plantuml-encoder';
import { Save, Download, FileCode, Wand2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface PlantUMLDiagramEditorProps {
    diagramId?: string;
    readOnly?: boolean;
}

const TEMPLATES: Record<string, string> = {
    'Sequence': `@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response

Alice -> Bob: Another authentication Request
Alice <-- Bob: another authentication Response
@enduml`,
    'Class': `@startuml
class Car

Driver - Car : drives >
Car *- Wheel : have 4 >
Car -- Person : < owns
@enduml`,
    'Use Case': `@startuml
(First usecase)
(Another usecase) as (UC2)
usecase UC3
usecase (Last\\nusecase) as UC4
@enduml`,
    'State': `@startuml
[*] --> State1
State1 --> [*]
State1 : this is a string
State1 : this is another string

State1 -> State2
State2 --> [*]
@enduml`
};

export default function PlantUMLDiagramEditor({ diagramId: propId, readOnly = false }: PlantUMLDiagramEditorProps = {}) {
    const { diagramId: paramId } = useParams<{ diagramId: string }>();
    const diagramId = propId || paramId;
    const queryClient = useQueryClient();
    const [content, setContent] = useState(TEMPLATES['Sequence']);
    const renderRef = useRef<HTMLDivElement>(null);

    // Fetch Diagram
    const { data: diagram, isLoading } = useQuery({
        queryKey: ['diagram', diagramId],
        queryFn: async () => {
            const res = await axios.get(`/api/v1/diagrams/${diagramId}`);
            return res.data;
        },
        enabled: !!diagramId
    });

    // Update local state when diagram loads
    useEffect(() => {
        if (diagram?.content) {
            setContent(diagram.content);
        }
    }, [diagram]);

    // Save Mutation
    const saveMutation = useMutation({
        mutationFn: async (newContent: string) => {
            await axios.put(`/api/v1/diagrams/${diagramId}`, {
                name: diagram?.name,
                description: diagram?.description,
                content: newContent
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagram', diagramId] });
        }
    });

    const encodedUrl = useMemo(() => {
        try {
            const encoded = plantumlEncoder.encode(content);
            const serverUrl = import.meta.env.VITE_PLANTUML_SERVER || 'https://www.plantuml.com/plantuml/svg/';
            return `${serverUrl}${encoded}`;
        } catch (error) {
            console.error('Failed to encode PlantUML:', error);
            return '';
        }
    }, [content]);

    const handleSave = () => {
        saveMutation.mutate(content);
    };

    const handleDownload = async (format: 'png' | 'svg') => {
        if (!encodedUrl) return;

        // For PlantUML, to download properly we might need to fetch the blob.
        // Or we can just open the image in new tab for now, or use exact same URL for SVG.
        // For PNG, users might need to change 'svg' to 'png' in URL.

        const serverUrl = import.meta.env.VITE_PLANTUML_SERVER || 'https://www.plantuml.com/plantuml/svg/';
        const encoded = plantumlEncoder.encode(content);

        let url = `${serverUrl}${encoded}`;
        // If server url ends in /svg/, switch to /png/ for png download logic if supported
        if (format === 'png' && url.includes('/svg/')) {
            url = url.replace('/svg/', '/png/');
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = `plantuml-diagram-${diagramId || 'export'}.${format}`;
        a.target = '_blank'; // PlantUML server often requires this or fetching blob
        a.click();
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading diagram...</div>;

    return (
        <div className="flex flex-col h-full space-y-4">
            {diagram && !readOnly && (
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">{diagram.name}</h2>
                        {diagram.description && (
                            <p className="text-slate-600 mt-1">{diagram.description}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="flex-1 flex gap-4 min-h-0">
                {/* Editor Pane */}
                {!readOnly && (
                    <div className="w-1/2 flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                    <FileCode className="w-4 h-4" /> Source
                                </div>
                                <select
                                    onChange={(e) => {
                                        if (window.confirm('This will replace current content. Continue?')) {
                                            setContent(TEMPLATES[e.target.value]);
                                        }
                                    }}
                                    className="text-xs border-none bg-slate-200 rounded px-2 py-1 text-slate-700 focus:ring-0 cursor-pointer hover:bg-slate-300"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Load Template...</option>
                                    {Object.keys(TEMPLATES).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saveMutation.isPending}
                                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                                >
                                    <Save className="w-3 h-3" /> {saveMutation.isPending ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                className="absolute inset-0 w-full h-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                spellCheck={false}
                            />
                        </div>
                    </div>
                )}

                {/* Preview Pane */}
                <div className={`${readOnly ? 'w-full' : 'w-1/2'} flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden`}>
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.1}
                        maxScale={4}
                        centerOnInit={true}
                    >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                            <>
                                <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center z-10 relative">
                                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                                        <Wand2 className="w-4 h-4" /> Preview
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1 bg-white rounded border border-slate-200 mr-2">
                                            <button onClick={() => zoomOut()} className="p-1.5 hover:bg-slate-50 text-slate-600 border-r border-slate-200" title="Zoom Out">
                                                <ZoomOut className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => resetTransform()} className="p-1.5 hover:bg-slate-50 text-slate-600 border-r border-slate-200" title="Reset Zoom">
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => zoomIn()} className="p-1.5 hover:bg-slate-50 text-slate-600" title="Zoom In">
                                                <ZoomIn className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button onClick={() => handleDownload('png')} className="p-1.5 hover:bg-white rounded text-slate-600 border border-transparent hover:border-slate-200" title="Open PNG">
                                            <Download className="w-4 h-4" /> <span className="text-xs">PNG</span>
                                        </button>
                                        <button onClick={() => handleDownload('svg')} className="p-1.5 hover:bg-white rounded text-slate-600 border border-transparent hover:border-slate-200" title="Open SVG">
                                            <Download className="w-4 h-4" /> <span className="text-xs">SVG</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 bg-white overflow-hidden relative" style={{ cursor: 'grab' }}>
                                    <TransformComponent
                                        wrapperStyle={{ width: "100%", height: "100%" }}
                                        contentStyle={{ width: "100%", height: "100%" }}
                                    >
                                        <div
                                            ref={renderRef}
                                            className="w-full h-full flex items-center justify-center p-8 text-center"
                                        >
                                            {encodedUrl ? (
                                                <img src={encodedUrl} alt="PlantUML Diagram" className="max-w-full" />
                                            ) : (
                                                <div className="text-slate-400">Enter PlantUML code to render diagram</div>
                                            )}
                                        </div>
                                    </TransformComponent>
                                </div>
                            </>
                        )}
                    </TransformWrapper>
                </div>
            </div>
        </div>
    );
}
