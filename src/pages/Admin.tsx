import { useState, useEffect } from 'react';
import { PainelAdmin } from '../components/PainelAdmin';
import { verificarAdmin } from '../services/adminService';

const ADMIN_PASSWORD_FALLBACK = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export function Admin() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authSalvo = localStorage.getItem('admin_auth');
    if (authSalvo === 'true') {
      setAutenticado(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      let autenticado = false;
      
      if (usuario && senha) {
        autenticado = await verificarAdmin(usuario, senha);
      }
      
      if (!autenticado && senha === ADMIN_PASSWORD_FALLBACK) {
        autenticado = true;
      }

      if (autenticado) {
        setAutenticado(true);
        localStorage.setItem('admin_auth', 'true');
      } else {
        setErro('Usuário ou senha incorretos');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErro('Erro ao conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAutenticado(false);
    localStorage.removeItem('admin_auth');
    setSenha('');
  };

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-white p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-blue-500">
          <h1 className="text-4xl font-black text-center mb-8 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">🔒 Acesso Administrativo</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="usuario" className="block text-sm font-bold text-blue-700 mb-2 uppercase">
                Usuário
              </label>
              <input
                type="text"
                id="usuario"
                value={usuario}
                onChange={(e) => {
                  setUsuario(e.target.value);
                  setErro('');
                }}
                placeholder="Digite o usuário (opcional)"
                className="w-full px-4 py-3 rounded-xl bg-blue-50 border-2 border-blue-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="senha" className="block text-sm font-bold text-blue-700 mb-2 uppercase">
                Senha do Administrador
              </label>
              <input
                type="password"
                id="senha"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setErro('');
                }}
                placeholder="Digite a senha"
                className="w-full px-4 py-3 rounded-xl bg-blue-50 border-2 border-blue-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black text-lg rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
            <p className="text-center text-sm text-blue-600">
              💡 Use: usuário "nokain" e senha "nokaingay"
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-white">
      <div className="bg-white/80 backdrop-blur-md border-b-4 border-blue-500 p-4 flex justify-between items-center shadow-lg">
        <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Painel Administrativo</h2>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:scale-105 transition-all duration-300"
        >
          Sair
        </button>
      </div>
      <PainelAdmin />
    </div>
  );
}
