import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import dayjs from 'dayjs';

export const ExportPage: React.FC = () => {
  const [dataInicio, setDataInicio] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [dataFim, setDataFim] = useState(dayjs().format('YYYY-MM-DD'));
  const [formato, setFormato] = useState<'xlsx' | 'csv'>('xlsx');

  const handleExport = () => {
    const url = `http://localhost:3001/api/export/marcacoes?formato=${formato}&dataInicio=${dataInicio}&dataFim=${dataFim}`;
    window.open(url, '_blank');
  };

  return (
    <ProtectedRoute perfis={['ADMIN']}>
      <Layout>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Exportar Marcações</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                <select
                  value={formato}
                  onChange={(e) => setFormato(e.target.value as 'xlsx' | 'csv')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                </select>
              </div>

              <button
                onClick={handleExport}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Exportar
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};
