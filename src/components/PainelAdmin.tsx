import { useState } from 'react';
import { useSorteio } from '../contexts/SorteioContext';
import { RoletaAnimada } from './RoletaAnimada';
import type { Participante } from '../types';
import { formatCPF } from '../utils/cpfValidator';

export function PainelAdmin() {
  const {
    sorteio,
    participantes,
    totalParticipantes,
    vencedor,
    loading,
    criarNovoSorteio,
    abrirSorteioAtual,
    encerrarSorteioAtual,
    executarSorteioAtual,
    resetarSorteioAtual,
    carregarParticipantes,
    carregarSorteio
  } = useSorteio();

  const handleExecutarSorteio = async (): Promise<string | null> => {
    if (participantes.length === 0) {
      alert('Não há participantes para sortear!');
      return null;
    }

    if (!sorteio || !sorteio.aberto) {
      alert('A gorjeta precisa estar aberta para executar!');
      return null;
    }

    try {
      const vencedorId = await executarSorteioAtual();
      return vencedorId;
    } catch (error) {
      console.error('Erro ao executar sorteio:', error);
      alert('Erro ao executar sorteio. Tente novamente.');
      return null;
    }
  };

  const handleSorteioCompleto = async (vencedor: Participante) => {
    await carregarSorteio();
    await carregarParticipantes();
  };

  const handleAcaoComConfirmacao = async (acao: () => Promise<void>, mensagem: string) => {
    if (window.confirm(mensagem)) {
      try {
        await acao();
      } catch (error) {
        console.error('Erro na ação:', error);
        alert('Erro ao executar ação. Tente novamente.');
      }
    }
  };

  const getStatusInfo = () => {
    if (!sorteio) return { color: 'bg-gray-500', label: 'Nenhuma gorjeta' };
    if (sorteio.vencedorId) return { color: 'bg-yellow-500', label: 'Gorjeta Sorteada' };
    if (sorteio.aberto) return { color: 'bg-green-500', label: 'Aberta' };
    return { color: 'bg-gray-500', label: 'Fechada' };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
        <h1 className="text-5xl font-black text-white">💰 Painel de Gorjetas</h1>
        <div className={`${statusInfo.color} text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-2xl glow`}>
          Status: {statusInfo.label}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="glass-strong rounded-3xl p-8 text-center shadow-2xl glow card-hover">
          <div className="text-6xl font-black text-gradient mb-3">{totalParticipantes}</div>
          <div className="text-xl font-semibold text-white uppercase tracking-wider">Participantes</div>
        </div>
        <div className="glass-strong rounded-3xl p-8 text-center shadow-2xl glow card-hover">
          <div className="text-4xl font-black text-gradient mb-3">{statusInfo.label}</div>
          <div className="text-xl font-semibold text-white uppercase tracking-wider">Status</div>
        </div>
      </div>

      <div className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {!sorteio ? (
            <button
              onClick={() => handleAcaoComConfirmacao(
                criarNovoSorteio,
                'Deseja criar uma nova gorjeta?'
              )}
              disabled={loading}
              className="px-8 py-5 button-gradient text-white font-bold rounded-2xl shadow-2xl glow-hover card-hover disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              ➕ Criar Nova Gorjeta
            </button>
          ) : (
            <>
              {!sorteio.aberto && !sorteio.vencedorId && (
                <button
                  onClick={() => handleAcaoComConfirmacao(
                    abrirSorteioAtual,
                    'Deseja abrir a gorjeta para cadastros?'
                  )}
                  disabled={loading}
                  className="px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-2xl glow-hover card-hover disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  🟢 Abrir Gorjeta
                </button>
              )}

              {sorteio.aberto && (
                <>
                  <button
                    onClick={() => handleAcaoComConfirmacao(
                      encerrarSorteioAtual,
                      'Deseja encerrar a gorjeta? Todos os participantes serão removidos.'
                    )}
                    disabled={loading}
                    className="px-8 py-5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-2xl shadow-2xl glow-hover card-hover disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    🔴 Encerrar Gorjeta
                  </button>
                  <button
                    onClick={handleExecutarSorteio}
                    disabled={loading || participantes.length === 0}
                    className="px-8 py-5 button-gradient text-white font-bold rounded-2xl shadow-2xl glow-hover card-hover disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    🎲 Sortear Gorjeta
                  </button>
                </>
              )}

              {sorteio.vencedorId && (
                <button
                  onClick={() => handleAcaoComConfirmacao(
                    resetarSorteioAtual,
                    'Deseja resetar e criar uma nova gorjeta? Todos os participantes serão removidos.'
                  )}
                  disabled={loading}
                  className="px-8 py-5 button-gradient text-white font-bold rounded-2xl shadow-2xl glow-hover card-hover disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  🔄 Resetar e Criar Nova
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {sorteio && sorteio.aberto && (
        <div className="mb-10">
          <RoletaAnimada
            participantes={participantes}
            onSorteioCompleto={handleSorteioCompleto}
            onIniciarSorteio={handleExecutarSorteio}
            vencedorId={sorteio.vencedorId || undefined}
          />
        </div>
      )}

      {sorteio && sorteio.vencedorId && sorteio.aberto && (
        <div className="mb-10">
          <div className="text-center">
            <button
              onClick={() => handleAcaoComConfirmacao(
                async () => {
                  await executarSorteioAtual();
                  await carregarSorteio();
                },
                'Deseja sortear novamente? Um novo vencedor será escolhido.'
              )}
              disabled={loading || participantes.length === 0}
              className="px-10 py-5 button-gradient text-white font-bold rounded-2xl shadow-2xl glow-hover card-hover disabled:opacity-50 disabled:cursor-not-allowed text-xl"
            >
              🎲 Sortear Novamente
            </button>
          </div>
        </div>
      )}

      {vencedor && (
        <div className="mb-10">
          <div className="glass-strong rounded-3xl p-10 shadow-2xl glow border-4 border-yellow-400/50">
            <h2 className="text-4xl font-black text-center mb-8 text-white">🏆 Vencedor da Gorjeta 🏆</h2>
            <div className="glass rounded-3xl p-8 space-y-4 border-2 border-white/30">
              <p className="text-xl"><strong className="text-white font-bold">Nome:</strong> <span className="text-white/90">{vencedor.nome}</span></p>
              <p className="text-xl"><strong className="text-white font-bold">CPF:</strong> <span className="text-white/90">{formatCPF(vencedor.cpf)}</span></p>
              <p className="text-xl"><strong className="text-white font-bold">Email:</strong> <span className="text-white/90">{vencedor.email}</span></p>
              <p className="text-xl"><strong className="text-white font-bold">Chave Pix:</strong> <span className="text-white/90">{vencedor.chavePix}</span></p>
              <p className="text-xl"><strong className="text-white font-bold">ID Usuário:</strong> <span className="text-white/90">{vencedor.idUsuario}</span></p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-10">
        <h2 className="text-4xl font-black mb-8 text-white">📋 Lista de Participantes ({participantes.length})</h2>
        {participantes.length === 0 ? (
          <div className="glass-strong rounded-3xl p-12 text-center shadow-2xl glow">
            <p className="text-2xl text-white/80">Nenhum participante cadastrado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {participantes.map((participante) => (
              <div key={participante.id} className="glass rounded-2xl p-6 border-2 border-white/30 hover:border-white/60 transition-all shadow-xl card-hover">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xl font-bold text-white">{participante.nome}</span>
                  {vencedor?.id === participante.id && (
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider">
                      🏆 VENCEDOR
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm text-white/80">
                  <p>CPF: {formatCPF(participante.cpf)}</p>
                  <p>Email: {participante.email}</p>
                  <p>ID: {participante.idUsuario}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-2xl font-bold text-white">Processando...</p>
        </div>
      )}
    </div>
  );
}
