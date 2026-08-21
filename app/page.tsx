"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { sessionStore } from "@/lib/session";

export default function HomePage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setErro("Preencha nome e email para continuar.");
      return;
    }
    sessionStore.limpar();
    sessionStore.setAluno({ nome: nome.trim(), email: email.trim() });
    router.push("/estudar");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-pencil">
        Quiz de estudo
      </p>
      <h1 className="font-display text-4xl font-semibold leading-tight text-board">
        Vamos praticar o que você estudou.
      </h1>
      <p className="mt-3 text-pencil">
        Digite seu nome e email para começar. É assim que guardamos seu
        histórico de exercícios.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wide text-pencil">
            Nome
          </span>
          <input
            className="focus-ring rounded-sm border border-line bg-white px-4 py-3 font-body text-graphite"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs uppercase tracking-wide text-pencil">
            Email
          </span>
          <input
            type="email"
            className="focus-ring rounded-sm border border-line bg-white px-4 py-3 font-body text-graphite"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </label>

        {erro && <p className="text-sm text-wrong">{erro}</p>}

        <Button type="submit" className="mt-2 self-start">
          Começar →
        </Button>
      </form>
    </main>
  );
}
