import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MermaidBlock from './MermaidBlock';
import PlantUMLBlock from './PlantUMLBlock';

interface MarkdownDisplayProps {
    content: string;
}

const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({ content }) => {
    return (
        <div className="markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';

                        if (!inline && language === 'mermaid') {
                            return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
                        }

                        if (!inline && language === 'plantuml') {
                            return <PlantUMLBlock code={String(children).replace(/\n$/, '')} />;
                        }

                        if (!inline && match) {
                            return (
                                <SyntaxHighlighter
                                    {...props}
                                    style={oneLight}
                                    language={language}
                                    PreTag="div"
                                    customStyle={{ margin: 0, borderRadius: '0.375rem' }}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            );
                        }

                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {content || ''}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownDisplay;
