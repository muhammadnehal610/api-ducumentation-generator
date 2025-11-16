export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export const httpMethods: HTTPMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export interface SchemaField {
  id: string;
  key: string;
  type: string;
  description: string;
  required: boolean;
}

export interface Parameter {
  id:string;
  key: string;
  value: string;
  description: string;
}

export interface Header {
  id: string;
  key: string;
  value: string;
  description: string;
}

export interface ApiResponse {
  id: string;
  statusCode: string;
  description: string;
  bodyExample: string;
  schema: SchemaField[];
}

export interface ApiDoc {
  id: string;
  endpoint: string;
  method: HTTPMethod;
  description: string;
  tags: string[];
  headers: Header[];
  queryParams: Parameter[];
  requestBodyExample: string;
  requestBodySchema: SchemaField[];
  responses: ApiResponse[];
}

export interface Controller {
  id: string;
  name: string;
  description: string;
  routes: ApiDoc[];
  globalHeaders: Header[];
}