import { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { Save, Download, FileCode, Wand2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toPng, toSvg } from 'html-to-image';

interface SequenceDiagramEditorProps {
    diagramId?: string;
    readOnly?: boolean;
}

const TEMPLATES: Record<string, string> = {
    'Sequence': `sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!`,
    'Flowchart': `flowchart TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Debug]`,
    'Class': `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal : +int age
    Animal : +String gender`,
    'State': `stateDiagram-v2
    [*] --> Still
    Still --> Moving
    Moving --> Still`,
    'ER Diagram': `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains`,
    'Gantt': `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d`,
    'Pie Chart': `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`,
    'Mindmap': `mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan`
};

export default function SequenceDiagramEditor({ diagramId: propId, readOnly = false }: SequenceDiagramEditorProps = {}) {
    const { diagramId: paramId } = useParams<{ diagramId: string }>();
    const diagramId = propId || paramId;
    const queryClient = useQueryClient();
    const [content, setContent] = useState(TEMPLATES['Sequence']);
    const [svg, setSvg] = useState('');
    const [error, setError] = useState<string | null>(null);
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

    // Init Mermaid
    useEffect(() => {
        mermaid.initialize({ startOnLoad: false, theme: 'default' });
    }, []);

    // Render Mermaid
    useEffect(() => {
        const render = async () => {
            if (!content) return;
            try {
                // Clear error
                setError(null);
                const id = `mermaid-${diagramId || 'preview'}-${Date.now()}`;
                const { svg } = await mermaid.render(id, content);
                setSvg(svg);
            } catch (e: any) {
                console.error("Mermaid error:", e);
                setError(e.message || "Syntax Error");
            }
        }

        // Debounce render
        const timeout = setTimeout(render, 500);
        return () => clearTimeout(timeout);
    }, [content, diagramId]);

    const handleSave = () => {
        saveMutation.mutate(content);
    };

    const handleDownload = (format: 'png' | 'svg') => {
        if (!renderRef.current) return;

        if (format === 'png') {
            toPng(renderRef.current, { backgroundColor: '#ffffff' }).then(url => {
                const a = document.createElement('a');
                a.download = `mermaid-diagram-${diagramId || 'export'}.png`;
                a.href = url;
                a.click();
            });
        } else {
            toSvg(renderRef.current, { backgroundColor: '#ffffff' }).then(url => {
                const a = document.createElement('a');
                a.download = `mermaid-diagram-${diagramId || 'export'}.svg`;
                a.href = url;
                a.click();
            });
        }
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
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Wand2 className="w-4 h-4" /> Preview
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleDownload('png')} className="p-1.5 hover:bg-white rounded text-slate-600 border border-transparent hover:border-slate-200" title="Export PNG">
                                <Download className="w-4 h-4" /> <span className="text-xs">PNG</span>
                            </button>
                            <button onClick={() => handleDownload('svg')} className="p-1.5 hover:bg-white rounded text-slate-600 border border-transparent hover:border-slate-200" title="Export SVG">
                                <Download className="w-4 h-4" /> <span className="text-xs">SVG</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-4 bg-white overflow-auto flex items-start justify-center relative">
                        {error && (
                            <div className="absolute top-4 left-4 right-4 bg-red-50 text-red-700 p-3 rounded border border-red-200 text-sm font-mono whitespace-pre-wrap z-10">
                                {error}
                            </div>
                        )}
                        <div ref={renderRef} dangerouslySetInnerHTML={{ __html: svg }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
