import { AlunoInfo, QuizGerado, RespostaAluno, ResultadoCorrecao } from "./types";

// Guardamos o estado do fluxo (aluno -> texto -> quiz -> respostas -> resultado)
// no sessionStorage do navegador. É simples e suficiente pro volume de uso
// (poucos alunos, uma sessão de cada vez), sem precisar de um backend de sessão.

const KEYS = {
  aluno: "quiz_aluno",
  quiz: "quiz_gerado",
  respostas: "quiz_respostas",
  resultado: "quiz_resultado",
} as const;

function set<T>(key: string, value: T) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function get<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const sessionStore = {
  setAluno: (a: AlunoInfo) => set(KEYS.aluno, a),
  getAluno: () => get<AlunoInfo>(KEYS.aluno),

  setQuiz: (q: QuizGerado) => set(KEYS.quiz, q),
  getQuiz: () => get<QuizGerado>(KEYS.quiz),

  setRespostas: (r: RespostaAluno[]) => set(KEYS.respostas, r),
  getRespostas: () => get<RespostaAluno[]>(KEYS.respostas),

  setResultado: (r: ResultadoCorrecao) => set(KEYS.resultado, r),
  getResultado: () => get<ResultadoCorrecao>(KEYS.resultado),

  limpar: () => {
    Object.values(KEYS).forEach((k) => sessionStorage.removeItem(k));
  },
};
