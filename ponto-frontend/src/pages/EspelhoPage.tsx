import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { espelhoService } from '../services/api';
import dayjs from 'dayjs';

interface Assinatura {
  mesReferencia: string;
  assinadoEm: string;
  hashEspelho: string;
}

export const EspelhoPage: React.FC = () => {
  const { usuario } = useAuth();
  const [mes, setMes] = useState(dayjs().subtract(1, 'month').format('YYYY-MM'));
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAssinatura, setIsLoadingAssinatura] = useState(false);
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const carregarAssinatura = async () => {
    if (!usuario?.id) return;
    try {
      const data = await espelhoService.verificarAssinatura(usuario.id, mes);
      setAssinatura(data.assinado ? data.assinatura : null);
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
    }
  };

  React.useEffect(() => {
    if (usuario?.id) {
      carregarAssinatura();
    }
  }, [mes, usuario?.id]);

  const handleVisualizar = () => {
    if (!usuario?.id) return;
    
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/espelho/${usuario.id}/${mes}`;
    
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `espelho-${mes}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Erro ao baixar espelho:', error);
        alert('Erro ao gerar espelho. Tente novamente.');
      })
      .finally(() => setIsLoading(false));
  };

  const handleAssinar = async () => {
    if (!usuario?.id) return;
    
    setIsLoadingAssinatura(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/espelho/${usuario.id}/${mes}/assinar`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAssinatura(data.assinatura);
        setShowConfirm(false);
        alert('Espelho assinado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao assinar espelho');
      }
    } catch (error) {
      console.error('Erro ao assinar:', error);
      alert('Erro ao assinar espelho. Tente novamente.');
    } finally {
      setIsLoadingAssinatura(false);
    }
  };

  const mesLabel = dayjs(mes + '-01').format('MMMM [de] YYYY');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Espelho de Ponto</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês de Referência</label>
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              max={dayjs().subtract(1, 'month').format('YYYY-MM')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <button
            onClick={handleVisualizar}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 mb-3"
          >
            {isLoading ? 'Gerando...' : 'Visualizar / Baixar PDF'}
          </button>

          {assinatura ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center text-green-700 mb-2">
                <span className="text-xl mr-2">✓</span>
                <span className="font-semibold">Espelho Assinado</span>
              </div>
              <p className="text-sm text-green-600">
                Assinado em: {dayjs(assinatura.assinadoEm).format('DD/MM/YYYY HH:mm')}
              </p>
            </div>
          ) : (
            <div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3 text-sm text-yellow-800">
                Este espelho ainda não foi assinado.
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
              >
                Assinar Espelho
              </button>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirmar Assinatura</h3>
            <p className="text-gray-600 text-sm mb-4">
              Ao assinar, você concorda com as informações do espelho de ponto de {mesLabel}.
              Esta ação é permanente e será registrada com hash de integridade.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleAssinar}
                disabled={isLoadingAssinatura}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-300"
              >
                {isLoadingAssinatura ? 'Assinando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
