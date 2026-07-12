export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = "An error occurred";
    try {
      const data = await response.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch {
      // Ignore JSON parse error on non-JSON response
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  vehicles: {
    list: () => apiRequest<any[]>("/api/vehicles"),
    create: (data: any) =>
      apiRequest<any>("/api/vehicles", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest<any>(`/api/vehicles/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/api/vehicles/${id}`, { method: "DELETE" }),
  },
  drivers: {
    list: () => apiRequest<any[]>("/api/drivers"),
    create: (data: any) =>
      apiRequest<any>("/api/drivers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest<any>(`/api/drivers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/api/drivers/${id}`, { method: "DELETE" }),
  },
  maintenance: {
    list: () => apiRequest<any[]>("/api/maintenance"),
    create: (data: any) =>
      apiRequest<any>("/api/maintenance", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest<any>(`/api/maintenance/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/api/maintenance/${id}`, { method: "DELETE" }),
  },
  expenses: {
    list: () => apiRequest<any[]>("/api/expenses"),
    create: (data: any) =>
      apiRequest<any>("/api/expenses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/api/expenses/${id}`, { method: "DELETE" }),
  },
  trips: {
    list: () => apiRequest<any[]>("/api/trips"),
    create: (data: any) =>
      apiRequest<any>("/api/trips", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest<any>(`/api/trips/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest<void>(`/api/trips/${id}`, { method: "DELETE" }),
  },
};
