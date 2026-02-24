import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Sorteio, Participante } from '../types';
import { getSorteioAtivo, criarSorteio, abrirSorteio, encerrarSorteio, executarSorteio, resetarSorteio } from '../services/sorteioService';
import { listarParticipantes, buscarParticipantePorId, getTotalParticipantes } from '../services/participanteService';

interface SorteioContextType {
  sorteio: Sorteio | null;
  participantes: Participante[];
  totalParticipantes: number;
  vencedor: Participante | null;
  loading: boolean;
  carregarSorteio: () => Promise<void>;
  carregarParticipantes: () => Promise<void>;
  criarNovoSorteio: () => Promise<void>;
  abrirSorteioAtual: () => Promise<void>;
  encerrarSorteioAtual: () => Promise<void>;
  executarSorteioAtual: () => Promise<string | null>;
  resetarSorteioAtual: () => Promise<void>;
  atualizarTotal: () => Promise<void>;
}

const SorteioContext = createContext<SorteioContextType | undefined>(undefined);

export function SorteioProvider({ children }: { children: ReactNode }) {
  const [sorteio, setSorteio] = useState<Sorteio | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [totalParticipantes, setTotalParticipantes] = useState(0);
  const [vencedor, setVencedor] = useState<Participante | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarSorteio = async () => {
    try {
      const sorteioAtivo = await getSorteioAtivo();
      setSorteio(sorteioAtivo);
      
      if (sorteioAtivo?.vencedorId) {
        const vencedorData = await buscarParticipantePorId(sorteioAtivo.vencedorId);
        setVencedor(vencedorData);
      } else {
        setVencedor(null);
      }
    } catch (error) {
      console.error('Erro ao carregar sorteio:', error);
    }
  };

  const carregarParticipantes = async () => {
    try {
      const lista = await listarParticipantes();
      setParticipantes(lista);
      setTotalParticipantes(lista.length);
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
    }
  };

  const atualizarTotal = async () => {
    try {
      const total = await getTotalParticipantes();
      setTotalParticipantes(total);
    } catch (error) {
      console.error('Erro ao atualizar total:', error);
    }
  };

  const criarNovoSorteio = async () => {
    try {
      setLoading(true);
      await criarSorteio();
      await carregarSorteio();
      await carregarParticipantes();
    } catch (error) {
      console.error('Erro ao criar sorteio:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const abrirSorteioAtual = async () => {
    if (!sorteio) {
      throw new Error('Nenhum sorteio encontrado. Crie um sorteio primeiro.');
    }
    try {
      setLoading(true);
      await abrirSorteio(sorteio.id);
      await new Promise(resolve => setTimeout(resolve, 500));
      await carregarSorteio();
    } catch (error) {
      console.error('Erro ao abrir sorteio:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const encerrarSorteioAtual = async () => {
    if (!sorteio) return;
    try {
      setLoading(true);
      await encerrarSorteio(sorteio.id);
      await carregarSorteio();
      await carregarParticipantes();
    } catch (error) {
      console.error('Erro ao encerrar sorteio:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const executarSorteioAtual = async (): Promise<string | null> => {
    if (!sorteio) return null;
    try {
      setLoading(true);
      const vencedorId = await executarSorteio(sorteio.id);
      if (vencedorId) {
        const vencedorData = await buscarParticipantePorId(vencedorId);
        setVencedor(vencedorData);
      }
      await carregarSorteio();
      return vencedorId;
    } catch (error) {
      console.error('Erro ao executar sorteio:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetarSorteioAtual = async () => {
    try {
      setLoading(true);
      await resetarSorteio();
      await carregarSorteio();
      await carregarParticipantes();
      setVencedor(null);
    } catch (error) {
      console.error('Erro ao resetar sorteio:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const inicializar = async () => {
      setLoading(true);
      await carregarSorteio();
      await carregarParticipantes();
      setLoading(false);
    };
    inicializar();
  }, []);

  return (
    <SorteioContext.Provider
      value={{
        sorteio,
        participantes,
        totalParticipantes,
        vencedor,
        loading,
        carregarSorteio,
        carregarParticipantes,
        criarNovoSorteio,
        abrirSorteioAtual,
        encerrarSorteioAtual,
        executarSorteioAtual,
        resetarSorteioAtual,
        atualizarTotal
      }}
    >
      {children}
    </SorteioContext.Provider>
  );
}

export function useSorteio() {
  const context = useContext(SorteioContext);
  if (context === undefined) {
    throw new Error('useSorteio deve ser usado dentro de SorteioProvider');
  }
  return context;
}
