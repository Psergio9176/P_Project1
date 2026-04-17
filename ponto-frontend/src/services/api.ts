import axios from 'axios';
import type { LoginResponse, Marcacao, MarcacaoHoje, AjusteMarcacao, Usuario } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !error.config?.url?.includes('refresh')) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return axios(error.config);
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export { api };

export const authService = {
  login: async (cpf: string, senha: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { cpf, senha });
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  
  me: async (): Promise<Usuario> => {
    const response = await api.get<Usuario>('/auth/me');
    return response.data;
  },
};

export const marcacaoService = {
  registrar: async (data: {
    tipo: string;
    dataHoraUtc: string;
    dataHoraLocal: string;
    latitude: number;
    longitude: number;
    acuraciaGps?: number;
    userAgent?: string;
    offline?: boolean;
  }): Promise<Marcacao> => {
    const response = await api.post<Marcacao>('/marcacoes', data);
    return response.data;
  },
  
  syncBatch: async (marcacoes: unknown[]): Promise<{ resultados: unknown[] }> => {
    const response = await api.post('/marcacoes/sync', { marcacoes });
    return response.data;
  },
  
  hoje: async (): Promise<MarcacaoHoje> => {
    const response = await api.get<MarcacaoHoje>('/marcacoes/hoje');
    return response.data;
  },
  
  listar: async (params?: { dataInicio?: string; dataFim?: string }): Promise<Marcacao[]> => {
    const response = await api.get<Marcacao[]>('/marcacoes', { params });
    return response.data;
  },
};

export const ajusteService = {
  criar: async (data: {
    tipo: string;
    dataHoraAjuste: string;
    justificativa: string;
  }): Promise<AjusteMarcacao> => {
    const response = await api.post<AjusteMarcacao>('/ajustes', data);
    return response.data;
  },
  
  meus: async (): Promise<AjusteMarcacao[]> => {
    const response = await api.get<AjusteMarcacao[]>('/ajustes/meus');
    return response.data;
  },
  
  listar: async (status?: string): Promise<AjusteMarcacao[]> => {
    const params = status ? { status } : {};
    const response = await api.get<AjusteMarcacao[]>('/ajustes', { params });
    return response.data;
  },
  
  avaliar: async (id: string, aprovado: boolean): Promise<AjusteMarcacao> => {
    const response = await api.put<AjusteMarcacao>(`/ajustes/${id}/avaliar`, { aprovado });
    return response.data;
  },
};

export const usuarioService = {
  listar: async (): Promise<Usuario[]> => {
    const response = await api.get<Usuario[]>('/usuarios');
    return response.data;
  },
  
  criar: async (data: Partial<Usuario> & { senha: string }): Promise<Usuario> => {
    const response = await api.post<Usuario>('/usuarios', data);
    return response.data;
  },
  
  atualizar: async (id: string, data: Partial<Usuario>): Promise<Usuario> => {
    const response = await api.put<Usuario>(`/usuarios/${id}`, data);
    return response.data;
  },
  
  desativar: async (id: string): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  },
};

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const pushService = {
  getVapidPublicKey: async (): Promise<string> => {
    const response = await api.get<{ publicKey: string }>('/push/vapid-public-key');
    return response.data.publicKey;
  },
  
  subscribe: async (subscription: PushSubscriptionData): Promise<void> => {
    await api.post('/push/subscribe', subscription);
  },
  
  unsubscribe: async (endpoint: string): Promise<void> => {
    await api.delete('/push/unsubscribe', { data: { endpoint } });
  },
};

export const espelhoService = {
  verificarAssinatura: async (usuarioId: string, mes: string) => {
    const response = await api.get(`/espelho/${usuarioId}/${mes}/verificar`);
    return response.data;
  },
};
