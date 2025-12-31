import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

const MultiHandleNode = ({ data, selected }: NodeProps) => {
    const color = data.color || '#94a3b8';

    return (
        <div
            className={`w-full h-full min-h-[80px] bg-white rounded-lg shadow-sm border border-slate-200 transition-all
                ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-md'}`}
            style={{
                borderLeft: `6px solid ${color}`,
            }}
        >
            {/* 
                Handles are positioned exactly on the edges.
                'z-50' ensures they are above all content.
            */}

            {/* Top Handles */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1.5 z-50">
                <Handle
                    type="target"
                    position={Position.Top}
                    id="top-target"
                    className="w-4 h-4 !bg-white border-2 !border-slate-400 hover:!border-blue-600 hover:scale-125 transition-all shadow-sm"
                />
                <Handle
                    type="source"
                    position={Position.Top}
                    id="top-source"
                    className="w-4 h-4 !bg-white border-2 !border-slate-400 hover:!border-blue-600 hover:scale-125 transition-all shadow-sm"
                />
            </div>

            {/* Right Handles */}
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-50">
                <Handle
                    type="source"
                    position={Position.Right}
                    id="right-source"
                    className="w-4 h-4 !bg-white border-2 !border-slate-400 hover:!border-blue-600 hover:scale-125 transition-all shadow-sm"
                />
                <Handle
                    type="target"
                    position={Position.Right}
                    id="right-target"
                    className="w-4 h-4 !bg-white border-2 !border-slate-400 hover:!border-blue-600 hover:scale-125 transition-all shadow-sm"
                />
            </div>

            {/* Bottom Handles */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex gap-1.5 z-50">
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="bottom-source"
                    className="w-4 h-4 !bg-white border-2 !border-slate-400 hover:!border-blue-600 hover:scale-125 transition-all shadow-sm"
                />
                <Handle
                    type="target"
                    position={Position.Bottom}
                    id="bottom-target"
                    className="w-4 h-4 !bg-white border-2 !border-slate-400 hover:!border-blue-600 hover:scale-125 transition-all shadow-sm"
                />
            </div>

            {/* Left Handles */}
            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-50">
                <Handle
                    type="target"
                    position={Position.Left}
                    id="left-target"
                    className="w-4 h-4 !bg-white border-2 !border-slate-400 hover:!border-blue-600 hover:scale-125 transition-all shadow-sm"
                />
                <Handle
                    type="source"
                    position={Position.Left}
                    id="left-source"
                    className="w-4 h-4 !bg-white border-2 !border-slate-400 hover:!border-blue-600 hover:scale-125 transition-all shadow-sm"
                />
            </div>

            {/* Main content with padding */}
            <div className="p-3 w-full h-full flex items-center justify-center pointer-events-none">
                {data.label}
            </div>
        </div>
    );
};

export default memo(MultiHandleNode);
