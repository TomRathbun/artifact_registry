import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

const MultiHandleNode = ({ data }: NodeProps) => {
    return (
        <div className="w-full h-full relative group">
            {/* 
                We use a wrapper with padding: 0 in the parent,
                so Top: 0 is the actual edge of the box.
            */}

            {/* 
                Handles are now always visible but subtle, 
                becoming prominent on hover.
            */}

            {/* Top Handles */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 z-30">
                <Handle
                    type="target"
                    position={Position.Top}
                    id="top-target"
                    className="w-3 h-3 !bg-slate-300 border border-slate-400 hover:!bg-blue-600 hover:scale-125 transition-all shadow-sm"
                />
                <Handle
                    type="source"
                    position={Position.Top}
                    id="top-source"
                    className="w-3 h-3 !bg-slate-300 border border-slate-400 hover:!bg-blue-600 hover:scale-125 transition-all shadow-sm"
                />
            </div>

            {/* Right Handles */}
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 z-30">
                <Handle
                    type="source"
                    position={Position.Right}
                    id="right-source"
                    className="w-3 h-3 !bg-slate-300 border border-slate-400 hover:!bg-blue-600 hover:scale-125 transition-all shadow-sm"
                />
                <Handle
                    type="target"
                    position={Position.Right}
                    id="right-target"
                    className="w-3 h-3 !bg-slate-300 border border-slate-400 hover:!bg-blue-600 hover:scale-125 transition-all shadow-sm"
                />
            </div>

            {/* Bottom Handles */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex gap-1 z-30">
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="bottom-source"
                    className="w-3 h-3 !bg-slate-300 border border-slate-400 hover:!bg-blue-600 hover:scale-125 transition-all shadow-sm"
                />
                <Handle
                    type="target"
                    position={Position.Bottom}
                    id="bottom-target"
                    className="w-3 h-3 !bg-slate-300 border border-slate-400 hover:!bg-blue-600 hover:scale-125 transition-all shadow-sm"
                />
            </div>

            {/* Left Handles */}
            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 z-30">
                <Handle
                    type="target"
                    position={Position.Left}
                    id="left-target"
                    className="w-3 h-3 !bg-slate-300 border border-slate-400 hover:!bg-blue-600 hover:scale-125 transition-all shadow-sm"
                />
                <Handle
                    type="source"
                    position={Position.Left}
                    id="left-source"
                    className="w-3 h-3 !bg-slate-300 border border-slate-400 hover:!bg-blue-600 hover:scale-125 transition-all shadow-sm"
                />
            </div>

            {/* Main content with padding */}
            <div className="p-3 w-full h-full flex items-center justify-center">
                {data.label}
            </div>
        </div>
    );
};

export default memo(MultiHandleNode);
