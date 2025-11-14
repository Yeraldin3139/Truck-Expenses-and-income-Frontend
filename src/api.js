import axios from "axios";

const baseURL = "https://truck-expenses-and-income-backend-1.onrender.com/api";

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { Accept: "application/json" },
});

// Interceptor de petición: marca inicio para medir duración
api.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

// Interceptor de respuesta: maneja errores y registra latencia
api.interceptors.response.use(
  (response) => {
    if (response.config?.metadata?.startTime) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(
        `[API] ${response.config.method?.toUpperCase()} ${
          response.config.url
        } (${duration}ms)`
      );
    }
    return response;
  },
  (error) => {
    const mapped = mapAxiosError(error);
    console.error("[API Error]", mapped);
    return Promise.reject(mapped);
  }
);

function mapAxiosError(error) {
  if (error.code === "ECONNABORTED") {
    return {
      type: "timeout",
      message: "La solicitud tardó demasiado tiempo.",
      status: null,
    };
  }
  if (error.response) {
    const { status, data } = error.response;
    return {
      type: "http",
      status,
      message: data?.message || `Error HTTP ${status}`,
      data,
    };
  }
  if (error.request) {
    return {
      type: "network",
      status: null,
      message: "Fallo de red o backend no disponible.",
    };
  }
  return {
    type: "unknown",
    status: null,
    message: error.message || "Error desconocido",
  };
}

// Servicios para Driver
export const driverService = {
  login: (data) => api.post("/drivers/login", data),
  get: (id) => api.get(`/drivers/${id}`),
  getAll: () => api.get("/drivers"),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
};

// Servicios para Notas
export const noteService = {
  getAll: () => api.get("/notes"),
  create: (data) => api.post("/notes", data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

// Servicios para Carros
export const carService = {
  getAll: () => api.get("/cars"),
  create: (data) => api.post("/cars", data),
  delete: (id) => api.delete(`/cars/${id}`),
};

// Servicios para Libro Mayor
export const ledgerService = {
  getByPlaca: (placa) => api.get("/ledger", { params: { placa } }),
  create: (data) => api.post("/ledger", data),
  update: (id, data) => api.put(`/ledger/${id}`, data),
  delete: (id) => api.delete(`/ledger/${id}`),
};

// Servicios para Viajes
export const tripService = {
  getAll: () => api.get("/trips"),
  create: (data) => api.post("/trips", data),
  delete: (id) => api.delete(`/trips/${id}`),
  getTransactions: (id) => api.get(`/trips/${id}/transactions`),
  createTransaction: (id, data) => api.post(`/trips/${id}/transactions`, data),
  updateTransaction: (txId, data) =>
    api.put(`/trips/transactions/${txId}`, data),
  deleteTransaction: (txId) => api.delete(`/trips/transactions/${txId}`),
};

// Servicios para Rutas GPS
export const routeService = {
  get: (placa, type) => api.get("/routes", { params: { placa, type } }),
  add: (data) => api.post("/routes", data),
  saveBatch: (data) => api.post("/routes/batch", data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
  deleteByPlacaAndType: (placa, type) =>
    api.delete("/routes", { params: { placa, type } }),
};

// Servicios para Horarios
export const scheduleService = {
  getAll: () => api.get("/schedules"),
  get: (placa) => api.get(`/schedules/${placa}`),
  save: (data) => api.post("/schedules", data),
};
