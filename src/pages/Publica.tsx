import { FormularioCadastro } from '../components/FormularioCadastro';
import { FooterLinks } from '../components/Sidebar';
import { useSorteio } from '../contexts/SorteioContext';

export function Publica() {
  const { sorteio, totalParticipantes } = useSorteio();

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-float">
          <div className="inline-block mb-6">
            <h1 className="text-6xl md:text-8xl font-black mb-4 text-white leading-tight">
              💰 Gorjeta do Nokain
            </h1>
            <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 rounded-full mx-auto max-w-md animate-pulse"></div>
          </div>
          <p className="text-2xl md:text-3xl text-white font-semibold mb-8 drop-shadow-lg">
            Participe e concorra a gorjetas incríveis! 🎁
          </p>
          
          {sorteio && sorteio.aberto && (
            <div className="inline-flex flex-col items-center rounded-3xl p-8 shadow-2xl mb-8 bg-slate-800 border-2 border-amber-400/50">
              <span className="text-7xl font-black text-white mb-3">
                {totalParticipantes}
              </span>
              <span className="text-xl font-bold text-white uppercase tracking-wider">
                Participantes Cadastrados
              </span>
              <div className="mt-4 flex gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-200 font-semibold">Aberto para cadastros</span>
              </div>
            </div>
          )}

          {(!sorteio || !sorteio.aberto) && (
            <div className="inline-block rounded-2xl p-6 mb-8 bg-slate-800/90 border-2 border-amber-500/50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-amber-100 font-semibold text-lg">Cadastros temporariamente fechados</span>
              </div>
            </div>
          )}
        </div>

        <FormularioCadastro />

        <div className="text-center mt-16">
          <div className="rounded-3xl p-8 max-w-2xl mx-auto bg-slate-800 border-2 border-amber-400/40">
            <p className="text-3xl font-black text-white mb-4">
              ✨ Boa sorte! ✨
            </p>
            <p className="text-xl text-slate-200 font-medium">
              Acompanhe nossas lives para mais oportunidades de ganhar gorjetas!
            </p>
          </div>
        </div>
      </div>
      
      <FooterLinks />
    </div>
  );
}
