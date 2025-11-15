
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { InputForm } from './components/InputForm';
import { DocumentationPreview } from './components/DocumentationPreview';
import { Sidebar } from './components/Sidebar';
import type { Controller, ApiDoc } from './types';
import { generateFullMarkdown } from './services/markdownGenerator';

const initialId1 = crypto.randomUUID();
const initialId2 = crypto.randomUUID();

const initialControllers: Controller[] = [
  {
    id: initialId1,
    name: "User Management",
    description: "APIs for managing user accounts and profiles.",
    globalHeaders: [
      { id: crypto.randomUUID(), key: 'Authorization', value: 'Bearer {JWT_TOKEN}', description: 'Authentication token is required for all endpoints in this group.' },
      { id: crypto.randomUUID(), key: 'Content-Type', value: 'application/json', description: 'All requests should use JSON.' },
    ],
    routes: [
      {
        id: initialId2,
        endpoint: '/users/{userId}',
        method: 'GET',
        description: 'Retrieves the details of a specific user by their unique ID.',
        tags: ['Users', 'Profiles'],
        headers: [],
        queryParams: [
          { id: crypto.randomUUID(), key: 'include_details', value: 'true', description: 'Include extended user details.' }
        ],
        requestBodyExample: '',
        requestBodySchema: [],
        responses: [
          {
            id: crypto.randomUUID(),
            statusCode: '200 OK',
            description: 'User details retrieved successfully.',
            bodyExample: '{\n  "id": "12345",\n  "name": "John Doe",\n  "email": "john.doe@example.com"\n}',
            schema: [
              { id: crypto.randomUUID(), key: 'id', type: 'string', description: 'Unique identifier for the user.', required: true },
              { id: crypto.randomUUID(), key: 'name', type: 'string', description: 'Full name of the user.', required: true },
              { id: crypto.randomUUID(), key: 'email', type: 'string', description: 'Email address of the user.', required: true },
            ]
          },
          {
            id: crypto.randomUUID(),
            statusCode: '404 Not Found',
            description: 'The requested user could not be found.',
            bodyExample: '{\n  "error": "User not found"\n}',
            schema: [
              { id: crypto.randomUUID(), key: 'error', type: 'string', description: 'Description of the error.', required: true }
            ]
          }
        ]
      }
    ]
  }
];

const loadState = (): Controller[] => {
  try {
    const serializedState = localStorage.getItem('api-docs-data');
    if (serializedState === null) {
      return initialControllers;
    }
    const parsedState = JSON.parse(serializedState);
    return parsedState.length > 0 ? parsedState : initialControllers;
  } catch (err) {
    console.error("Could not load state from local storage", err);
    return initialControllers;
  }
};


export type SelectedItem = {
  type: 'controller' | 'route';
  controllerId: string;
  routeId?: string;
} | null;

