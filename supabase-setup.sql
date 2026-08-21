-- Rode isso no SQL Editor do Supabase (Project -> SQL Editor -> New query)

create table resultados (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamp with time zone default now(),
  nome text not null,
  email text not null,
  idioma text,
  nivel text,
  total_questoes int,
  total_certas int,
  pontuacao_geral numeric,
  quiz jsonb,
  respostas jsonb,
  resultado jsonb
);

-- Índice para consultar rápido o histórico de um aluno pelo email
create index resultados_email_idx on resultados (email);

-- RLS: como não há login, deixamos a tabela sem acesso público direto.
-- As duas rotas de API usam a service role key (só no servidor) e passam por cima disso.
alter table resultados enable row level security;
