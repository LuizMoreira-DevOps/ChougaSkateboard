# HANDOFF · Retomada operacional da Chouga 2.0

> **Leia este arquivo primeiro quando voltar ao projeto, especialmente em uma nova conversa.** Este é o ponto único para recuperar situação, intenção, prioridades e próxima ação. Atualizar no encerramento de cada sessão de trabalho.

**Data do snapshot:** 15/10/2026.
**Repositório alvo:** [`LuizMoreira-DevOps/ChougaSkateboard`](https://github.com/LuizMoreira-DevOps/ChougaSkateboard).
**Branch conferida:** `main`. **Commit conferido:** `719c64fe468ce6c4ff113e010fdcb6cf5322f5a2`. **Release:** `v0.6.0`.
**Origem das evidências:** arquivos do GitHub e histórico de Actions. Não foi feita execução local, auditoria de Supabase ao vivo, teste manual do site publicado ou alteração de banco nesta etapa documental.

## 1. Qual é a missão

Entregar **uma loja demonstrável ao Dega** para validar a Chouga 2.0 antes de assumir assinatura Nuvemshop. O foco é **Commerce/Storefront**, não blog, CMS editorial ou Wheels agora. O Dega deve navegar pela loja e experimentar listagem, detalhes, seleção de variante e carrinho. A demonstração **não deve fingir cobrança ou compra real**.

Depois de aprovada a proposta comercial, avaliar assinatura e integração Nuvemshop. Queremos ser responsáveis pelo **desenvolvimento do storefront**, e a plataforma comercial pela operação da loja, sem reinventar checkout, estoque ou pagamentos.

## 2. O que já existe (fato confirmado no Git)

- Next.js 16.4, React 19.3, TypeScript strict, App Router, CSS Modules;
- Header, Hero, Footer, seção `FeaturedProducts` e `ProductCard` na Home;
- produtos em destaque **ainda estão em array estático** dentro do componente; `ProductCard` não abre página de produto;
- GitHub Pages com export estático, basePath `/ChougaSkateboard`;
- PR #54 já integrado em 15/10; `v0.6.0` publicada;
- CI (lint, typecheck, build, smoke HTTP), CodeQL, Dependabot, Release Please, workflow CD configurados;
- **não existem ainda** pasta `src/modules/commerce`, SupabaseProvider, produto `[slug]`, carrinho ou testes E2E neste repositório.

### Links diretos

- [Vitrine publicada](https://luizmoreira-devops.github.io/ChougaSkateboard/) (deploy bem-sucedido; inspeção visual manual pendente)
- [Actions](https://github.com/LuizMoreira-DevOps/ChougaSkateboard/actions)
- [PR #54](https://github.com/LuizMoreira-DevOps/ChougaSkateboard/pull/54)
- [Legado e banco compartilhado](https://github.com/LuizMoreira-DevOps/chouga-online)
- [Produto de homologação Nuvemshop](https://chougaskateboard.lojavirtualnuvem.com.br/produtos/chouga-basic-branca-1dgkl/)

## 3. Grande risco: Supabase compartilhado com produção

A aplicação legada `chouga-online` utiliza Supabase. O Git legado contém migrations, a view `public.produtos_catalogo`, serviços `getProdutosCatalogo()` e `getProdutoBySlug(slug)`, políticas RLS de leitura e sincronizadores. **Alterar o banco pode quebrar o site em produção**.

**Regra operacional não negociável:** nenhuma escrita no Supabase compartilhado, nenhuma alteração de schema, RLS, policy, grant, dados, sync, migration ou aplicação legada sem aprovação explícita de Nando, auditoria de dependências, backup, plano de migração compatível e rollback. Não rodar migrações de teste em produção. Não utilizar chave `service_role` no frontend.

Podemos avaliar reaproveitar **somente leitura** a view do catálogo. A existência no repositório não comprova as permissões e o estado real do banco atual. Conferência somente leitura é a primeira etapa.

## 4. Nuvemshop e produto demonstrativo

Existe loja Nuvemshop de **homologação**, cadastrada com dados temporários do responsável. Produto criado: **Chouga Basic Branca**, preço de referência **R$ 90,00**, tamanhos **PP, P, M, G, GG e XG**, com [URL própria](https://chougaskateboard.lojavirtualnuvem.com.br/produtos/chouga-basic-branca-1dgkl/).

**Este produto não está automaticamente no Supabase compartilhado.** Antes de usar dados reais na Chouga 2.0, descobrir se um produto equivalente existe no legado; se não, usar fixture claramente etiquetada e **não inserir em produção apenas para a demo**.

A Nuvemshop continua a escolha registrada no ADR-001 **para a operação da V1**, porém assinatura/API/checkout foram adiados até apresentação ao Dega. Não há token API, integração de carrinho ou checkout implementado.

## 5. Primeira fatia vertical (próxima implementação)

**Tema:** produto com variantes e fonte de dados desacoplada. **Sem alterar banco.**

1. Auditar por leitura os campos retornados pela view `produtos_catalogo` e as políticas ativas no Supabase (mediante acesso seguro disponibilizado pelo responsável); confrontar com `Chouga-online/src/services/produtosServices.js` e migrations.
2. Confirmar com Nando o [ADR-003 proposto](adr/ADR-003-supabase-readonly-homologation.md) e a estratégia de leitura (build ou navegador público com RLS auditada). Até essa aprovação, trabalhar em fixtures isoladas.
3. Introduzir contratos TypeScript mínimos `Product`, `Variant`, `Money` (centavos) e `CommerceProvider` read-only; validar dados externos em runtime.
4. Criar `MockCommerceProvider` para testes/demo e, após auditoria, `SupabaseCommerceProvider` de leitura (adapter isolado).
5. Fazer `/produtos/[slug]` funcionar no **export estático** do Pages com `generateStaticParams`, linkar `ProductCard` e permitir seleção acessível das opções realmente disponíveis.
6. Implementar testes de transformação de dados e navegação desktop/mobile; validar `lint`, `typecheck`, `build` normal e `GITHUB_PAGES=true` build.
7. Abrir PR pequeno, apresentar evidências e só depois aprovar merge.

**Fora desta fatia:** carrinho, checkout, blog, CMS, Wheels, pagamentos, pedidos, alterações no banco ou aplicação legada, reformulação total da Home.

## 6. Critérios de aceite essenciais

- Contratos comerciais independentes de React e Supabase.
- Produtos com IDs/slug estáveis, preços sem aritmética insegura, variantes flexíveis (não somente roupas).
- UI não consome payload de banco diretamente.
- Produto ativo acessível em rota própria; variantes e estados indisponíveis funcionais.
- Navegação por teclado, rótulos, foco visível e responsividade.
- Sem alterações de banco ou código da produção atual.
- Build e publicação compatíveis com Pages; nenhuma dependência de backend invisível.
- Testes relevantes passam **quando implementados e executados**; reportar o que não foi executado.

Mais detalhes: [ROADMAP](ROADMAP.md), [TESTING](TESTING.md), [ARCHITECTURE](../ARCHITECTURE.md).

## 7. Próximas decisões e bloqueios reais

| Tema | Estado / responsável |
| --- | --- |
| Aprovar reuso Supabase em leitura para demo | Nando: decisão pendente (ADR-003) |
| Validar estrutura/RLS ao vivo | Auditoria somente leitura ainda pendente |
| Produto real do legado versus fixture Chouga Basic Branca | Conferir dados sem alterar produção |
| Build-time snapshot versus consulta pública no browser | Comparar SEO, atualização, limites do Pages e RLS |
| Qualidade das imagens/fotografias da demo | Material autorizado pendente |
| Carrinho local da demo | Próxima fatia, sem pedidos/checkout reais |
| Integração Nuvemshop e hospedagem com servidor | Pós-apresentação ao Dega |
| Blog e Wheels | Adiados |

## 8. Procedimento de encerramento da sessão

Registrar neste arquivo, preferencialmente no PR da sessão:

- **Data e hora:** ___
- **Branch / commit atual:** ___
- **Alterações implementadas (links de arquivos/PRs):** ___
- **Testes executados com resultado real:** ___
- **Testes ainda não executados:** ___
- **Pendências, riscos e bloqueios:** ___
- **Decisões aprovadas ou rejeitadas por Nando:** ___
- **Próximo comando/arquivo/tarefa específica:** ___

Não marcar passos como concluídos apenas porque aparecem no plano. Atualizar snapshot e links quando mudar `main`, versão, arquitetura ou dependências.

## 9. Prompt de retomada de amanhã

> Vamos continuar a Chouga 2.0. Leia primeiro `docs/HANDOFF.md`, depois `AGENTS.md`, `ARCHITECTURE.md`, `docs/ROADMAP.md` e o ADR pertinente diretamente no repositório `LuizMoreira-DevOps/ChougaSkateboard`. Confirme o estado atual do GitHub e liste apenas o que mudou desde o handoff. Respeite a regra de não tocar no Supabase e no legado de produção. Continue da **primeira tarefa pendente**, sem reabrir decisões aprovadas nem começar novas funcionalidades fora do MVP da loja.
