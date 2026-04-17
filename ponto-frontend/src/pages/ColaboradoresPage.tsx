import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { usuarioService } from '../services/api';
import { Usuario } from '../types';

export const ColaboradoresPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const data = await usuarioService.listar();
        setUsuarios(data);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      } finally {
        setIsLoading(false);
      }
    };
    carregar();
  }, []);

  return (
    <ProtectedRoute perfis={['ADMIN']}>
      <Layout>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Colaboradores</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
              + Novo
            </button>
          </div>

          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Carregando...</p>
          ) : (
            <div className="bg-white rounded-lg shadow divide-y">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{usuario.nome}</p>
                      <p className="text-sm text-gray-500">{usuario.cpf}</p>
                      <p className="text-sm text-gray-500">{usuario.unidade?.nome}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      usuario.perfil === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {usuario.perfil}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};
