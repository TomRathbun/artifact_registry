import { useEffect, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidBlockProps {
    chart: string;
}

const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        mermaid.initialize({ startOnLoad: false, theme: 'default' });

        const renderChart = async (chartString: string) => {
            try {
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, chartString);
                setSvg(svg);
                setError(null);
            } catch (err: any) {
                console.error('Mermaid render error:', err);
                setError(err.message || 'Syntax error in Mermaid diagram');
            }
        };

        // Ensure chart is always a string before processing
        if (typeof chart !== 'string') {
            setError('Internal error: Mermaid content is not a string');
            return;
        }

        const trimmedChart = chart.trim();
        // Basic validation to prevent [object Object] rendering
        if (trimmedChart.includes('[object Object]')) {
            setError('Internal error: diagram content was passed as a React object instead of text.');
            return;
        }

        renderChart(trimmedChart);
    }, [chart]);

    if (error) {
        return <div className="text-red-500 font-mono text-sm p-2 border border-red-200 bg-red-50 rounded">{error}</div>;
    }

    return <div dangerouslySetInnerHTML={{ __html: svg }} className="my-4 overflow-x-auto bg-white p-4 rounded-md shadow-sm text-slate-900" />;
};

export default MermaidBlock;
