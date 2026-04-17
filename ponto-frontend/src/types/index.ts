export type Perfil = 'ADMIN' | 'COLABORADOR';

export type TipoJornada = 'PADRAO' | 'REDUZIDA';

export type TipoMarcacao = 'ENTRADA' | 'SAIDA_ALMOCO' | 'RETORNO_ALMOCO' | 'SAIDA';

export interface Usuario {
  id: string;
  cpf: string;
  nome: string;
  email?: string;
  perfil: Perfil;
  tipoJornada: TipoJornada;
  unidade?: Unidade;
  empresa?: Empresa;
}

export interface Empresa {
  id: string;
  nome: string;
}

export interface Unidade {
  id: string;
  nome: string;
  endereco?: string;
  latitude?: number;
  longitude?: number;
  empresaId?: string;
}

export interface Marcacao {
  id: string;
  usuarioId: string;
  tipo: TipoMarcacao;
  dataHoraUtc: string;
  dataHoraLocal: string;
  latitude: number;
  longitude: number;
  acuraciaGps?: number;
  userAgent?: string;
  offline: boolean;
  sincronizado: boolean;
}

export interface MarcacaoHoje {
  data: string;
  tipoJornada: TipoJornada;
  marcacoes: {
    id: string;
    tipo: TipoMarcacao;
    dataHora: string;
    latitude: number;
    longitude: number;
  }[];
  proximaMarcacao: TipoMarcacao | null;
  todasFeitas: boolean;
}

export interface AjusteMarcacao {
  id: string;
  usuarioId: string;
  tipo: TipoMarcacao;
  dataHoraOriginal?: string;
  dataHoraAjuste: string;
  justificativa: string;
  aprovado: boolean | null;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: Usuario;
}
