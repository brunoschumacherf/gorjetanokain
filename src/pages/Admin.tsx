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
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="glass-strong rounded-3xl p-10 max-w-md w-full shadow-2xl glow">
          <h1 className="text-5xl font-black text-center mb-10 text-white">🔒 Acesso Administrativo</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="usuario" className="block text-sm font-bold text-white mb-3 uppercase tracking-wider text-lg">
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
                className="w-full px-5 py-4 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-white/60 transition-all"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="senha" className="block text-sm font-bold text-white mb-3 uppercase tracking-wider text-lg">
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
                className="w-full px-5 py-4 rounded-2xl bg-white/10 border-2 border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-white/60 transition-all"
              />
              {erro && <p className="mt-3 text-sm text-red-300 font-semibold">{erro}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 px-8 button-gradient text-white font-black text-lg rounded-2xl shadow-2xl uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
            <p className="text-center text-sm text-white/80 font-medium">
              💡 Use: usuário "nokain" e senha "nokaingay"
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="glass-strong border-b-4 border-white/30 p-6 flex justify-between items-center shadow-xl">
        <h2 className="text-3xl font-black text-white">Painel Administrativo</h2>
        <button
          onClick={handleLogout}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl glow-hover"
        >
          Sair
        </button>
      </div>
      <PainelAdmin />
    </div>
  );
}
