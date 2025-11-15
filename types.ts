
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
  name: string;
  type: string;
  description: string;
  required: boolean;
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
  endpoint: string;
  method: HTTPMethod;
  description: string;
  headers: Header[];
  queryParams: Parameter[];
  requestBodyExample: string;
  requestBodySchema: SchemaField[];
  responses: ApiResponse[];
}
