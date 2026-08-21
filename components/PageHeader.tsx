interface PageHeaderProps {
  passo: number;
  totalPassos: number;
  titulo: string;
  subtitulo?: string;
}

// Elemento assinatura: um "carimbo de professor" no canto — Página X de 5 —
// remete a correção de prova/caderno, e dá contexto de progresso no fluxo.
export function PageHeader({ passo, totalPassos, titulo, subtitulo }: PageHeaderProps) {
  return (
    <header className="mb-10 flex items-start justify-between gap-6 border-b border-line pb-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-board sm:text-4xl">
          {titulo}
        </h1>
        {subtitulo && (
          <p className="mt-2 max-w-prose font-body text-pencil">{subtitulo}</p>
        )}
      </div>
      <div className="flex h-14 w-14 shrink-0 rotate-3 items-center justify-center rounded-full border-2 border-wrong font-mono text-sm text-wrong">
        {passo}/{totalPassos}
      </div>
    </header>
  );
}
