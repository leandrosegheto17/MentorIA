'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-900 mt-5 mb-2 pb-1 border-b border-gray-100">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-medium text-gray-800 mt-4 mb-2">{children}</h3>,
        p: ({ children }) => <p className="text-gray-700 mb-3 text-sm leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
        li: ({ children }) => <li className="text-gray-700 text-sm leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-200 pl-4 my-3 text-gray-600 italic text-sm">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">
            {children}
          </code>
        ),
        hr: () => <hr className="my-4 border-gray-100" />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
