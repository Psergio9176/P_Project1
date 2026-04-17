import { getDB } from './db';
import { MarcacaoHoje } from '../types';

interface MarcacaoOffline {
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
}

export const OfflineService = {
  async salvarMarcacao(marcacao: Omit<MarcacaoOffline, 'id' | 'sincronizado' | 'createdAt'>): Promise<string> {
    const db = await getDB();
    const id = crypto.randomUUID();
    
    await db.add('marcacoes-pendentes', {
      ...marcacao,
      id,
      sincronizado: false,
      createdAt: new Date().toISOString(),
    });

    return id;
  },

  async obterPendentes(): Promise<MarcacaoOffline[]> {
    const db = await getDB();
    return db.getAllFromIndex('marcacoes-pendentes', 'by-sync', false);
  },

  async limparSincronizadas(ids: string[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('marcacoes-pendentes', 'readwrite');
    await Promise.all(ids.map((id) => tx.store.delete(id)));
    await tx.done;
  },

  async marcarComoSincronizada(id: string): Promise<void> {
    const db = await getDB();
    const marcacao = await db.get('marcacoes-pendentes', id);
    if (marcacao) {
      marcacao.sincronizado = true;
      await db.put('marcacoes-pendentes', marcacao);
    }
  },

  async contarPendentes(): Promise<number> {
    const pendentes = await this.obterPendentes();
    return pendentes.length;
  },

  async salvarMarcacoesHoje(data: MarcacaoHoje): Promise<void> {
    const db = await getDB();
    await db.put('marcacoes-hoje-cache', {
      ...data,
      expiresAt: Date.now() + 5 * 60 * 1000,
    } as unknown as MarcacaoHoje);
  },

  async obterMarcacoesHoje(): Promise<MarcacaoHoje | null> {
    const db = await getDB();
    const cached = await db.get('marcacoes-hoje-cache', 'today');
    if (!cached) return null;
    
    const item = cached as unknown as { expiresAt?: number };
    if (item.expiresAt && item.expiresAt < Date.now()) {
      await db.delete('marcacoes-hoje-cache', 'today');
      return null;
    }
    
    return cached;
  },
};
