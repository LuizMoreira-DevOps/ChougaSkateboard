# SETUP · Chouga 2.0

**Verificado no repositório:** 15/10/2026. As instruções correspondem ao `package.json`, `next.config.ts` e workflows existentes. Integrações Supabase/Nuvemshop na Chouga 2.0 **ainda não foram implementadas**.

## 1. Requisitos

- Node.js **24** (mesma major utilizada no CI);
- npm (distribuído com Node);
- Git;
- editor com TypeScript/ESLint;
- navegador moderno;
- acesso ao repositório para clonar/push, conforme permissões.

## 2. Instalação

```bash
git clone https://github.com/LuizMoreira-DevOps/ChougaSkateboard.git
cd ChougaSkateboard
npm ci
npm run dev
```

Abrir `http://localhost:3000`. Se a porta for ocupada, consulte a URL exibida pelo Next.js.

**Windows PowerShell**

```powershell
git clone https://github.com/LuizMoreira-DevOps/ChougaSkateboard.git
Set-Location ChougaSkateboard
npm ci
npm run dev
```

## 3. Scripts realmente existentes

| Comando | Resultado |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento Next.js |
| `npm run lint` | `eslint .` |
| `npm run typecheck` | `next typegen && tsc --noEmit` |
| `npm run build` | `next build` |
| `npm run start` | Inicia build Next.js com runtime Node (depois de build **sem** export estático) |

**Ainda não existem** `npm run test`, `test:e2e`, scripts de seed ou migração neste repositório. Não os inclua em checklist como se já estivessem configurados.

## 4. Build e smoke test

Para build normal com runtime Next.js (local):

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

Abrir `http://localhost:3000` e verificar navegação, estilos e console. Os mesmos comandos básicos de lint/typecheck/build são executados pelo CI; o CI atual também faz smoke HTTP da Home.

### Simular o build publicado no GitHub Pages

**Bash:**

```bash
GITHUB_PAGES=true npm run build
```

**PowerShell:**

```powershell
$env:GITHUB_PAGES = "true"
npm run build
Remove-Item Env:GITHUB_PAGES
```

Isso gera o diretório `out/` com `basePath: /ChougaSkateboard`, para o workflow de publicação do GitHub Pages. **Não usar `npm run start` para testar uma exportação estática.** A validação correta é conferir o artefato exportado e a publicação com o prefixo do repositório. Não confundir um arquivo estático com backend operacional.

## 5. Git e Pull Requests

Fluxo atual: issue → branch curta → PR → CI → squash merge em `main` → Release Please → release aprovada. Para iniciar trabalho:

```bash
git switch main
git pull --ff-only
git switch -c feat/commerce-product-details
```

Não desenvolver diretamente na `main`. Não editar `CHANGELOG.md` manualmente, pois é mantido pela automação. Toda PR deve informar objetivo, escopo, validação realmente executada e itens fora de escopo.

## 6. Variáveis de ambiente e serviços

**Hoje:** não são exigidas variáveis Supabase/Nuvemshop pelo código da Chouga 2.0 presente em `main`.

**Futuro Supabase (a implementar e aprovar):** configurar uma URL de projeto e chave **publishable/anon** somente após auditoria de RLS; escolher nomes de variáveis coerentes com acesso client/build, publicar apenas material autorizado e manter segredos fora do Git. Não copiar variáveis ou segredos da aplicação legada para o novo repositório sem revisão.

**Nunca:** incluir chaves secretas, `service_role`, cookies de sessão ou tokens Nuvemshop em `NEXT_PUBLIC_*`, arquivos rastreados ou frontend. `NEXT_PUBLIC_*` é público por definição após bundling. Github Pages é estático e não armazena segredos de runtime no servidor.

Não rodar `supabase db push`, `supabase migration up` ou scripts de sync no projeto de produção durante este MVP. A leitura da view legada precisa de aprovação prévia.

## 7. Diagnóstico

- **Erro no typecheck:** rodar `npm ci`; depois `npm run typecheck` novamente. Não apagar arquivos gerados/versionados sem avaliar.
- **Build funciona local, falha no Pages:** verificar `GITHUB_PAGES=true`, `basePath`, arquivos em `out/`, URLs de imagens e rotas dinâmicas geradas (`generateStaticParams`).
- **Rota dinâmica 404 no Pages:** conferir se o slug foi incluído na geração estática e se o caminho publicado respeita o prefixo.
- **Produto sem dados:** conferir fonte escolhida (fixture ou Supabase), estado de publicação, schema, RLS e configurações; não alterar políticas de produção como atalho.
- **Falhas de rede:** diferenciar indisponibilidade da fonte de dados de bug visual. Não engolir erros silenciosamente.

## 8. Retomar trabalho sem repetir contexto

1. Ler `docs/HANDOFF.md`.
2. Ler `AGENTS.md`, `ARCHITECTURE.md` e ADR pertinente.
3. Conferir `git status`, branch atual e commit; comparar com o snapshot do HANDOFF.
4. Inspecionar PRs/CI recentes e pendências.
5. Executar só a próxima tarefa autorizada.
6. Ao terminar, atualizar `docs/HANDOFF.md` com resultados reais (inclusive testes não executados).
