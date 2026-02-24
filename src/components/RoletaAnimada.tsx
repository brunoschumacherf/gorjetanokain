import { useState, useEffect } from 'react';
import type { Participante } from '../types';

interface RoletaAnimadaProps {
  participantes: Participante[];
  onSorteioCompleto: (vencedor: Participante) => void;
  onIniciarSorteio: () => Promise<string | null>;
  vencedorId?: string | null;
}

const CORES_BLUE = [
  { r: 30, g: 58, b: 138 },
  { r: 30, g: 64, b: 175 },
  { r: 37, g: 99, b: 235 },
  { r: 29, g: 78, b: 216 },
  { r: 30, g: 58, b: 138 },
  { r: 30, g: 64, b: 175 },
  { r: 37, g: 99, b: 235 },
  { r: 29, g: 78, b: 216 },
];

export function RoletaAnimada({ participantes, onSorteioCompleto, onIniciarSorteio, vencedorId }: RoletaAnimadaProps) {
  const [sorteando, setSorteando] = useState(false);
  const [mostrandoResultado, setMostrandoResultado] = useState(false);
  const [vencedorAtual, setVencedorAtual] = useState<Participante | null>(null);
  const [rotacao, setRotacao] = useState(0);
  const [velocidade, setVelocidade] = useState(0);
  const [rotacaoFinal, setRotacaoFinal] = useState(0);

  const iniciarSorteio = async () => {
    if (participantes.length === 0) {
      alert('Não há participantes para sortear!');
      return;
    }

    setSorteando(true);
    setMostrandoResultado(false);
    setVencedorAtual(null);
    setRotacao(0);
    setRotacaoFinal(0);
    setVelocidade(5);

    let vencedorIdBackend: string | null = null;
    try {
      vencedorIdBackend = await onIniciarSorteio();
      if (vencedorIdBackend) {
        setVencedorAtual(null);
      }
    } catch (error) {
      console.error('Erro ao executar sorteio:', error);
      setSorteando(false);
      alert('Erro ao executar sorteio. Tente novamente.');
      return;
    }

    const acelerar = setInterval(() => {
      setVelocidade((prev) => {
        if (prev < 25) {
          return prev + 0.3;
        }
        clearInterval(acelerar);
        return prev;
      });
    }, 80);

    setTimeout(() => {
      clearInterval(acelerar);
      setVelocidade(25);
    }, 3000);

    setTimeout(() => {
      const desacelerar = setInterval(() => {
        setVelocidade((prev) => {
          if (prev > 0.3) {
            return prev * 0.92;
          }
          clearInterval(desacelerar);
          return 0.3;
        });
      }, 100);
    }, 5000);

    setTimeout(() => {
      setVelocidade(0);
      
      if (vencedorIdBackend) {
        const vencedor = participantes.find(p => p.id === vencedorIdBackend);
        if (vencedor) {
          const indiceVencedor = participantes.findIndex(p => p.id === vencedor.id);
          const anguloPorParticipante = 360 / participantes.length;
          const anguloVencedor = indiceVencedor * anguloPorParticipante;
          const rotacaoNecessaria = 360 - anguloVencedor + (anguloPorParticipante / 2);
          const rotacaoCompleta = rotacao + 1080 + (rotacaoNecessaria % 360);
          setRotacaoFinal(rotacaoCompleta);
          
          setSorteando(false);
          
          setTimeout(() => {
            setMostrandoResultado(true);
            
            setTimeout(() => {
              setVencedorAtual(vencedor);
              setMostrandoResultado(false);
              onSorteioCompleto(vencedor);
            }, 2500);
          }, 500);
        }
      } else {
        setSorteando(false);
      }
    }, 9000);
  };

  useEffect(() => {
    if (!sorteando && rotacaoFinal > 0 && velocidade === 0) {
      const targetRotacao = rotacaoFinal;
      const diff = targetRotacao - rotacao;
      if (Math.abs(diff) > 0.5) {
        const step = diff * 0.15;
        setRotacao(prev => prev + step);
      } else {
        setRotacao(targetRotacao);
      }
      return;
    }

    if (!sorteando || velocidade === 0) {
      return;
    }

    const intervalo = setInterval(() => {
      setRotacao((prev) => prev + velocidade);
    }, 16);

    return () => clearInterval(intervalo);
  }, [sorteando, velocidade, rotacaoFinal, rotacao]);

  const vencedor = vencedorAtual || (vencedorId && participantes.find(p => p.id === vencedorId));
  const anguloPorParticipante = participantes.length > 0 ? 360 / participantes.length : 0;
  let rotacaoAtual = sorteando ? rotacao : (rotacaoFinal > 0 ? rotacaoFinal : rotacao);

  const gerarGradienteConic = () => {
    const stops = participantes.map((_, i) => {
      const inicio = (i * 360) / participantes.length;
      const fim = ((i + 1) * 360) / participantes.length;
      const cor = CORES_BLUE[i % CORES_BLUE.length];
      return `rgb(${cor.r}, ${cor.g}, ${cor.b}) ${inicio}deg, rgb(${cor.r}, ${cor.g}, ${cor.b}) ${fim}deg`;
    }).join(', ');
    return `conic-gradient(from 0deg, ${stops})`;
  };

  if (participantes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass-strong rounded-3xl p-12 text-center shadow-2xl glow">
          <div className="text-6xl mb-4 animate-float">🎰</div>
          <div className="text-2xl font-bold text-white mb-2">Nenhum participante cadastrado</div>
          <div className="text-white/80">Cadastre participantes para iniciar a gorjeta</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="glass-strong rounded-3xl p-8 shadow-2xl border-4 border-white/40 relative overflow-hidden glow">
        {(sorteando || mostrandoResultado) && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                  background: `rgba(59, 130, 246, ${0.6 + Math.random() * 0.4})`
                }}
              />
            ))}
          </div>
        )}

        <div className="relative">
          {vencedor && !sorteando && !mostrandoResultado && (
            <div className="absolute top-4 left-4 z-30 glass-strong rounded-2xl p-5 shadow-2xl max-w-xs glow animate-float">
              <div className="text-4xl mb-3 animate-bounce text-center">🏆</div>
              <div className="text-xl font-black text-white mb-3 text-center">VENCEDOR!</div>
              <div className="glass rounded-xl p-4 border-2 border-white/30">
                <div className="text-lg font-bold text-white mb-3 text-center">{vencedor.nome}</div>
                <div className="space-y-2 text-sm text-white/90">
                  <p>📧 {vencedor.email}</p>
                  <p>🆔 {vencedor.idUsuario}</p>
                  <p>💳 {vencedor.chavePix}</p>
                </div>
              </div>
            </div>
          )}

          {mostrandoResultado && (
            <div className="absolute inset-0 z-20 flex items-center justify-center glass-strong rounded-3xl backdrop-blur-md">
              <div className="text-center">
                <div className="text-8xl mb-6 animate-bounce">🎯</div>
                <div className="text-4xl font-black text-white">Verificando resultado...</div>
              </div>
            </div>
          )}

          <div className="relative mx-auto" style={{ width: '600px', height: '600px' }}>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-30">
              <div className="w-0 h-0 border-l-[25px] border-r-[25px] border-t-[50px] border-l-transparent border-r-transparent border-t-red-600 drop-shadow-2xl" />
              <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-red-700 -mt-[40px] ml-[5px]" />
            </div>

            <div
              className="absolute inset-0 rounded-full border-8 border-blue-300 shadow-2xl transition-transform duration-[16ms] ease-linear"
              style={{
                transform: `rotate(${rotacaoAtual}deg)`,
                background: gerarGradienteConic()
              }}
            >
              {participantes.map((participante, index) => {
                const anguloInicio = (index * 360) / participantes.length;
                const anguloFim = ((index + 1) * 360) / participantes.length;
                const meioAngulo = (anguloInicio + anguloFim) / 2;
                const cor = CORES_BLUE[index % CORES_BLUE.length];
                
                return (
                  <div
                    key={participante.id}
                    className="absolute top-1/2 left-1/2 origin-center"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${meioAngulo}deg) translateY(-180px) rotate(${-meioAngulo}deg)`,
                    }}
                  >
                    <div 
                      className="px-4 py-2 rounded-lg border-2 border-white/50 text-white font-bold text-sm whitespace-nowrap shadow-lg"
                      style={{ backgroundColor: `rgb(${cor.r}, ${cor.g}, ${cor.b})` }}
                    >
                      {participante.nome.substring(0, 12)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-44 h-44 bg-gradient-to-br from-blue-900 to-blue-800 rounded-full border-8 border-white/90 shadow-2xl flex items-center justify-center glow">
              {sorteando ? (
                <div className="text-7xl animate-spin">🎰</div>
              ) : mostrandoResultado ? (
                <div className="text-7xl animate-pulse">🎯</div>
              ) : (
                <div className="text-center text-white">
                  <div className="text-4xl font-black">{participantes.length}</div>
                  <div className="text-xs font-semibold uppercase tracking-wider">Participantes</div>
                </div>
              )}
            </div>

            <div className="absolute inset-0 rounded-full border-4 border-blue-400/50 shadow-inner" />
            <div className="absolute inset-4 rounded-full border-2 border-blue-300/30" />
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={iniciarSorteio}
            disabled={sorteando || participantes.length === 0 || mostrandoResultado}
            className="px-12 py-5 button-gradient text-white font-black text-2xl rounded-2xl shadow-2xl glow-hover card-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none uppercase tracking-wider"
          >
            {sorteando ? '🎰 Sorteando...' : mostrandoResultado ? '⏳ Processando...' : vencedor ? '🎲 Sortear Novamente' : '💰 Sortear Gorjeta!'}
          </button>
        </div>
      </div>
    </div>
  );
}
