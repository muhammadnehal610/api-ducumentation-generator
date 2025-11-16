
import React, { useState } from 'react';
import type { Controller, ApiDoc, SchemaField, Parameter, Header, ApiResponse, HTTPMethod } from '../types';

const MethodBadge: React.FC<{ method: HTTPMethod }> = ({ method }) => {
    const colors = {
        GET: 'bg-green-600/80 border-green-400',
        POST: 'bg-blue-600/80 border-blue-400',
        PUT: 'bg-orange-600/80 border-orange-400',
        DELETE: 'bg-red-600/80 border-red-400',
        PATCH: 'bg-yellow-600/80 border-yellow-400',
        OPTIONS: 'bg-purple-600/80 border-purple-400',
        HEAD: 'bg-gray-600/80 border-gray-400',
    };
    return (
        <span className={`px-3 py-1 text-sm font-bold text-white rounded-md border ${colors[method] || 'bg-gray-500'}`}>
            {method}
        </span>
    );
};

const Section: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-t border-gray-700 py-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left flex justify-between items-center group">
                <h3 className="text-lg font-semibold text-cyan-400 group-hover:text-cyan-300">{title}</h3>
                <span className={`transform transition-transform text-cyan-400 group-hover:text-cyan-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && <div className="mt-3 animate-fade-in">{children}</div>}
        </div>
    );
};

const SchemaTable: React.FC<{ schema: SchemaField[] }> = ({ schema }) => {
    if (schema.length === 0) return null;
    return (
        <table className="w-full text-sm text-left my-2">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                <tr>
                    <th className="px-4 py-2">Field</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Required</th>
                </tr>
            </thead>
            <tbody>
                {schema.map(field => (
                    <tr key={field.id} className="border-b border-gray-700">
                        <td className="px-4 py-2 font-mono font-medium text-amber-300">{field.key}</td>
                        <td className="px-4 py-2 font-mono text-fuchsia-300">{field.type}</td>
                        <td className="px-4 py-2">{field.description}</td>
                        <td className="px-4 py-2">{field.required ? <span className="text-red-400 font-bold">Yes</span> : 'No'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const KeyValueTable: React.FC<{ data: (Header | Parameter)[], title: string, isHeader?: boolean }> = ({ data, title, isHeader = false }) => {
    if (data.length === 0) return null;
    return (
        <div className="my-4">
            <h4 className="font-semibold text-gray-300 mb-2">{title}</h4>
            <table className="w-full text-sm text-left my-2">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                    <tr>
                        <th className="px-4 py-2">Key</th>
                        <th className="px-4 py-2">Value</th>
                        <th className="px-4 py-2">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr key={item.id} className="border-b border-gray-700">
                            <td className="px-4 py-2 font-mono font-medium text-amber-300">{item.key}</td>
                            <td className="px-4 py-2 font-mono text-fuchsia-300">{item.value}</td>
                            <td className="px-4 py-2">{item.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const CodeBlock: React.FC<{ jsonString: string }> = ({ jsonString }) => {
    const [copied, setCopied] = useState(false);
    if (!jsonString) return null;
    
    let formattedJson = jsonString;
    try {
        formattedJson = JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch(e) {
        // ignore if not valid json
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(formattedJson);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-800 rounded-md my-2 relative border border-gray-700">
            <button onClick={handleCopy} className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded">
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre className="p-4 text-sm text-gray-300 overflow-auto font-mono whitespace-pre-wrap break-all">
                <code>{formattedJson}</code>
            </pre>
        </div>
    );
};


const RoutePreview: React.FC<{ route: ApiDoc, controller: Controller }> = ({ route, controller }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg animate-fade-in my-4 border border-gray-700">
            <div className="flex items-center gap-4 mb-2">
                <MethodBadge method={route.method} />
                <h2 className="text-xl font-bold text-gray-100 font-mono break-all">{route.endpoint}</h2>
            </div>
            {route.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 my-2">
                    {route.tags.map(tag => tag && <span key={tag} className="bg-gray-700 text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>)}
                </div>
            )}
            <p className="text-gray-400 mt-2 mb-4">{route.description}</p>
            
            {(controller.globalHeaders.length > 0 || route.queryParams.length > 0 || route.headers.length > 0) && (
                <Section title="Parameters & Headers" defaultOpen={true}>
                    <KeyValueTable data={controller.globalHeaders} title="Global Headers" isHeader />
                    <KeyValueTable data={route.headers} title="Route-Specific Headers" isHeader />
                    <KeyValueTable data={route.queryParams} title="Query Parameters" />
                </Section>
            )}

            {(route.method !== 'GET' && route.method !== 'DELETE') && (route.requestBodySchema.length > 0 || route.requestBodyExample) && (
                 <Section title="Request Body" defaultOpen={true}>
                    <h4 className="font-semibold text-gray-300 mb-2">Request Body Schema</h4>
                    <SchemaTable schema={route.requestBodySchema} />
                    <h4 className="font-semibold text-gray-300 mb-2 mt-4">Example Request</h4>
                    <CodeBlock jsonString={route.requestBodyExample} />
                </Section>
            )}

            {route.responses.length > 0 && (
                 <Section title="Responses" defaultOpen={true}>
                    {route.responses.map(res => (
                        <div key={res.id} className="my-4 border-t border-gray-700/50 pt-4">
                            <h4 className="font-semibold"><span className={`font-bold mr-2 ${res.statusCode.startsWith('2') ? 'text-green-400' : 'text-red-400'}`}>{res.statusCode}</span> {res.description}</h4>
                             <SchemaTable schema={res.schema} />
                            <CodeBlock jsonString={res.bodyExample} />
                        </div>
                    ))}
                </Section>
            )}
        </div>
    );
};


interface DocumentationPreviewProps {
  controllers: Controller[];
}

export const DocumentationPreview: React.FC<DocumentationPreviewProps> = ({ controllers }) => {
  if (!controllers || controllers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No controllers defined. Add a controller to start building your documentation.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white mb-8 border-b border-gray-700 pb-4">API Documentation</h1>
      {controllers.map(controller => (
          <div key={controller.id} className="mb-12">
            <h2 className="text-3xl font-bold text-cyan-400">{controller.name}</h2>
            <p className="text-gray-400 mt-2 text-lg">{controller.description}</p>
            {controller.routes.map(route => (
                <RoutePreview key={route.id} route={route} controller={controller} />
            ))}
          </div>
      ))}
    </div>
  );
};
