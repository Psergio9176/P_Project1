import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { usuarioService } from '../services/api';
import { Usuario } from '../types';

export const ColaboradoresPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    cpf: '',
    nome: '',
    email: '',
    senha: '',
    perfil: 'COLABORADOR' as 'COLABORADOR' | 'ADMIN',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usuarioService.criar(formData);
      const data = await usuarioService.listar();
      setUsuarios(data);
      setShowModal(false);
      setFormData({ cpf: '', nome: '', email: '', senha: '', perfil: 'COLABORADOR' });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar colaborador');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute perfis={['ADMIN']}>
      <Layout>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Colaboradores</h1>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
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

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-4">
              <h2 className="text-lg font-semibold mb-4">Novo Colaborador</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    maxLength={11}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                  <select
                    value={formData.perfil}
                    onChange={(e) => setFormData({ ...formData, perfil: e.target.value as 'COLABORADOR' | 'ADMIN' })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="COLABORADOR">Colaborador</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:bg-blue-400"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
};
