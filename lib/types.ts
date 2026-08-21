export type QuestionType =
  | "multipla_escolha"
  | "interpretacao"
  | "leitura";

export interface Question {
  id: string;
  tipo: QuestionType;
  enunciado: string;
  // Texto de apoio para questões de leitura (pode ser igual pra várias perguntas)
  textoApoio?: string;
  // Só existe para múltipla escolha
  opcoes?: string[];
  // Índice da opção correta (só multipla_escolha) — nunca é enviado ao cliente antes da correção
  respostaCorreta?: number;
}

export interface QuizGerado {
  idioma: "portugues" | "ingles";
  nivel: string;
  questoes: Question[];
}

export interface RespostaAluno {
  questaoId: string;
  resposta: string; // índice (como string) para múltipla escolha, texto livre pro resto
}

export interface FeedbackQuestao {
  questaoId: string;
  correta: boolean | null; // null quando é avaliação por nota (questão aberta)
  nota?: number; // 0-10, só para questões abertas
  comentario: string; // o que acertou / o que pode melhorar
}

export interface ResultadoCorrecao {
  pontuacaoGeral: number; // 0-10
  totalCertas: number;
  totalQuestoes: number;
  feedbacks: FeedbackQuestao[];
  comentarioGeral: string;
  materiaEstudo: string; // texto explicativo pra página 5
}

export interface AlunoInfo {
  nome: string;
  email: string;
}
