# Quiz de Estudo

App para seus alunos praticarem o que estudaram: colam um texto, a IA gera
questões (10/20/30), corrige com nota + comentário, e mostra matéria de
revisão no final. Resultado fica salvo por email e pode ser baixado em PDF.

## Passo a passo para colocar no ar

### 1. Instalar as dependências
Dentro da pasta do projeto:
```
npm install
```

### 2. Criar o projeto no Supabase (banco de dados)
1. Vá em https://supabase.com, crie uma conta grátis e um novo projeto.
2. No painel do projeto, vá em **SQL Editor** → **New query**, cole o
   conteúdo do arquivo `supabase-setup.sql` e clique em Run.
3. Vá em **Project Settings → API** e copie: `Project URL`, a chave
   `anon public`, e a chave `service_role` (essa última é secreta).

### 3. Pegar sua chave da Anthropic
1. Vá em https://console.anthropic.com → **API Keys** → crie uma chave nova.

### 4. Configurar as variáveis de ambiente
Copie o arquivo `.env.local.example` para `.env.local` e preencha com os
valores dos passos 2 e 3:
```
cp .env.local.example .env.local
```

### 5. Testar localmente
```
npm run dev
```
Abra http://localhost:3000 e siga o fluxo.

### 6. Publicar (deploy) no Vercel
1. Suba o código para um repositório no GitHub.
2. Vá em https://vercel.com → **Add New Project** → selecione o repositório.
3. Em **Environment Variables**, adicione as mesmas 4 variáveis do
   `.env.local` (ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
   NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY).
4. Clique em Deploy. Em ~1 minuto seu site está no ar com uma URL tipo
   `seu-projeto.vercel.app`.

## Como funciona o fluxo
1. `/` — aluno digita nome e email.
2. `/estudar` — aluno cola o texto que você mandou, escolhe idioma, nível e
   quantidade de questões.
3. `/quiz` — aluno responde as questões geradas.
4. `/resultados` — nota, correção questão a questão, botão de baixar PDF.
5. `/materia` — texto de revisão gerado com base no que o aluno mais errou.

Cada resultado também é salvo na tabela `resultados` do Supabase,
vinculado ao email do aluno — dá pra consultar o histórico direto pelo
painel do Supabase (Table Editor) por enquanto.

## O que ainda falta pra v2 (combinado que fica pra depois)
- Envio automático do PDF por email.
- Uma página só sua pra ver o histórico de todos os alunos sem entrar no
  Supabase.
