import { useState, useEffect } from 'react';
import { useSorteio } from '../contexts/SorteioContext';
import { formatCPF } from '../utils/cpfValidator';

export function PainelAdmin() {
  const {
    sorteio,
    participantes,
    vencedor,
    vencedoresAcumulados,
    loading,
    criarNovoSorteio,
    abrirSorteioAtual,
    encerrarSorteioAtual,
    executarSorteioAtual,
    resetarSorteioAtual,
    carregarSorteio
  } = useSorteio();

  const [modalVencedorAberto, setModalVencedorAberto] = useState(false);

  useEffect(() => {
    if (vencedor?.id) setModalVencedorAberto(true);
  }, [vencedor?.id]);

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

  return (
    <div className="min-h-screen flex flex-col overflow-y-auto scroll-panel bg-slate-900">
      <div className="h-screen flex flex-col shrink-0">
      <div className="flex-1 flex min-h-0">
      <div
        className="flex-1 min-w-0 flex flex-col overflow-y-auto scroll-panel px-4 py-6 bg-slate-900 bg-no-repeat bg-center relative"
        style={{
          backgroundImage: 'url(/nokain.png)',
          backgroundSize: 'contain'
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/60"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col flex-1 min-h-0">
        <div className="flex flex-wrap items-center gap-3 mb-4 shrink-0">
          <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">💰 Painel de Gorjetas</h1>
        <div className="flex flex-wrap gap-2">
          {!sorteio ? (
            <button
              onClick={() => handleAcaoComConfirmacao(criarNovoSorteio, 'Deseja criar uma nova gorjeta?')}
              disabled={loading}
              className="px-4 py-2.5 button-gradient text-white font-bold rounded-xl text-sm disabled:opacity-50"
            >
              ➕ Criar Gorjeta
            </button>
          ) : (
            <>
              {!sorteio.aberto && !sorteio.vencedorId && (
                <button
                  onClick={() => handleAcaoComConfirmacao(abrirSorteioAtual, 'Deseja abrir a gorjeta para cadastros?')}
                  disabled={loading}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                >
                  🟢 Abrir
                </button>
              )}
              {sorteio.aberto && (
                <>
                  <button
                    onClick={() => handleAcaoComConfirmacao(encerrarSorteioAtual, 'Encerrar gorjeta?')}
                    disabled={loading}
                    className="px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-red-900/30 disabled:opacity-50"
                  >
                    🔴 Encerrar
                  </button>
                  <button
                    onClick={handleExecutarSorteio}
                    disabled={loading || participantes.length === 0}
                    className="px-4 py-2.5 button-gradient text-white font-bold rounded-xl text-sm disabled:opacity-50"
                  >
                    🎲 Sortear
                  </button>
                </>
              )}
              {sorteio.vencedorId && (
                <>
                  <button
                    onClick={() => handleAcaoComConfirmacao(
                      async () => {
                        await executarSorteioAtual();
                        await carregarSorteio();
                      },
                      'Sortear novamente?'
                    )}
                    disabled={loading || participantes.length === 0}
                    className="px-4 py-2.5 button-gradient text-white font-bold rounded-xl text-sm disabled:opacity-50"
                  >
                    🎲 Sortear de novo
                  </button>
                  <button
                    onClick={() => handleAcaoComConfirmacao(resetarSorteioAtual, 'Resetar e criar nova gorjeta?')}
                    disabled={loading}
                    className="px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-xl text-sm shadow-lg disabled:opacity-50"
                  >
                    🔄 Nova gorjeta
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

        </div>
      </div>

      <aside className="w-[22rem] md:w-[26rem] shrink-0 flex flex-col rounded-l-2xl border-l-2 border-white/40 p-5 overflow-hidden bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-black/30">
        <h2 className="text-xl font-black text-white mb-4 shrink-0">📋 Participantes ({participantes.length})</h2>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 scroll-panel pr-1">
          {participantes.length === 0 ? (
            <p className="text-white/70 text-sm">Nenhum participante.</p>
          ) : (
            participantes.map((p) => (
              <div key={p.id} className="glass rounded-xl p-4 border border-white/20 flex flex-col gap-1">
                <p className="text-white font-semibold truncate text-base"><span className="text-amber-300/90 text-sm font-medium">Nome:</span> {p.nome}</p>
                <p className="text-white/70 font-mono text-sm truncate"><span className="text-amber-300/90 font-sans font-medium text-sm">Chave Pix:</span> {p.chavePix}</p>
              </div>
            ))
          )}
        </div>
      </aside>
      </div>
      </div>

      {vencedoresAcumulados.length > 0 && (
        <div className="shrink-0 px-4 py-5 bg-slate-900/95 border-t-2 border-amber-400/60 shadow-[0_-8px 32px rgba(0,0,0,0.3)]">
          <h2 className="text-xl font-black mb-4 text-amber-300 drop-shadow-sm">🏆 Vencedores ({vencedoresAcumulados.length})</h2>
          <div className="overflow-x-auto scroll-panel">
            <div className="flex gap-4 pb-2 min-w-0">
              {vencedoresAcumulados.map((vencedorItem, index) => (
                <div key={vencedorItem.id} className="bg-slate-800/90 rounded-2xl p-5 border-2 border-amber-400/70 shrink-0 w-72 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-amber-300">#{vencedoresAcumulados.length - index}</span>
                    <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-black text-xs uppercase">🏆</span>
                  </div>
                  <p className="font-bold text-white text-lg mb-2">{vencedorItem.participante.nome}</p>
                  <div className="space-y-1 text-sm text-slate-300">
                    <p>CPF: {formatCPF(vencedorItem.participante.cpf)}</p>
                    <p>Email: {vencedorItem.participante.email}</p>
                    <p>Chave Pix: <span className="font-mono">{vencedorItem.participante.chavePix}</span></p>
                    <p>ID: {vencedorItem.participante.idUsuario}</p>
                  </div>
                  {vencedorItem.participante.fotoContaUrl && (
                    <a
                      href={vencedorItem.participante.fotoContaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 text-sm font-semibold text-amber-400 hover:text-amber-300 underline"
                    >
                      📷 Ver print da conta
                    </a>
                  )}
                  <p className="text-xs text-slate-400 mt-3">
                    {vencedorItem.dataSorteio.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {vencedor && modalVencedorAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="relative w-full max-w-md rounded-3xl p-8 border-4 border-amber-400 bg-slate-800/95 shadow-2xl shadow-amber-500/20"
            style={{ animation: 'parabens-pop 0.5s ease-out forwards' }}
          >
            <p className="text-2xl font-black text-amber-300 uppercase tracking-wider text-center mb-1">🎉 Parabéns!</p>
            <p className="text-2xl font-black text-white text-center mb-4">{vencedor.nome}</p>
            <p className="text-lg text-white/90 text-center mb-6">
              Chave Pix: <span className="font-mono font-semibold">{vencedor.chavePix}</span>
            </p>
            <button
              onClick={() => setModalVencedorAberto(false)}
              className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-2xl font-bold text-white">Processando...</p>
        </div>
      )}
    </div>
  );
}
