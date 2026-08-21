"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { sessionStore } from "@/lib/session";
import { ResultadoCorrecao } from "@/lib/types";

export default function MateriaPage() {
  const router = useRouter();
  const [resultado, setResultado] = useState<ResultadoCorrecao | null>(null);

  useEffect(() => {
    const r = sessionStore.getResultado();
    if (!r) {
      router.replace("/");
      return;
    }
    setResultado(r);
  }, [router]);

  if (!resultado) return null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <PageHeader
        passo={5}
        totalPassos={5}
        titulo="Matéria para estudar"
        subtitulo="Baseado nos pontos que você mais errou ou teve dúvida."
      />

      <article className="whitespace-pre-wrap rounded-sm border border-line bg-white p-6 font-body leading-relaxed text-graphite">
        {resultado.materiaEstudo}
      </article>

      <div className="mt-10">
        <Button
          variant="ghost"
          onClick={() => {
            sessionStore.limpar();
            router.push("/");
          }}
        >
          Fazer outro exercício
        </Button>
      </div>
    </main>
  );
}
