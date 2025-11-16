

import type { Controller, ApiDoc } from '../types';

const API_BASE_URL = 'https://api-ducumentation-generator.vercel.app/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!res.ok) {
            let errorMessage = `API Error: ${res.status} ${res.statusText}`;
            try {
                // Try to parse a JSON error response, which is common.
                const errorData = await res.json();
                errorMessage = errorData.message || JSON.stringify(errorData);
            } catch (e) {
                // If the response isn't JSON, use the status text as the error.
            }
            throw new Error(errorMessage);
        }
        
        // Handle 204 No Content responses, which have no body.
        if (res.status === 204) {
            return null as T;
        }

        // Safely handle responses that might have an empty body even with a 200 OK status
        const responseText = await res.text();
        return responseText ? JSON.parse(responseText) : null as T;

    } catch(err) {
        // Catch network errors (e.g., server is down) and re-throw with a more helpful message.
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
            throw new Error('Network error: Could not connect to the API server. Please check your connection and ensure the backend is running.');
        }
        // Re-throw other errors, including the ones we crafted above.
        throw err;
    }
}

// === Controller API ===
export const getControllers = (): Promise<Controller[]> => {
    return request('/controllers');
};

export const createController = (data: Partial<Omit<Controller, 'id'>>): Promise<Controller> => {
    return request('/controllers', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateController = (id: string, data: Partial<Controller>): Promise<Controller> => {
    const { routes, ...controllerData } = data; // Don't send routes when updating controller details
    return request(`/controllers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(controllerData),
    });
};

export const deleteController = (id: string): Promise<void> => {
    return request(`/controllers/${id}`, {
        method: 'DELETE',
    });
};

// === Route API ===
export const createRoute = (controllerId: string, data: Partial<Omit<ApiDoc, 'id'>>): Promise<Controller> => {
    return request(`/controllers/${controllerId}/routes`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateRoute = (controllerId: string, routeId: string, data: Partial<ApiDoc>): Promise<Controller> => {
    return request(`/controllers/${controllerId}/routes/${routeId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const deleteRoute = (controllerId: string, routeId: string): Promise<Controller> => {
    return request(`/controllers/${controllerId}/routes/${routeId}`, {
        method: 'DELETE',
    });
};