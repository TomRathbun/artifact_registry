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

const extractText = (c: any): string => {
    if (typeof c === 'string') return c;
    if (Array.isArray(c)) return c.map(extractText).join('');
    if (c?.props?.children) return extractText(c.props.children);
    return String(c || '');
};

const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({ content }) => {
    return (
        <div className="markdown-content prose prose-slate max-w-none prose-img:rounded-xl prose-headings:border-b prose-headings:pb-2 prose-a:text-blue-600 prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-blockquote:px-4">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';

                        if (!inline && language === 'mermaid') {
                            return (
                                <div className="not-prose">
                                    <MermaidBlock chart={extractText(children).replace(/\n$/, '')} />
                                </div>
                            );
                        }

                        if (!inline && language === 'plantuml') {
                            return (
                                <div className="not-prose">
                                    <PlantUMLBlock code={extractText(children).replace(/\n$/, '')} />
                                </div>
                            );
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
                                    {extractText(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            );
                        }

                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                    img: (props: any) => (
                        <img
                            {...props}
                            style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '1rem 0' }}
                        />
                    )
                }}
            >
                {content || ''}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownDisplay;
