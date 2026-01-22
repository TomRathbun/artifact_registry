import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MermaidBlock from './MermaidBlock';
import PlantUMLBlock from './PlantUMLBlock';

interface MarkdownDisplayProps {
    content: string;
    compact?: boolean;
}

const extractText = (c: any): string => {
    if (typeof c === 'string') return c;
    if (Array.isArray(c)) return c.map(extractText).join('');
    if (c?.props?.children) return extractText(c.props.children);
    return String(c || '');
};

const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({ content, compact = false }) => {
    if (compact) {
        return (
            <div className="markdown-content prose prose-slate max-w-none prose-sm leading-tight
                prose-p:my-0 prose-headings:text-sm prose-headings:font-bold prose-headings:my-0 
                prose-headings:inline prose-headings:after:content-[': ']
                prose-ol:my-0 prose-ul:my-0 prose-li:my-0">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {content || ''}
                </ReactMarkdown>

            </div>
        );
    }

    return (
        <div className="markdown-content prose prose-slate max-w-none 
            prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
            prose-ol:list-decimal prose-ol:pl-8 prose-ol:mb-4
            prose-ul:list-disc prose-ul:pl-8 prose-ul:mb-4
            prose-li:text-slate-700 prose-li:mb-2
            prose-img:rounded-xl prose-headings:border-b prose-headings:pb-2 
            prose-a:text-blue-600 prose-blockquote:border-l-4 prose-blockquote:border-slate-300 
            prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}

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
