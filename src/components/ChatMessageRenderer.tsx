import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageRendererProps {
  content: string;
  isUser?: boolean;
}

export const ChatMessageRenderer: React.FC<ChatMessageRendererProps> = ({ content, isUser }) => {
  if (isUser) {
    return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
  }

  return (
    <div className="prose prose-xs max-w-none text-slate-800 space-y-2 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 border border-slate-200 rounded-xl shadow-xs bg-white">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-slate-700" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-100 text-slate-800 font-bold" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3.5 py-2 text-left text-[11px] font-bold tracking-tight border-b border-slate-200" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-slate-100 bg-white" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-emerald-50/30 transition-colors odd:bg-white even:bg-slate-50/50" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3.5 py-2 align-top text-xs leading-relaxed border-slate-100" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1 className="text-base font-bold text-slate-900 mt-3 mb-1 flex items-center gap-1.5" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm font-bold text-slate-900 mt-3 mb-1" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs font-bold text-slate-800 mt-2 mb-1" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xs font-semibold text-slate-800 mt-2 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside pl-4 my-1.5 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside pl-4 my-1.5 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-emerald-500 pl-3 py-1 my-2 bg-emerald-50/40 text-slate-700 italic rounded-r-md" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="font-mono text-[11px] bg-slate-100 text-emerald-800 px-1.5 py-0.5 rounded border border-slate-200" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto my-2 text-xs font-mono border border-slate-800">
                <code {...props}>{children}</code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
