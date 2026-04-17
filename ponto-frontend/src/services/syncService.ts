import { marcacaoService } from '../services/api';
import { OfflineService } from './offlineService';

export const SyncService = {
  async sincronizar(): Promise<{ sucesso: number; erro: number }> {
    const pendentes = await OfflineService.obterPendentes();
    
    if (pendentes.length === 0) {
      return { sucesso: 0, erro: 0 };
    }

    const result = await marcacaoService.syncBatch(pendentes);
    const sincronizados: string[] = [];

    let sucesso = 0;
    let erro = 0;

    if (result.resultados) {
      result.resultados.forEach((r: unknown) => {
        const resultado = r as { sucesso?: boolean; id?: string; erro?: string };
        if (resultado.sucesso && resultado.id) {
          sincronizados.push(resultado.id);
          sucesso++;
        } else {
          erro++;
        }
      });
    }

    if (sincronizados.length > 0) {
      await OfflineService.limparSincronizadas(sincronizados);
    }

    return { sucesso, erro };
  },

  async agendarSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-marcacoes');
    } else {
      await this.sincronizar();
    }
  },

  async verificarESincronizar(): Promise<void> {
    if (navigator.onLine) {
      await this.sincronizar();
    }
  },
};
