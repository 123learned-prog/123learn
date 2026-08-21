import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        board: "#2D4739",      // verde-quadro-negro (fundo escuro / header)
        paper: "#F7F4EC",      // papel/caderno
        graphite: "#33322E",   // texto principal
        pencil: "#6B6A63",     // texto secundário
        correct: "#3F7A5C",    // verde caneta (acertos)
        wrong: "#B23A2E",      // vermelho caneta (erros/correção)
        highlight: "#E4A33D",  // amarelo giz (destaques)
        line: "#D8D2BF",       // linha de caderno
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        notebook:
          "repeating-linear-gradient(to bottom, transparent, transparent 34px, #D8D2BF 35px)",
      },
    },
  },
  plugins: [],
};
export default config;
