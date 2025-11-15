import type { ApiDoc, SchemaField, Parameter, Header, ApiResponse, Controller } from '../types';

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
  table += '| Parameter | Value | Description |\n';
  table += '|---|---|---|\n';
  params.forEach(param => {
    table += `| \`${param.key}\` | \`${param.value}\` | ${param.description} |\n`;
  });
  return table + '\n';
};

const generateHeadersTable = (headers: Header[], title: string = 'Headers'): string => {
  if (headers.length === 0) return '';
  let table = `### ${title}\n\n`;
  table += '| Key | Value | Description |\n';
  table += '|---|---|---|\n';
  headers.forEach(header => {
    table += `| \`${header.key}\` | \`${header.value}\` | ${header.description} |\n`;
  });
  return table + '\n';
};

const formatJson = (jsonString: string): string => {
  try {
    if (!jsonString.trim()) return '';
    const obj = JSON.parse(jsonString);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return jsonString; // Return original string if it's not valid JSON
  }
};

export const generateMarkdown = (doc: ApiDoc, controller?: Controller): string => {
  let md = `## \`${doc.method}\` ${doc.endpoint || '/your/endpoint'}\n\n`;
  md += `${doc.description}\n\n`;

  if (controller?.globalHeaders?.length) {
    md += generateHeadersTable(controller.globalHeaders, 'Global Headers');
  }
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

export const generateFullMarkdown = (controllers: Controller[]): string => {
  let fullMd = '# API Documentation\n\n';

  controllers.forEach(controller => {
    fullMd += `\n---\n\n`;
    fullMd += `# Controller: ${controller.name}\n\n`;
    fullMd += `${controller.description}\n\n`;
    
    controller.routes.forEach(route => {
      fullMd += generateMarkdown(route, controller);
      fullMd += `\n`;
    });
  });

  return fullMd;
}