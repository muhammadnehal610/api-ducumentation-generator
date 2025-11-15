
import React, { useState, useEffect, useCallback } from 'react';
import { InputForm } from './components/InputForm';
import { DocumentationPreview } from './components/DocumentationPreview';
import { generateMarkdown } from './services/markdownGenerator';
import type { ApiDoc, HTTPMethod } from './types';

const initialDocState: ApiDoc = {
  endpoint: '/users/{userId}',
  method: 'GET',
  description: 'Retrieves the details of a specific user by their unique ID.',
  headers: [],
  queryParams: [
    { id: crypto.randomUUID(), name: 'include_details', type: 'boolean', description: 'Include extended user details.', required: false }
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
};

const App: React.FC = () => {
  const [apiDoc, setApiDoc] = useState<ApiDoc>(initialDocState);
  const [markdownOutput, setMarkdownOutput] = useState('');

  useEffect(() => {
    const md = generateMarkdown(apiDoc);
    setMarkdownOutput(md);
  }, [apiDoc]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <header className="bg-gray-800 p-4 shadow-md sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center text-cyan-400">
          Interactive API Documentation Generator
        </h1>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <div className="h-[calc(100vh-80px)] overflow-y-auto pr-2">
          <InputForm apiDoc={apiDoc} setApiDoc={setApiDoc} />
        </div>
        <div className="h-[calc(100vh-80px)] overflow-y-auto pl-2">
          <DocumentationPreview markdown={markdownOutput} />
        </div>
      </main>
    </div>
  );
};

export default App;
