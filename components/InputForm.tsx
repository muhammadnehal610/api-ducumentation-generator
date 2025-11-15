import React from 'react';
import type { Controller, ApiDoc, Header, Parameter, SchemaField, ApiResponse, HTTPMethod } from '../types';
import { httpMethods } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SelectedItem } from '../App';

interface InputFormProps {
  controllers: Controller[];
  setControllers: React.Dispatch<React.SetStateAction<Controller[]>>;
  selectedItem: SelectedItem;
}

const ControllerForm: React.FC<{controller: Controller, setControllers: Function}> = ({ controller, setControllers }) => {
  const handleChange = (field: keyof Controller, value: any) => {
    setControllers((prev: Controller[]) => prev.map(c => 
      c.id === controller.id ? { ...c, [field]: value } : c
    ));
  };
  
  const handleHeaderChange = (id: string, field: keyof Header, value: string) => {
      const newHeaders = controller.globalHeaders.map(h => 
          h.id === id ? {...h, [field]: value} : h
      );
      handleChange('globalHeaders', newHeaders);
  };
  
  const addHeader = () => {
      const newHeader: Header = { id: crypto.randomUUID(), key: '', value: '', description: '' };
      handleChange('globalHeaders', [...controller.globalHeaders, newHeader]);
  };
  
  const removeHeader = (id: string) => {
      handleChange('globalHeaders', controller.globalHeaders.filter(h => h.id !== id));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg space-y-6 animate-fade-in">
        <div>
            <h2 className="text-xl font-bold mb-3 text-cyan-400">Controller Settings</h2>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Controller Name</label>
                <input 
                    type="text" 
                    value={controller.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
            </div>
             <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea 
                    value={controller.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full h-24 bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-3 text-cyan-400">Global Headers</h3>
            <div className="space-y-2">
                {controller.globalHeaders.map(header => (
                    <div key={header.id} className="grid grid-cols-10 gap-2 items-center">
                        <input type="text" placeholder="Key" value={header.key} onChange={(e) => handleHeaderChange(header.id, 'key', e.target.value)} className="col-span-3 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                        <input type="text" placeholder="Value" value={header.value} onChange={(e) => handleHeaderChange(header.id, 'value', e.target.value)} className="col-span-3 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                        <input type="text" placeholder="Description" value={header.description} onChange={(e) => handleHeaderChange(header.id, 'description', e.target.value)} className="col-span-3 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                        <button onClick={() => removeHeader(header.id)} className="col-span-1 text-red-500 hover:text-red-400 flex justify-center items-center"><TrashIcon /></button>
                    </div>
                ))}
            </div>
            <button onClick={addHeader} className="mt-3 flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium"><PlusIcon/> Add Global Header</button>
        </div>
    </div>
  );
};


const RouteForm: React.FC<{route: ApiDoc, controllerId: string, setControllers: Function}> = ({ route, controllerId, setControllers }) => {

  const updateRoute = (key: keyof ApiDoc, value: any) => {
      setControllers((prev: Controller[]) => prev.map(c => {
        if (c.id === controllerId) {
            return {
                ...c,
                routes: c.routes.map(r => r.id === route.id ? { ...r, [key]: value } : r)
            }
        }
        return c;
    }));
  };

  const handleArrayChange = <T,>(arrayName: keyof ApiDoc, itemId: string, field: keyof T, value: any) => {
    const newArray = (route[arrayName] as T[]).map((item: any) => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    updateRoute(arrayName, newArray);
  };

  const addToArray = (arrayName: keyof ApiDoc, newItem: any) => {
    const currentArray = route[arrayName] as any[];
    updateRoute(arrayName, [...currentArray, newItem]);
  };

  const removeFromArray = (arrayName: keyof ApiDoc, id: string) => {
    const currentArray = route[arrayName] as any[];
    updateRoute(arrayName, currentArray.filter((item: any) => item.id !== id));
  };
  
  const handleResponseSchemaChange = (responseId: string, fieldId: string, field: keyof SchemaField, value: any) => {
      const newResponses = route.responses.map(res => {
          if (res.id === responseId) {
              const newSchema = res.schema.map(sf => 
                  sf.id === fieldId ? { ...sf, [field]: value } : sf
              );
              return { ...res, schema: newSchema };
          }
          return res;
      });
      updateRoute('responses', newResponses);
  };

  const addResponseSchemaField = (responseId: string) => {
      const newResponses = route.responses.map(res => {
          if (res.id === responseId) {
              const newField: SchemaField = { id: crypto.randomUUID(), key: '', type: 'string', description: '', required: false };
              return { ...res, schema: [...res.schema, newField] };
          }
          return res;
      });
      updateRoute('responses', newResponses);
  };
  
  const removeResponseSchemaField = (responseId: string, fieldId: string) => {
       const newResponses = route.responses.map(res => {
          if (res.id === responseId) {
              return { ...res, schema: res.schema.filter(sf => sf.id !== fieldId) };
          }
          return res;
      });
      updateRoute('responses', newResponses);
  };
  
  const handleJsonBlur = (e: React.FocusEvent<HTMLTextAreaElement>, setter: (value: string) => void) => {
    try {
      if(!e.target.value) return;
      const parsed = JSON.parse(e.target.value);
      setter(JSON.stringify(parsed, null, 2));
    } catch (error) {
      // Ignore if JSON is invalid, keep original text
    }
  };

  const renderSchemaFields = (
      schema: SchemaField[], 
      onFieldChange: (id: string, field: keyof SchemaField, value: any) => void, 
      onFieldRemove: (id: string) => void
    ) => (
    <div className="space-y-2 mt-2">
      <div className="grid grid-cols-10 gap-2 text-sm text-gray-400 font-medium">
        <span className="col-span-3">Key</span>
        <span className="col-span-2">Type</span>
        <span className="col-span-3">Description</span>
        <span className="col-span-1">Req?</span>
      </div>
      {schema.map((field) => (
        <div key={field.id} className="grid grid-cols-10 gap-2 items-center">
          <input type="text" placeholder="field_name" value={field.key} onChange={(e) => onFieldChange(field.id, 'key', e.target.value)} className="col-span-3 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
          <input type="text" placeholder="string" value={field.type} onChange={(e) => onFieldChange(field.id, 'type', e.target.value)} className="col-span-2 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
          <input type="text" placeholder="Description" value={field.description} onChange={(e) => onFieldChange(field.id, 'description', e.target.value)} className="col-span-3 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
          <input type="checkbox" checked={field.required} onChange={(e) => onFieldChange(field.id, 'required', e.target.checked)} className="col-span-1 h-5 w-5 bg-gray-700 border-gray-600 rounded text-cyan-500 focus:ring-cyan-600"/>
          <button onClick={() => onFieldRemove(field.id)} className="col-span-1 text-red-500 hover:text-red-400 flex justify-center items-center"><TrashIcon /></button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-3 text-cyan-400">Endpoint Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
                value={route.method}
                onChange={(e) => updateRoute('method', e.target.value as HTTPMethod)}
                className="md:col-span-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
                {httpMethods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input
                type="text"
                placeholder="/your/endpoint"
                value={route.endpoint}
                onChange={(e) => updateRoute('endpoint', e.target.value)}
                className="md:col-span-3 bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
        </div>
        <textarea
            placeholder="A brief description of what this endpoint does."
            value={route.description}
            onChange={(e) => updateRoute('description', e.target.value)}
            className="w-full mt-4 bg-gray-700 border border-gray-600 rounded px-3 py-2 h-20 resize-none focus:ring-cyan-500 focus:border-cyan-500"
        />
        <input 
          type="text"
          placeholder="tags, separated by commas"
          value={route.tags.join(', ')}
          onChange={(e) => updateRoute('tags', e.target.value.split(',').map(t => t.trim()))}
          className="w-full mt-4 bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"
        />
      </div>

      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-semibold mb-3 text-cyan-400">Route-Specific Headers</h2>
          <div className="space-y-2">
            {route.headers.map(header => (
                <div key={header.id} className="grid grid-cols-10 gap-2 items-center">
                    <input type="text" placeholder="Key" value={header.key} onChange={(e) => handleArrayChange<Header>('headers', header.id, 'key', e.target.value)} className="col-span-3 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                    <input type="text" placeholder="Value" value={header.value} onChange={(e) => handleArrayChange<Header>('headers', header.id, 'value', e.target.value)} className="col-span-3 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                    <input type="text" placeholder="Description" value={header.description} onChange={(e) => handleArrayChange<Header>('headers', header.id, 'description', e.target.value)} className="col-span-3 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                    <button onClick={() => removeFromArray('headers', header.id)} className="col-span-1 text-red-500 hover:text-red-400 flex justify-center items-center"><TrashIcon /></button>
                </div>
            ))}
          </div>
          <button onClick={() => addToArray('headers', {id: crypto.randomUUID(), key: '', value: '', description: ''})} className="mt-3 flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium"><PlusIcon/> Add Header</button>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-semibold mb-3 text-cyan-400">Query Parameters</h2>
          <div className="space-y-2">
            {route.queryParams.map(param => (
                <div key={param.id} className="grid grid-cols-10 gap-2 items-center">
                    <input type="text" placeholder="Key" value={param.key} onChange={(e) => handleArrayChange<Parameter>('queryParams', param.id, 'key', e.target.value)} className="col-span-3 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                    <input type="text" placeholder="Value" value={param.value} onChange={(e) => handleArrayChange<Parameter>('queryParams', param.id, 'value', e.target.value)} className="col-span-3 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                    <input type="text" placeholder="Description" value={param.description} onChange={(e) => handleArrayChange<Parameter>('queryParams', param.id, 'description', e.target.value)} className="col-span-3 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                    <button onClick={() => removeFromArray('queryParams', param.id)} className="col-span-1 text-red-500 hover:text-red-400 flex justify-center items-center"><TrashIcon /></button>
                </div>
            ))}
          </div>
          <button onClick={() => addToArray('queryParams', {id: crypto.randomUUID(), key: '', value: '', description: ''})} className="mt-3 flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium"><PlusIcon/> Add Parameter</button>
      </div>

      {route.method !== 'GET' && route.method !== 'DELETE' && (
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-semibold mb-3 text-cyan-400">Request Body</h2>
          <label className="text-sm font-medium text-gray-400">Schema</label>
          {renderSchemaFields(
            route.requestBodySchema,
            (id, field, value) => handleArrayChange<SchemaField>('requestBodySchema', id, field, value),
            (id) => removeFromArray('requestBodySchema', id)
          )}
          <button onClick={() => addToArray('requestBodySchema', {id: crypto.randomUUID(), key: '', type: 'string', description: '', required: false})} className="mt-3 flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium"><PlusIcon/> Add Schema Field</button>
          
          <label className="text-sm font-medium text-gray-400 mt-4 block">JSON Example</label>
          <textarea
              placeholder={`{\n  "key": "value"\n}`}
              value={route.requestBodyExample}
              onChange={(e) => updateRoute('requestBodyExample', e.target.value)}
              onBlur={(e) => handleJsonBlur(e, (v) => updateRoute('requestBodyExample', v))}
              className="w-full mt-2 bg-gray-700 border border-gray-600 rounded px-3 py-2 h-32 resize-y focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm"
          />
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-semibold mb-3 text-cyan-400">Responses</h2>
          <div className="space-y-4">
              {route.responses.map(res => (
                  <div key={res.id} className="bg-gray-700 p-3 rounded-md border border-gray-600">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-2">
                           <input type="text" placeholder="200 OK" value={res.statusCode} onChange={(e) => handleArrayChange<ApiResponse>('responses', res.id, 'statusCode', e.target.value)} className="bg-gray-600 w-28 border border-gray-500 rounded px-2 py-1 text-sm font-semibold focus:ring-cyan-500 focus:border-cyan-500"/>
                           <input type="text" placeholder="Description" value={res.description} onChange={(e) => handleArrayChange<ApiResponse>('responses', res.id, 'description', e.target.value)} className="flex-grow bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                        <button onClick={() => removeFromArray('responses', res.id)} className="text-red-500 hover:text-red-400"><TrashIcon /></button>
                      </div>

                      <label className="text-sm font-medium text-gray-400">Response Schema</label>
                      {renderSchemaFields(
                          res.schema,
                          (fieldId, field, value) => handleResponseSchemaChange(res.id, fieldId, field, value),
                          (fieldId) => removeResponseSchemaField(res.id, fieldId)
                      )}
                      <button onClick={() => addResponseSchemaField(res.id)} className="mt-3 flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium"><PlusIcon/> Add Schema Field</button>

                      <label className="text-sm font-medium text-gray-400 mt-4 block">JSON Example</label>
                       <textarea
                            placeholder={`{\n  "key": "value"\n}`}
                            value={res.bodyExample}
                            onChange={(e) => handleArrayChange<ApiResponse>('responses', res.id, 'bodyExample', e.target.value)}
                            onBlur={(e) => handleJsonBlur(e, (v) => handleArrayChange<ApiResponse>('responses', res.id, 'bodyExample', v))}
                            className="w-full mt-2 bg-gray-600 border border-gray-500 rounded px-3 py-2 h-32 resize-y focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm"
                        />
                  </div>
              ))}
          </div>
          <button onClick={() => addToArray('responses', {id: crypto.randomUUID(), statusCode: '', description: '', bodyExample: '', schema: []})} className="mt-3 flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium"><PlusIcon/> Add Response</button>
      </div>

    </div>
  );
};


export const InputForm: React.FC<InputFormProps> = ({ controllers, setControllers, selectedItem }) => {

  const data = React.useMemo(() => {
    if (!selectedItem) return null;
    const controller = controllers.find(c => c.id === selectedItem.controllerId);
    if (!controller) return null;

    if (selectedItem.type === 'controller') {
      return { type: 'controller', controller };
    }

    if (selectedItem.type === 'route' && selectedItem.routeId) {
      const route = controller.routes.find(r => r.id === selectedItem.routeId);
      return route ? { type: 'route', route, controllerId: controller.id } : null;
    }

    return null;
  }, [controllers, selectedItem]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Select a controller or route to edit, or create a new one.</p>
      </div>
    );
  }

  return (
    <div>
      {data.type === 'controller' && <ControllerForm controller={data.controller} setControllers={setControllers} />}
      {data.type === 'route' && <RouteForm route={data.route} controllerId={data.controllerId} setControllers={setControllers} />}
    </div>
  );
};