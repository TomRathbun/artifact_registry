import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ReactFlow, { Background, Controls } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import packageJsonRaw from '../../package.json';
const packageJson = packageJsonRaw as any;

// Use a simple dagre graph or just static nodes for the architecture since it's fixed
const nodes: Node[] = [
    {
        id: 'user',
        type: 'input',
        data: { label: 'User' },
        position: { x: 250, y: 0 },
        style: { background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', width: 100 }
    },
    {
        id: 'frontend',
        data: {
            label: (
                <div>
                    <div className="font-bold">React Client</div>
                    <div className="text-xs opacity-80">Port 5173</div>
                </div>
            )
        },
        position: { x: 250, y: 100 },
        style: { background: '#61dafb', color: '#000', border: '1px solid #282c34', borderRadius: '8px', padding: '10px', width: 180 }
    },
    {
        id: 'backend',
        data: {
            label: (
                <div>
                    <div className="font-bold">FastAPI Backend</div>
                    <div className="text-xs opacity-80">Port 8000</div>
                </div>
            )
        },
        position: { x: 250, y: 200 },
        style: { background: '#009688', color: '#fff', border: '1px solid #004d40', borderRadius: '8px', padding: '10px', width: 180 }
    },
    {
        id: 'database',
        type: 'output',
        data: {
            label: (
                <div>
                    <div className="font-bold">PostgreSQL</div>
                    <div className="text-xs opacity-80">Port 5432</div>
                </div>
            )
        },
        position: { x: 250, y: 350 },
        style: { background: '#336791', color: '#fff', border: '1px solid #1a365d', borderRadius: '8px', padding: '10px', width: 180 }
    },
    {
        id: 'docs',
        data: {
            label: (
                <div onClick={() => window.open('http://localhost:8000/docs', '_blank')} className="cursor-pointer hover:underline">
                    <div className="font-bold">API Docs</div>
                    <div className="text-xs opacity-80">/docs</div>
                </div>
            )
        },
        position: { x: 500, y: 200 },
        style: { background: '#818cf8', color: '#fff', border: '1px solid #4338ca', borderRadius: '8px', padding: '10px', width: 140 }
    }
];

const edges: Edge[] = [
    { id: 'e1-2', source: 'user', target: 'frontend', animated: true, label: 'HTTP' },
    { id: 'e2-3', source: 'frontend', target: 'backend', animated: true, label: 'JSON / REST' },
    { id: 'e3-4', source: 'backend', target: 'database', animated: true, label: 'SQL' },
    { id: 'e3-5', source: 'backend', target: 'docs', animated: true, style: { strokeDasharray: '5,5' }, label: 'Generates' }
];

const AboutPage: React.FC = () => {
    const { data: systemInfo, isLoading } = useQuery({
        queryKey: ['systemInfo'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:8000/api/v1/system/info');
            return response.data;
        }
    });

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-slate-800">About Artifact Registry</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* System Info Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700">System Versions</h2>
                    {isLoading ? (
                        <p className="text-slate-500">Loading system info...</p>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                <span className="text-slate-600 font-semibold">Frontend Version:</span>
                                <span className="font-mono font-medium">{packageJson.version}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2 pl-4">
                                <span className="text-slate-500">React Version:</span>
                                <span className="font-mono text-sm">{packageJson.dependencies['react'].replace('^', '')}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2 pl-4">
                                <span className="text-slate-500">Vite Version:</span>
                                <span className="font-mono text-sm">{packageJson.devDependencies['vite'].replace('^', '')}</span>
                            </div>

                            <div className="flex justify-between border-b border-slate-100 pb-2 mt-4">
                                <span className="text-slate-600 font-semibold">Backend Version:</span>
                                <span className="font-mono font-medium">{systemInfo?.version || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2 pl-4">
                                <span className="text-slate-500">FastAPI Version:</span>
                                <span className="font-mono text-sm">{systemInfo?.fastapi_version || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-2 pl-4">
                                <span className="text-slate-500">Python Version:</span>
                                <span className="font-mono text-sm">{systemInfo?.python_version || 'Unknown'}</span>
                            </div>

                            <div className="flex justify-between border-b border-slate-100 pb-2 mt-4">
                                <span className="text-slate-600 font-semibold">{systemInfo?.database_type || 'Database'}:</span>
                                <span className="font-mono font-medium">{systemInfo?.database_version || 'Unknown'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Description Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700">Project Description</h2>
                    <p className="text-slate-600 leading-relaxed">
                        The Artifact Registry is a comprehensive tool for managing system engineering artifacts including Visions, Needs, Use Cases, and Requirements.
                        It ensures traceability, consistency, and efficient collaboration across the engineering lifecycle.
                    </p>
                </div>
            </div>

            {/* Architecture Diagram */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-[500px]">
                <h2 className="text-xl font-semibold mb-4 text-slate-700">System Architecture</h2>
                <div className="h-[400px] border border-slate-100 rounded bg-slate-50">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        fitView
                        attributionPosition="bottom-right"
                    >
                        <Background color="#ccc" gap={16} />
                        <Controls />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
