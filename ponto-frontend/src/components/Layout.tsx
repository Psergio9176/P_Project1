import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const isOnline = useOnlineStatus();
  const { permission, isSubscribed, subscribe } = usePushNotifications();
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);

  useEffect(() => {
    if (permission === 'default' && !isSubscribed) {
      const timer = setTimeout(() => setShowNotifPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [permission, isSubscribed]);

  const isAdmin = usuario?.perfil === 'ADMIN';

  const navItems = [
    { path: '/', label: 'Início', icon: '⏱' },
    { path: '/historico', label: 'Histórico', icon: '📋' },
    { path: '/ajuste', label: 'Ajuste', icon: '✏️' },
    { path: '/espelho', label: 'Espelho', icon: '📄' },
  ];

  if (isAdmin) {
    navItems.push(
      { path: '/admin/colaboradores', label: 'Colaboradores', icon: '👥' },
      { path: '/admin/ajustes', label: 'Ajustes', icon: '✅' },
      { path: '/admin/export', label: 'Exportar', icon: '📥' }
    );
  }

  const handleEnableNotifications = async () => {
    const success = await subscribe();
    if (success) {
      setShowNotifPrompt(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold">Ponto Eletrônico</h1>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {isSubscribed && (
              <span className="text-xs px-2 py-1 rounded bg-purple-500" title="Notificações ativas">
                🔔
              </span>
            )}
            <div className="text-sm">
              <span className="font-medium">{usuario?.nome}</span>
              <button
                onClick={logout}
                className="ml-2 text-xs underline hover:text-blue-200"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 text-xs ${
                location.pathname === item.path
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {showNotifPrompt && permission === 'default' && !isSubscribed && (
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto bg-white rounded-lg shadow-lg p-4 z-50">
          <h3 className="font-semibold text-gray-800 mb-2">Ativar notificações?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Receba lembretes para bater o ponto no horário certo.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEnableNotifications}
              className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium"
            >
              Ativar
            </button>
            <button
              onClick={() => setShowNotifPrompt(false)}
              className="flex-1 bg-gray-100 text-gray-600 py-2 rounded text-sm"
            >
              Não agora
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
