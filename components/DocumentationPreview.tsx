
import React from 'react';

interface DocumentationPreviewProps {
  markdown: string;
}

export const DocumentationPreview: React.FC<DocumentationPreviewProps> = ({ markdown }) => {

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    // You could add a toast notification here for better UX
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-cyan-400">Markdown Output</h2>
        <button 
          onClick={handleCopy}
          className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold py-1 px-3 rounded-md transition-colors"
        >
          Copy
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words bg-gray-900 rounded-md p-4 text-sm text-gray-300 overflow-auto flex-grow font-mono">
        {markdown}
      </pre>
    </div>
  );
};
