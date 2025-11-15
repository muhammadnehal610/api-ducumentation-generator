import React, { useState, useMemo } from 'react';
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

export type SelectedItem = {
  type: 'controller' | 'route';
  controllerId: string;
  routeId?: string;
} | null;

const App: React.FC = () => {
  const [controllers, setControllers] = useState<Controller[]>(initialControllers);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>({ type: 'route', controllerId: initialId1, routeId: initialId2});
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [exportButtonText, setExportButtonText] = useState('Export to Markdown');

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

  const handleExportMarkdown = () => {
    const markdown = generateFullMarkdown(controllers);
    navigator.clipboard.writeText(markdown).then(() => {
      setExportButtonText('Copied!');
      setTimeout(() => setExportButtonText('Export to Markdown'), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
       <header className="bg-gray-800 p-4 shadow-md sticky top-0 z-20 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400">
          API Documentation Builder
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExportMarkdown}
            className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
          >
           {exportButtonText}
          </button>
          <button 
            onClick={() => setIsPreviewing(!isPreviewing)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            {isPreviewing ? 'Close Preview' : 'Preview'}
          </button>
        </div>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <aside className={`bg-gray-800 h-full overflow-y-auto p-4 border-r border-gray-700 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-1/4'}`}>
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
        
        {isPreviewing ? (
           <div className="flex-grow bg-gray-900 h-full overflow-y-auto p-6">
              <DocumentationPreview controllers={controllers} />
           </div>
        ) : (
           <main className="flex-grow h-full overflow-y-auto p-6">
              <InputForm
                controllers={controllers}
                setControllers={setControllers}
                selectedItem={selectedItem}
              />
           </main>
        )}
      </div>
    </div>
  );
};

export default App;