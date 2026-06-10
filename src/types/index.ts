export interface Participante {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  whatsapp: string;
  chavePix: string;
  idUsuario: string;
  dataCadastro: Date;
  fotoContaUrl?: string;
}

export interface Sorteio {
  id: string;
  status: 'fechado' | 'aberto' | 'sorteado' | 'encerrado'; // Mantido para compatibilidade interna
  aberto: boolean; // Campo real no Firestore
  dataInicio: Date;
  dataFim?: Date;
  vencedorId?: string;
  totalParticipantes: number;
}

export interface Vencedor {
  id: string;
  participante: Participante;
  dataSorteio: Date;
  sorteioId: string;
}
