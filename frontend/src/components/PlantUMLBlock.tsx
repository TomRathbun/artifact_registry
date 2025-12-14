import React, { useMemo } from 'react';
import plantumlEncoder from 'plantuml-encoder';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface PlantUMLBlockProps {
    code: string;
    className?: string;
}

const PlantUMLBlock: React.FC<PlantUMLBlockProps> = ({ code, className }) => {
    const encodedUrl = useMemo(() => {
        try {
            const encoded = plantumlEncoder.encode(code);
            const serverUrl = import.meta.env.VITE_PLANTUML_SERVER || 'https://www.plantuml.com/plantuml/svg/';
            return `${serverUrl}${encoded}`;
        } catch (error) {
            console.error('Failed to encode PlantUML:', error);
            return '';
        }
    }, [code]);

    if (!encodedUrl) {
        return <div className="text-red-500 text-sm">Error rendering PlantUML diagram</div>;
    }

    return (
        <div className={`overflow-hidden bg-slate-50 rounded-md shadow-sm border border-slate-200 relative group ${className || ''}`} style={{ height: '500px' }}>
            <TransformWrapper
                initialScale={0.9}
                minScale={0.5}
                maxScale={4}
                centerOnInit={true}
                wheel={{ step: 0.1 }}
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded shadow border border-slate-200">
                            <button onClick={() => zoomIn()} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Zoom In">
                                <ZoomIn className="w-4 h-4" />
                            </button>
                            <button onClick={() => zoomOut()} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Zoom Out">
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <button onClick={() => resetTransform()} className="p-1 hover:bg-slate-100 rounded text-slate-600" title="Reset">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                        <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center p-4">
                            <img src={encodedUrl} alt="PlantUML Diagram" className="max-w-full max-h-full object-contain" />
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
};

export default PlantUMLBlock;
