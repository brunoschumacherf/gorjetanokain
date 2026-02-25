import { useState, useEffect, useRef } from 'react';
import type { Participante } from '../types';

interface RoletaAnimadaProps {
  participantes: Participante[];
  onSorteioCompleto: (vencedor: Participante) => void;
  onIniciarSorteio: () => Promise<string | null>;
  vencedorId?: string | null;
}

// Cores alternando: Azul, Verde, Amarelo, Roxo, Vermelho
const CORES = [
  { r: 59, g: 130, b: 246 },   // blue-500
  { r: 34, g: 197, b: 94 },    // green-500
  { r: 234, g: 179, b: 8 },    // yellow-500
  { r: 168, g: 85, b: 247 },   // purple-500
  { r: 239, g: 68, b: 68 },    // red-500
  { r: 37, g: 99, b: 235 },    // blue-600
  { r: 22, g: 163, b: 74 },    // green-600
  { r: 202, g: 138, b: 4 },    // yellow-600
  { r: 147, g: 51, b: 234 },   // purple-600
  { r: 220, g: 38, b: 38 },    // red-600
];

export function RoletaAnimada({ participantes, onSorteioCompleto, onIniciarSorteio, vencedorId }: RoletaAnimadaProps) {
  const [sorteando, setSorteando] = useState(false);
  const [vencedorAtual, setVencedorAtual] = useState<Participante | null>(null);
  const [rotacao, setRotacao] = useState(0);
  const [velocidade, setVelocidade] = useState(0);
  const animationFrameRef = useRef<number>();

  const iniciarSorteio = async () => {
    if (participantes.length === 0) {
      alert('Não há participantes para sortear!');
      return;
    }

    setSorteando(true);
    setVencedorAtual(null);
    setRotacao(0);
    setVelocidade(5);

    let vencedorIdBackend: string | null = null;
    try {
      vencedorIdBackend = await onIniciarSorteio();
    } catch (error) {
      console.error('Erro ao executar sorteio:', error);
      setSorteando(false);
      alert('Erro ao executar sorteio. Tente novamente.');
      return;
    }

    if (!vencedorIdBackend) {
      setSorteando(false);
      return;
    }

    const vencedor = participantes.find(p => p.id === vencedorIdBackend);
    if (!vencedor) {
      setSorteando(false);
      return;
    }

    const indiceVencedor = participantes.findIndex(p => p.id === vencedorIdBackend);
    const anguloPorParticipante = 360 / participantes.length;
    const anguloVencedorInicio = indiceVencedor * anguloPorParticipante;
    const anguloVencedorMeio = anguloVencedorInicio + (anguloPorParticipante / 2);
    
    // A seta aponta para cima (0 graus), então precisamos calcular a rotação necessária
    // para que o meio do segmento do vencedor fique no topo
    // Como a roleta gira no sentido horário, precisamos subtrair o ângulo
    let rotacaoNecessaria = 360 - anguloVencedorMeio;
    
    // Normalizar para garantir que seja positivo
    if (rotacaoNecessaria < 0) {
      rotacaoNecessaria += 360;
    }
    
    // Adicionar múltiplas voltas completas para efeito visual
    const voltasCompletas = 5;
    const rotacaoFinal = (voltasCompletas * 360) + rotacaoNecessaria;

    const acelerarDuration = 2000;
    const velocidadeMaximaDuration = 2000;
    const desacelerarDuration = 6000;

    const startTime = Date.now();
    let currentRotacao = 0;
    let currentVelocidade = 5;

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const totalDuration = acelerarDuration + velocidadeMaximaDuration + desacelerarDuration;

      if (elapsedTime < acelerarDuration) {
        // Acelerando
        const progresso = elapsedTime / acelerarDuration;
        currentVelocidade = 5 + (20 * progresso);
        currentRotacao += currentVelocidade;
        setVelocidade(currentVelocidade);
        setRotacao(currentRotacao);
      } else if (elapsedTime < acelerarDuration + velocidadeMaximaDuration) {
        // Velocidade máxima constante
        currentVelocidade = 25;
        currentRotacao += currentVelocidade;
        setVelocidade(25);
        setRotacao(currentRotacao);
      } else if (elapsedTime < totalDuration) {
        // Desacelerando gradualmente até parar no vencedor
        const progressoDesaceleracao = (elapsedTime - acelerarDuration - velocidadeMaximaDuration) / desacelerarDuration;
        const rotacaoRestante = rotacaoFinal - currentRotacao;
        
        // Easing out quartic (parada mais suave e gradual)
        const easing = 1 - Math.pow(1 - progressoDesaceleracao, 4);
        
        // Calcular nova rotação baseada no easing, garantindo que chegue exatamente no vencedor
        const novaRotacao = currentRotacao + (rotacaoRestante * easing * 0.15);
        currentRotacao = novaRotacao;
        
        // Velocidade diminui gradualmente de forma mais suave
        const velocidadeEasing = Math.pow(1 - progressoDesaceleracao, 3);
        currentVelocidade = 25 * velocidadeEasing;
        
        setRotacao(currentRotacao);
        setVelocidade(currentVelocidade);
      } else {
        setRotacao(rotacaoFinal);
        setVelocidade(0);
        setSorteando(false);
        setVencedorAtual(vencedor);
        onSorteioCompleto(vencedor);
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        return;
      }

      if (elapsedTime < totalDuration) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const vencedor = vencedorAtual || (vencedorId && participantes.find(p => p.id === vencedorId));

  const gerarGradienteConic = () => {
    if (participantes.length === 0) return 'conic-gradient(white, white)';
    
    const stops = participantes.map((_, i) => {
      const inicio = (i * 360) / participantes.length;
      const fim = ((i + 1) * 360) / participantes.length;
      const cor = CORES[i % CORES.length];
      return `rgb(${cor.r}, ${cor.g}, ${cor.b}) ${inicio}deg ${fim}deg`;
    });
    return `conic-gradient(${stops.join(', ')})`;
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
        <div className="relative">
          {vencedor && !sorteando && (
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

          <div className="relative mx-auto" style={{ width: '600px', height: '600px' }}>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-30">
              <div className="w-0 h-0 border-l-[25px] border-r-[25px] border-t-[50px] border-l-transparent border-r-transparent border-t-red-600 drop-shadow-2xl" />
              <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-red-700 -mt-[40px] ml-[5px]" />
            </div>

            <div
              className="absolute inset-0 rounded-full border-8 border-white/40 shadow-2xl transition-transform duration-[16ms] ease-linear"
              style={{
                transform: `rotate(${rotacao}deg)`,
                background: gerarGradienteConic()
              }}
            >
              {participantes.map((participante, index) => {
                const anguloInicio = (index * 360) / participantes.length;
                const anguloFim = ((index + 1) * 360) / participantes.length;
                const meioAngulo = (anguloInicio + anguloFim) / 2;
                const cor = CORES[index % CORES.length];
                
                const primeiroNome = participante.nome.split(' ')[0];
                const raio = 190;
                
                return (
                  <div
                    key={participante.id}
                    className="absolute top-1/2 left-1/2 origin-center"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${meioAngulo}deg) translateY(-${raio}px)`,
                    }}
                  >
                    <div 
                      style={{ 
                        fontSize: '18px',
                        fontWeight: '800',
                        letterSpacing: '1px',
                        lineHeight: '1.4',
                        color: `rgb(${cor.r}, ${cor.g}, ${cor.b})`,
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        WebkitTextStroke: '1.5px rgba(255,255,255,0.95)',
                        textStroke: '1.5px rgba(255,255,255,0.95)',
                        transform: 'rotate(90deg)',
                        maxWidth: '160px',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'
                      }}
                    >
                      {primeiroNome}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-44 h-44 bg-gradient-to-br from-blue-900 to-blue-800 rounded-full border-8 border-white/90 shadow-2xl flex items-center justify-center glow">
              {sorteando ? (
                <div className="text-7xl animate-spin">🎰</div>
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
            disabled={sorteando || participantes.length === 0}
            className="px-12 py-5 button-gradient text-white font-black text-2xl rounded-2xl shadow-2xl glow-hover card-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none uppercase tracking-wider"
          >
            {sorteando ? '🎰 Sorteando...' : vencedor ? '🎲 Sortear Novamente' : '💰 Sortear Gorjeta!'}
          </button>
        </div>
      </div>
    </div>
  );
}
