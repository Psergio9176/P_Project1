import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Marcacao, MarcacaoHoje, Usuario } from '../types';

interface PontoOfflineDB extends DBSchema {
  'marcacoes-pendentes': {
    key: string;
    value: {
      id: string;
      tipo: string;
      dataHoraUtc: string;
      dataHoraLocal: string;
      latitude: number;
      longitude: number;
      acuraciaGps?: number;
      userAgent?: string;
      sincronizado: boolean;
      createdAt: string;
    };
    indexes: { 'by-sync': string };
  };
  'marcacoes-cache': {
    key: string;
    value: Marcacao;
  };
  'marcacoes-hoje-cache': {
    key: string;
    value: MarcacaoHoje;
    expiresAt: number;
  };
  'auth-cache': {
    key: string;
    value: {
      accessToken: string;
      refreshToken: string;
      usuario: Usuario;
    };
  };
}

const DB_NAME = 'ponto-offline-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<PontoOfflineDB> | null = null;

export const getDB = async (): Promise<IDBPDatabase<PontoOfflineDB>> => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<PontoOfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('marcacoes-pendentes')) {
        const store = db.createObjectStore('marcacoes-pendentes', { keyPath: 'id' });
        store.createIndex('by-sync', 'sincronizado');
      }
      if (!db.objectStoreNames.contains('marcacoes-cache')) {
        db.createObjectStore('marcacoes-cache', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('marcacoes-hoje-cache')) {
        db.createObjectStore('marcacoes-hoje-cache', { keyPath: 'data' });
      }
      if (!db.objectStoreNames.contains('auth-cache')) {
        db.createObjectStore('auth-cache', { keyPath: 'accessToken' });
      }
    },
  });

  return dbInstance;
};
