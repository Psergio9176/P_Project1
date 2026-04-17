import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { ajusteService } from '../services/api';
import { TipoMarcacao } from '../types';
import dayjs from 'dayjs';

const TIPO_LABELS: Record<TipoMarcacao, string> = {
  ENTRADA: 'Entrada',
  SAIDA_ALMOCO: 'Saída Almoço',
  RETORNO_ALMOCO: 'Retorno Almoço',
  SAIDA: 'Saída',
};

export const AjustePage: React.FC = () => {
  const [dataAjuste, setDataAjuste] = useState(dayjs().format('YYYY-MM-DD'));
  const [horaAjuste, setHoraAjuste] = useState('');
  const [tipo, setTipo] = useState<TipoMarcacao>('ENTRADA');
  const [justificativa, setJustificativa] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!horaAjuste) {
      setError('Informe a hora');
      return;
    }

    if (justificativa.length < 10) {
      setError('Justificativa deve ter pelo menos 10 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const dataHoraAjuste = dayjs(`${dataAjuste} ${horaAjuste}`).toISOString();

      await ajusteService.criar({
        tipo,
        dataHoraAjuste,
        justificativa,
      });

      setSuccess(true);
      setJustificativa('');
      setHoraAjuste('');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setError(errorObj.response?.data?.error || 'Erro ao solicitar ajuste');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Solicitar Ajuste Retroativo</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={dataAjuste}
                onChange={(e) => setDataAjuste(e.target.value)}
                max={dayjs().format('YYYY-MM-DD')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input
                type="time"
                value={horaAjuste}
                onChange={(e) => setHoraAjuste(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Marcação</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoMarcacao)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(TIPO_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Justificativa</label>
              <textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Descreva o motivo do ajuste (mínimo 10 caracteres)"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg">
                Ajuste solicitado com sucesso! Aguarde aprovação.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'Enviando...' : 'Solicitar Ajuste'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
