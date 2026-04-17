import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ajusteService } from '../services/api';
import { AjusteMarcacao } from '../types';
import dayjs from 'dayjs';

const TIPO_LABELS: Record<string, string> = {
  ENTRADA: 'Entrada',
  SAIDA_ALMOCO: 'Saída Almoço',
  RETORNO_ALMOCO: 'Retorno Almoço',
  SAIDA: 'Saída',
};

export const AjustesAdminPage: React.FC = () => {
  const [ajustes, setAjustes] = useState<AjusteMarcacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const carregar = async () => {
    try {
      const data = await ajusteService.listar('pendente');
      setAjustes(data);
    } catch (error) {
      console.error('Erro ao carregar ajustes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleAvaliar = async (id: string, aprovado: boolean) => {
    try {
      await ajusteService.avaliar(id, aprovado);
      carregar();
    } catch (error) {
      console.error('Erro ao avaliar:', error);
    }
  };

  return (
    <ProtectedRoute perfis={['ADMIN']}>
      <Layout>
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-gray-800">Ajustes Pendentes</h1>

          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Carregando...</p>
          ) : ajustes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum ajuste pendente</p>
          ) : (
            ajustes.map((ajuste) => (
              <div key={ajuste.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-800">{TIPO_LABELS[ajuste.tipo]}</p>
                    <p className="text-sm text-gray-500">
                      {dayjs(ajuste.dataHoraAjuste).format('DD/MM/YYYY HH:mm')}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    ajuste.aprovado === null ? 'bg-yellow-100 text-yellow-700' :
                    ajuste.aprovado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {ajuste.aprovado === null ? 'Pendente' : ajuste.aprovado ? 'Aprovado' : 'Rejeitado'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{ajuste.justificativa}</p>
                {ajuste.aprovado === null && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAvaliar(ajuste.id, true)}
                      className="flex-1 bg-green-600 text-white py-2 rounded text-sm"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleAvaliar(ajuste.id, false)}
                      className="flex-1 bg-red-600 text-white py-2 rounded text-sm"
                    >
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};
