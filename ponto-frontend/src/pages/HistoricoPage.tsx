import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { marcacaoService } from '../services/api';
import dayjs from 'dayjs';

interface MarcacaoItem {
  id: string;
  tipo: string;
  dataHoraLocal: string;
  latitude: number;
  longitude: number;
  offline: boolean;
}

export const HistoricoPage: React.FC = () => {
  const [marcacoes, setMarcacoes] = useState<MarcacaoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroData, setFiltroData] = useState('');

  useEffect(() => {
    const carregarMarcacoes = async () => {
      try {
        const response = await marcacaoService.listar({ dataInicio: filtroData || dayjs().startOf('month').toISOString() });
        setMarcacoes(response);
      } catch (error) {
        console.error('Erro ao carregar marcações:', error);
      } finally {
        setIsLoading(false);
      }
    };
    carregarMarcacoes();
  }, [filtroData]);

  const marcacoesAgrupadas = marcacoes.reduce((acc, m) => {
    const data = dayjs(m.dataHoraLocal).format('DD/MM/YYYY');
    if (!acc[data]) acc[data] = [];
    acc[data].push(m);
    return acc;
  }, {} as Record<string, MarcacaoItem[]>);

  const tipoLabels: Record<string, string> = {
    ENTRADA: 'Entrada',
    SAIDA_ALMOCO: 'Saída Almoço',
    RETORNO_ALMOCO: 'Retorno Almoço',
    SAIDA: 'Saída',
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por data</label>
          <input
            type="month"
            value={filtroData || dayjs().format('YYYY-MM')}
            onChange={(e) => setFiltroData(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Carregando...</p>
        ) : Object.keys(marcacoesAgrupadas).length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhuma marcação encontrada</p>
        ) : (
          Object.entries(marcacoesAgrupadas)
            .sort(([a], [b]) => dayjs(b, 'DD/MM/YYYY').valueOf() - dayjs(a, 'DD/MM/YYYY').valueOf())
            .map(([data, items]) => (
              <div key={data} className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-800 mb-3">{data}</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <span className="font-medium text-gray-800">{tipoLabels[item.tipo]}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {dayjs(item.dataHoraLocal).format('HH:mm')}
                        </span>
                        {item.offline && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded ml-2">
                            Offline
                          </span>
                        )}
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm"
                      >
                        Ver mapa
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </Layout>
  );
};
