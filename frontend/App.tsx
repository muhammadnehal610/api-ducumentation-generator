

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { DocumentationPreview } from './components/DocumentationPreview';
import { Sidebar } from './components/Sidebar';
// Fix: Import HTTPMethod type to be used for type assertion.
import type { Controller, ApiDoc, HTTPMethod } from './types';
import { generateFullMarkdown } from './services/markdownGenerator';
import * as api from './services/api';


export type SelectedItem = {
  type: 'controller' | 'route';
  controllerId: string;
  routeId?: string;
} | null;

const App: React.FC = () => {
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getControllers();
      setControllers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data from the server.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleAddController = async () => {
    const newControllerData = {
      name: "New Controller",
      description: "",
      routes: [],
      globalHeaders: []
    };
    try {
        const newController = await api.createController(newControllerData);
        setControllers(prev => [...prev, newController]);
        setSelectedItem({ type: 'controller', controllerId: newController.id });
    } catch (error) {
        console.error("Failed to create controller", error);
        setError(error instanceof Error ? error.message : "Could not create new controller.");
    }
  };
  
  const handleAddRoute = async (controllerId: string) => {
    const newRouteData = {
        endpoint: '/new-endpoint',
        // Fix: Cast 'GET' to HTTPMethod to satisfy the type requirement of createRoute.
        method: 'GET' as HTTPMethod,
        description: '',
        tags: [],
        headers: [],
        queryParams: [],
        requestBodyExample: '',
        requestBodySchema: [],
        responses: []
    };
    try {
        const updatedController = await api.createRoute(controllerId, newRouteData);
        setControllers(prev => prev.map(c => c.id === controllerId ? updatedController : c));
        // The new route will be the last one in the array
        const newRouteId = updatedController.routes[updatedController.routes.length - 1].id;
        setSelectedItem({ type: 'route', controllerId, routeId: newRouteId });
    } catch (error) {
        console.error("Failed to create route", error);
        setError(error instanceof Error ? error.message : "Could not create new route.");
    }
  };
  
  const handleDeleteController = async (controllerId: string) => {
    if (!window.confirm("Are you sure you want to delete this controller and all its routes?")) return;
    try {
      await api.deleteController(controllerId);
      setControllers(prev => prev.filter(c => c.id !== controllerId));
      if (selectedItem?.controllerId === controllerId) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error("Failed to delete controller", error);
      setError(error instanceof Error ? error.message : "Could not delete controller.");
    }
  };

  const handleDeleteRoute = async (controllerId: string, routeId: string) => {
     if (!window.confirm("Are you sure you want to delete this route?")) return;
     try {
        const updatedController = await api.deleteRoute(controllerId, routeId);
        setControllers(prev => prev.map(c => c.id === controllerId ? updatedController : c));
        if (selectedItem?.routeId === routeId) {
            setSelectedItem({ type: 'controller', controllerId });
        }
     } catch (error) {
        console.error("Failed to delete route", error);
        setError(error instanceof Error ? error.message : "Could not delete route.");
     }
  };

  const handleUpdateController = (updatedController: Controller) => {
     setControllers(prev => prev.map(c => c.id === updatedController.id ? updatedController : c));
  };
  
  const handleUpdateRoute = (controllerId: string, updatedRoute: ApiDoc) => {
     setControllers(prev => prev.map(c => {
        if (c.id === controllerId) {
            return {
                ...c,
                routes: c.routes.map(r => r.id === updatedRoute.id ? updatedRoute : r)
            };
        }
        return c;
     }));
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
                </div>
            )}
        </div>
    );
  }

  const isNetworkError = error && error.startsWith('Network error:');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
       <header className="bg-gray-800 p-4 shadow-md sticky top-0 z-20 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400">
          API Documentation Builder
        </h1>
        <div className="flex items-center gap-4">
            {feedbackMessage && <span className="text-sm text-green-400 animate-fade-in">{feedbackMessage}</span>}
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
            {isNetworkError ? (
                 <div className="p-6 md:p-10 text-gray-300 max-w-4xl mx-auto">
                  <div className="bg-gray-800 border border-red-500/50 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Backend Connection Error</h2>
                    <p className="mb-2">{error}</p>
                    <p className="mb-6">This usually means the backend server isn't running. Please follow these steps in a <strong>new terminal window</strong> to start it:</p>
                    <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm space-y-2">
                      <p className="text-gray-500"># 1. Navigate to the backend directory</p>
                      <p><span className="text-cyan-400">$</span> <span className="text-white"> cd backend</span></p>
                      <p className="text-gray-500 pt-2"># 2. Install dependencies (if you haven't)</p>
                      <p><span className="text-cyan-400">$</span> <span className="text-white"> npm install</span></p>
                      <p className="text-gray-500 pt-2"># 3. Start the server</p>
                      <p><span className="text-cyan-400">$</span> <span className="text-white"> npm run dev</span></p>
                      <p className="text-gray-500 pt-2"># 4. Wait for these success messages:</p>
                      <p className="text-green-400">MongoDB Connected...</p>
                      <p className="text-green-400">Server running on port 5000</p>
                    </div>
                    <div className="mt-6">
                      <p className="mb-4">Once the server is running, you can retry the connection.</p>
                      <button onClick={fetchData} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        Retry Connection
                      </button>
                    </div>
                    <div className="mt-6 border-t border-gray-700 pt-4 text-sm text-gray-400">
                      <p><span className="font-bold">Troubleshooting:</span> If the server stops right after starting, please double-check that the `MONGODB_URI` in your `backend/.env` file is correct and that your IP address is whitelisted in MongoDB Atlas.</p>
                    </div>
                  </div>
                </div>
            ) : error ? (
                <div className="bg-red-800 text-white p-4 text-center">{error} <button onClick={() => setError(null)} className="font-bold ml-4">X</button></div>
            ) : isLoading ? (
                <div className="flex justify-center items-center h-full text-gray-500">Loading documentation...</div>
            ) : isPreviewing ? (
                 <div className="p-6 md:p-10" id="documentation-preview-container">
                    <DocumentationPreview controllers={controllers} />
                </div>
            ) : (
                 <main className="p-6">
                    <InputForm
                        key={selectedItem?.controllerId + '-' + selectedItem?.routeId}
                        selectedItem={selectedItem}
                        controllers={controllers}
                        onUpdateController={handleUpdateController}
                        onUpdateRoute={handleUpdateRoute}
                    />
                </main>
            )}
        </div>
      </div>
    </div>
  );
};

export default App;