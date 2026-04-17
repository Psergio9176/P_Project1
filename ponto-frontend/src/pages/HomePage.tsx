import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { marcacaoService } from '../services/api';
import { OfflineService } from '../services/offlineService';
import { SyncService } from '../services/syncService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useGeolocation } from '../hooks/useGeolocation';
import { MarcacaoHoje, TipoMarcacao } from '../types';

const TIPO_LABELS: Record<TipoMarcacao, string> = {
  ENTRADA: 'Entrada',
  SAIDA_ALMOCO: 'Saída Almoço',
  RETORNO_ALMOCO: 'Retorno Almoço',
  SAIDA: 'Saída',
};

export const HomePage: React.FC = () => {
  const { usuario } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marcacaoHoje, setMarcacaoHoje] = useState<MarcacaoHoje | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMarcacoes, setIsLoadingMarcacoes] = useState(true);
  const [showComprovante, setShowComprovante] = useState(false);
  const [ultimaMarcacao, setUltimaMarcacao] = useState<{ tipo: string; dataHora: string; latitude: number; longitude: number; offline?: boolean } | null>(null);
  const [pendentesCount, setPendentesCount] = useState(0);
  
  const isOnline = useOnlineStatus();
  const { getPosition, loading: loadingGeo } = useGeolocation();

  const carregarMarcacoes = useCallback(async () => {
    try {
      if (isOnline) {
        const data = await marcacaoService.hoje();
        setMarcacaoHoje(data);
        await OfflineService.salvarMarcacoesHoje(data);
      } else {
        const cached = await OfflineService.obterMarcacoesHoje();
        if (cached) {
          setMarcacaoHoje(cached);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar marcações:', error);
      const cached = await OfflineService.obterMarcacoesHoje();
      if (cached) {
        setMarcacaoHoje(cached);
      }
    } finally {
      setIsLoadingMarcacoes(false);
    }
  }, [isOnline]);

  const atualizarPendentesCount = useCallback(async () => {
    const count = await OfflineService.contarPendentes();
    setPendentesCount(count);
  }, []);

  useEffect(() => {
    carregarMarcacoes();
    atualizarPendentesCount();
  }, [carregarMarcacoes, atualizarPendentesCount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isOnline) {
      SyncService.verificarESincronizar().then(atualizarPendentesCount);
    }
  }, [isOnline, atualizarPendentesCount]);

  const handleRegistrar = async () => {
    if (!marcacaoHoje?.proximaMarcacao) return;

    setIsLoading(true);

    try {
      const position = await getPosition();
      const dataHoraLocal = currentTime;
      const dataHoraUtc = new Date(dataHoraLocal.toISOString());

      const marcacaoData = {
        tipo: marcacaoHoje.proximaMarcacao,
        dataHoraUtc: dataHoraUtc.toISOString(),
        dataHoraLocal: dataHoraLocal.toISOString(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        acuraciaGps: position.coords.accuracy,
        userAgent: navigator.userAgent,
      };

      if (isOnline) {
        try {
          const result = await marcacaoService.registrar(marcacaoData);
          setUltimaMarcacao({
            tipo: result.tipo,
            dataHora: dataHoraLocal.toLocaleString('pt-BR'),
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        } catch {
          await OfflineService.salvarMarcacao(marcacaoData);
          setUltimaMarcacao({
            tipo: marcacaoHoje.proximaMarcacao,
            dataHora: dataHoraLocal.toLocaleString('pt-BR'),
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            offline: true,
          });
          await SyncService.agendarSync();
        }
      } else {
        await OfflineService.salvarMarcacao(marcacaoData);
        setUltimaMarcacao({
          tipo: marcacaoHoje.proximaMarcacao,
          dataHora: dataHoraLocal.toLocaleString('pt-BR'),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          offline: true,
        });
        await SyncService.agendarSync();
      }

      setShowComprovante(true);
      await carregarMarcacoes();
      await atualizarPendentesCount();
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      if (err.code === 1 || err.message?.includes('negada')) {
        alert('Geolocalização negada. A marcação requer permissão de localização.');
      } else {
        alert('Erro ao registrar marcação. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatarHora = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatarData = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  const marcacoesOrdem: TipoMarcacao[] = marcacaoHoje?.tipoJornada === 'REDUZIDA'
    ? ['ENTRADA', 'SAIDA']
    : ['ENTRADA', 'SAIDA_ALMOCO', 'RETORNO_ALMOCO', 'SAIDA'];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-gray-500 text-sm capitalize">{formatarData(currentTime)}</p>
          <p className="text-5xl font-bold text-gray-800 mt-2">{formatarHora(currentTime)}</p>
        </div>

        {pendentesCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            {pendentesCount} marcação(ões) pendente(s) de sincronização
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Marcações de Hoje</h2>
          
          {isLoadingMarcacoes ? (
            <p className="text-gray-500 text-center py-4">Carregando...</p>
          ) : (
            <div className="space-y-2">
              {marcacoesOrdem.map((tipo) => {
                const marcacao = marcacaoHoje?.marcacoes.find((m) => m.tipo === tipo);
                const isFeita = !!marcacao;
                const isProxima = marcacaoHoje?.proximaMarcacao === tipo;

                return (
                  <div
                    key={tipo}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isFeita ? 'bg-green-50' : isProxima ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <span className={`font-medium ${isFeita ? 'text-green-700' : 'text-gray-700'}`}>
                      {TIPO_LABELS[tipo]}
                    </span>
                    <span className={`text-sm ${isFeita ? 'text-green-600' : 'text-gray-400'}`}>
                      {isFeita && marcacao ? new Date(marcacao.dataHora).toLocaleTimeString('pt-BR') : '—'}
                    </span>
                    {isFeita && <span className="text-green-600 ml-2">✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={handleRegistrar}
          disabled={isLoading || marcacaoHoje?.todasFeitas || isLoadingMarcacoes || loadingGeo}
          className={`w-full py-4 rounded-lg text-lg font-semibold transition-colors ${
            marcacaoHoje?.todasFeitas
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading || loadingGeo
            ? 'Registrando...'
            : marcacaoHoje?.todasFeitas
            ? 'Todas as marcações feitas'
            : `Registrar ${marcacaoHoje?.proximaMarcacao ? TIPO_LABELS[marcacaoHoje.proximaMarcacao] : ''}`}
        </button>
      </div>

      {showComprovante && ultimaMarcacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <div className={`text-5xl mb-4 ${ultimaMarcacao.offline ? 'text-yellow-500' : 'text-green-500'}`}>
                {ultimaMarcacao.offline ? '⏱' : '✓'}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {ultimaMarcacao.offline ? 'Marcação Salva Offline!' : 'Marcação Registrada!'}
              </h3>
              <p className="text-gray-600 mb-4">
                <strong>{TIPO_LABELS[ultimaMarcacao.tipo as TipoMarcacao]}</strong>
              </p>
              <p className="text-gray-600">{ultimaMarcacao.dataHora}</p>
              {ultimaMarcacao.offline && (
                <p className="text-yellow-600 text-sm mt-2">
                  Sincronização ocorrerá quando a conexão for restaurada
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                <a
                  href={`https://www.google.com/maps?q=${ultimaMarcacao.latitude},${ultimaMarcacao.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Ver localização no mapa
                </a>
              </p>
            </div>
            <button
              onClick={() => setShowComprovante(false)}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};
