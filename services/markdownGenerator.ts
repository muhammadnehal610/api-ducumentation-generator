
import type { ApiDoc, SchemaField, Parameter, Header, ApiResponse } from '../types';

const generateSchemaTable = (schema: SchemaField[], title: string): string => {
  if (schema.length === 0) return '';
  let table = `**${title}**\n\n`;
  table += '| Field | Type | Description | Required |\n';
  table += '|---|---|---|---|\n';
  schema.forEach(field => {
    table += `| \`${field.key}\` | \`${field.type}\` | ${field.description} | ${field.required ? 'Yes' : 'No'} |\n`;
  });
  return table + '\n';
};

const generateParamsTable = (params: Parameter[]): string => {
  if (params.length === 0) return '';
  let table = '### Query Parameters\n\n';
  table += '| Parameter | Type | Description | Required |\n';
  table += '|---|---|---|---|\n';
  params.forEach(param => {
    table += `| \`${param.name}\` | \`${param.type}\` | ${param.description} | ${param.required ? 'Yes' : 'No'} |\n`;
  });
  return table + '\n';
};

const generateHeadersTable = (headers: Header[]): string => {
  if (headers.length === 0) return '';
  let table = '### Headers\n\n';
  table += '| Key | Value | Description |\n';
  table += '|---|---|---|\n';
  headers.forEach(header => {
    table += `| \`${header.key}\` | \`${header.value}\` | ${header.description} |\n`;
  });
  return table + '\n';
};

const formatJson = (jsonString: string): string => {
  try {
    const obj = JSON.parse(jsonString);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return jsonString; // Return original string if it's not valid JSON
  }
};

export const generateMarkdown = (doc: ApiDoc): string => {
  let md = `## \`${doc.method}\` ${doc.endpoint || '/your/endpoint'}\n\n`;
  md += `${doc.description}\n\n`;

  md += generateHeadersTable(doc.headers);
  md += generateParamsTable(doc.queryParams);
  
  if (doc.method !== 'GET' && (doc.requestBodySchema.length > 0 || doc.requestBodyExample)) {
    md += '### Request Body\n\n';
    md += generateSchemaTable(doc.requestBodySchema, 'Request Body Schema');
    if (doc.requestBodyExample) {
        md += '**Example Request**\n';
        md += '```json\n';
        md += `${formatJson(doc.requestBodyExample)}\n`;
        md += '```\n\n';
    }
  }

  md += '### Responses\n\n';
  doc.responses.forEach((res: ApiResponse) => {
    md += `#### \`${res.statusCode}\` - ${res.description}\n\n`;
    md += generateSchemaTable(res.schema, 'Response Body Schema');
    if (res.bodyExample) {
      md += '**Example Response**\n';
      md += '```json\n';
      md += `${formatJson(res.bodyExample)}\n`;
      md += '```\n\n';
    }
  });

  return md;
};
