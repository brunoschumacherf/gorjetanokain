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
      alert('O sorteio precisa estar aberto para executar!');
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
    if (!sorteio) return { color: 'bg-gray-500', label: 'Nenhum sorteio' };
    if (sorteio.vencedorId) return { color: 'bg-yellow-500', label: 'Sorteado' };
    if (sorteio.aberto) return { color: 'bg-green-500', label: 'Aberto' };
    return { color: 'bg-gray-500', label: 'Fechado' };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">🎰 Painel Administrativo</h1>
        <div className={`${statusInfo.color} text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg`}>
          Status: {statusInfo.label}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 text-center border-4 border-blue-500 shadow-xl">
          <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">{totalParticipantes}</div>
          <div className="text-lg font-semibold text-blue-700">Participantes</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center border-4 border-blue-500 shadow-xl">
          <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">{statusInfo.label}</div>
          <div className="text-lg font-semibold text-blue-700">Status</div>
        </div>
      </div>

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!sorteio ? (
            <button
              onClick={() => handleAcaoComConfirmacao(
                criarNovoSorteio,
                'Deseja criar um novo sorteio?'
              )}
              disabled={loading}
              className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➕ Criar Novo Sorteio
            </button>
          ) : (
            <>
              {!sorteio.aberto && !sorteio.vencedorId && (
                <button
                  onClick={() => handleAcaoComConfirmacao(
                    abrirSorteioAtual,
                    'Deseja abrir o sorteio para cadastros?'
                  )}
                  disabled={loading}
                  className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🟢 Abrir Sorteio
                </button>
              )}

              {sorteio.aberto && (
                <>
                  <button
                    onClick={() => handleAcaoComConfirmacao(
                      encerrarSorteioAtual,
                      'Deseja encerrar o sorteio? Todos os participantes serão removidos.'
                    )}
                    disabled={loading}
                    className="px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🔴 Encerrar Sorteio
                  </button>
                  <button
                    onClick={handleExecutarSorteio}
                    disabled={loading || participantes.length === 0}
                    className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🎲 Executar Sorteio
                  </button>
                </>
              )}

              {sorteio.vencedorId && (
                <button
                  onClick={() => handleAcaoComConfirmacao(
                    resetarSorteioAtual,
                    'Deseja resetar e criar um novo sorteio? Todos os participantes serão removidos.'
                  )}
                  disabled={loading}
                  className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔄 Resetar e Criar Novo
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {sorteio && sorteio.aberto && (
        <div className="mb-8">
          <RoletaAnimada
            participantes={participantes}
            onSorteioCompleto={handleSorteioCompleto}
            onIniciarSorteio={handleExecutarSorteio}
            vencedorId={sorteio.vencedorId || undefined}
          />
        </div>
      )}

      {sorteio && sorteio.vencedorId && sorteio.aberto && (
        <div className="mb-8">
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
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              🎲 Sortear Novamente
            </button>
          </div>
        </div>
      )}

      {vencedor && (
        <div className="mb-8">
          <div className="bg-white rounded-3xl p-8 border-4 border-yellow-500 shadow-2xl">
            <h2 className="text-3xl font-black text-center mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">🏆 Vencedor do Sorteio 🏆</h2>
            <div className="bg-blue-50 rounded-2xl p-6 space-y-3 border-2 border-blue-200">
              <p className="text-lg"><strong className="text-blue-700">Nome:</strong> <span className="text-gray-800">{vencedor.nome}</span></p>
              <p className="text-lg"><strong className="text-blue-700">CPF:</strong> <span className="text-gray-800">{formatCPF(vencedor.cpf)}</span></p>
              <p className="text-lg"><strong className="text-blue-700">Email:</strong> <span className="text-gray-800">{vencedor.email}</span></p>
              <p className="text-lg"><strong className="text-blue-700">Chave Pix:</strong> <span className="text-gray-800">{vencedor.chavePix}</span></p>
              <p className="text-lg"><strong className="text-blue-700">ID Usuário:</strong> <span className="text-gray-800">{vencedor.idUsuario}</span></p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">📋 Lista de Participantes ({participantes.length})</h2>
        {participantes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border-4 border-blue-500 shadow-xl">
            <p className="text-xl text-blue-600">Nenhum participante cadastrado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participantes.map((participante) => (
              <div key={participante.id} className="bg-white rounded-xl p-4 border-2 border-blue-300 hover:border-blue-500 transition-all shadow-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-lg font-bold text-blue-900">{participante.nome}</span>
                  {vencedor?.id === participante.id && (
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-3 py-1 rounded-lg text-xs font-bold">
                      🏆 VENCEDOR
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm text-blue-700">
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
        <div className="fixed inset-0 bg-blue-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-bold text-white">Processando...</p>
        </div>
      )}
    </div>
  );
}