const App: React.FC = () => {
  const [controllers, setControllers] = useState<Controller[]>(loadState);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const serializedState = JSON.stringify(controllers);
      localStorage.setItem('api-docs-data', serializedState);
    } catch (err) {
      console.error("Could not save state to local storage", err);
    }
  }, [controllers]);

  useEffect(() => {
    if(feedbackMessage) {
        const timer = setTimeout(() => setFeedbackMessage(''), 3000);
        return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);


  const selectedData = useMemo(() => {
    if (!selectedItem) return null;
    const controller = controllers.find(c => c.id === selectedItem.controllerId);
    if (!controller) return null;

    if (selectedItem.type === 'controller') {
      return controller;
    }

    if (selectedItem.type === 'route' && selectedItem.routeId) {
      const route = controller.routes.find(r => r.id === selectedItem.routeId);
      return route || null;
    }
    
    return null;
  }, [selectedItem, controllers]);

  const handleAddController = () => {
    const newController: Controller = {
      id: crypto.randomUUID(),
      name: "New Controller",
      description: "",
      routes: [],
      globalHeaders: []
    };
    setControllers(prev => [...prev, newController]);
    setSelectedItem({ type: 'controller', controllerId: newController.id });
  };
  
  const handleAddRoute = (controllerId: string) => {
    const newRoute: ApiDoc = {
        id: crypto.randomUUID(),
        endpoint: '/new-endpoint',
        method: 'GET',
        description: '',
        tags: [],
        headers: [],
        queryParams: [],
        requestBodyExample: '',
        requestBodySchema: [],
        responses: []
    };
    setControllers(prev => prev.map(c => 
      c.id === controllerId ? { ...c, routes: [...c.routes, newRoute] } : c
    ));
    setSelectedItem({ type: 'route', controllerId, routeId: newRoute.id });
  };
  
  const handleDeleteController = (controllerId: string) => {
    setControllers(prev => prev.filter(c => c.id !== controllerId));
    if (selectedItem?.controllerId === controllerId) {
      setSelectedItem(null);
    }
  };

  const handleDeleteRoute = (controllerId: string, routeId: string) => {
    setControllers(prev => prev.map(c => 
      c.id === controllerId ? { ...c, routes: c.routes.filter(r => r.id !== routeId) } : c
    ));
     if (selectedItem?.routeId === routeId) {
      setSelectedItem({ type: 'controller', controllerId });
    }
  };
  
  const downloadFile = (content: string, filename: string, contentType: string) => {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    const markdown = generateFullMarkdown(controllers);
    navigator.clipboard.writeText(markdown).then(() => {
      setFeedbackMessage('Markdown copied to clipboard!');
    });
  };

  const handleDownloadMarkdown = () => {
    const markdown = generateFullMarkdown(controllers);
    downloadFile(markdown, 'api-documentation.md', 'text/markdown');
  };

  const handleDownloadHtml = async () => {
    const previewNode = document.getElementById('documentation-preview-container');
    if (!previewNode) {
        alert("Preview content not found!");
        return;
    }

    const tailwindUrl = 'https://cdn.tailwindcss.com';
    try {
        const [tailwindCss, customCss] = await Promise.all([
            fetch(tailwindUrl).then(res => res.text()),
            Promise.resolve(document.getElementById('custom-styles')?.innerHTML || '')
        ]);
        
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>API Documentation</title>
                <style>${tailwindCss}</style>
                <style>${customCss}</style>
            </head>
            <body class="bg-gray-900 text-gray-200 font-sans">
                <div class="p-6 md:p-10">${previewNode.innerHTML}</div>
            </body>
            </html>`;
        
        downloadFile(htmlContent, 'api-documentation.html', 'text/html');

    } catch (error) {
        console.error("Failed to fetch CSS for HTML export:", error);
        alert("Could not generate HTML file. Failed to fetch required CSS.");
    }
  };

  const handleExportJson = () => {
      const json = JSON.stringify(controllers, null, 2);
      downloadFile(json, 'api-docs-backup.json', 'application/json');
  };
  
  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result as string;
              const importedControllers = JSON.parse(text);
              // Basic validation
              if (Array.isArray(importedControllers)) {
                  setControllers(importedControllers);
                  setSelectedItem(null);
                  setFeedbackMessage("Documentation restored successfully!");
              } else {
                  throw new Error("Invalid JSON format.");
              }
          } catch (error) {
              alert("Failed to import JSON. Please check the file format.");
              console.error(error);
          }
      };
      reader.readAsText(file);
       // Reset file input value to allow importing the same file again
      if (importFileRef.current) {
        importFileRef.current.value = "";
      }
  };


  const ExportMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors flex items-center gap-1">
                Export <span>▼</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-30 border border-gray-600">
                    <button onClick={() => { handleCopyMarkdown(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">Copy Markdown</button>
                    <button onClick={() => { handleDownloadMarkdown(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">Download .md</button>
                    <button onClick={() => { handleDownloadHtml(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">Download .html</button>
                    <button onClick={() => { handleExportJson(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 border-t border-gray-600">Export .json</button>
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
       <header className="bg-gray-800 p-4 shadow-md sticky top-0 z-20 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400">
          API Documentation Builder
        </h1>
        <div className="flex items-center gap-4">
            {feedbackMessage && <span className="text-sm text-green-400 animate-fade-in">{feedbackMessage}</span>}
             <input type="file" ref={importFileRef} onChange={handleImportJson} accept=".json" style={{display: 'none'}} />
             <button
                onClick={() => importFileRef.current?.click()}
                className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
             >
                Import JSON
             </button>
             <ExportMenu />
          <button 
            onClick={() => setIsPreviewing(!isPreviewing)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            {isPreviewing ? 'Close Preview' : 'Preview'}
          </button>
        </div>
      </header>
      <div className="flex flex-grow overflow-hidden">
        {!isPreviewing && (
             <aside className={`bg-gray-800 h-full overflow-y-auto p-4 border-r border-gray-700 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-1/4 min-w-[250px]'}`}>
                <Sidebar 
                    controllers={controllers}
                    selectedItem={selectedItem}
                    isCollapsed={isSidebarCollapsed}
                    onSetIsCollapsed={setIsSidebarCollapsed}
                    onSelectItem={setSelectedItem}
                    onAddController={handleAddController}
                    onAddRoute={handleAddRoute}
                    onDeleteController={handleDeleteController}
                    onDeleteRoute={handleDeleteRoute}
                />
            </aside>
        )}
        
        <div className="flex-grow bg-gray-900 h-full overflow-y-auto">
            {isPreviewing ? (
                 <div className="p-6 md:p-10" id="documentation-preview-container">
                    <DocumentationPreview controllers={controllers} />
                </div>
            ) : (
                 <main className="p-6">
                    <InputForm
                        controllers={controllers}
                        setControllers={setControllers}
                        selectedItem={selectedItem}
                    />
                </main>
            )}
        </div>
      </div>
    </div>
  );
};

export default App;
