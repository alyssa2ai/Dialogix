import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message, username }) {
  const isUser = message.sender === 'user';
  const time = new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });

  const text = typeof message.text === 'string' ? message.text : '';

  return (
    <div className={`flex items-end gap-2 px-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
          isUser ? 'bg-gray-700 text-gray-300' : 'bg-indigo-600 text-white'
        }`}
      >
        {isUser ? (username?.[0]?.toUpperCase() || 'U') : 'D'}
      </div>

      <div className="max-w-[70%]">
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-bl-sm'
          }`}
        >
          {isUser ? (
            text
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-1">{children}</ol>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-1">{children}</ul>,
                li: ({ children }) => <li className="text-gray-100">{children}</li>,
                code: ({ children }) => (
                  <code className="bg-gray-900 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                )
              }}
            >
              {text}
            </ReactMarkdown>
          )}
        </div>
        <div className={`text-xs text-gray-600 mt-1 px-1 ${isUser ? 'text-right' : ''}`}>
          {time}
        </div>
      </div>
    </div>
  );
}
