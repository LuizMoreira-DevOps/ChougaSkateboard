# ARCHITECTURE · Chouga 2.0

**Snapshot:** 15/10/2026, `main` no commit `719c64fe`. Este documento distingue explicitamente **implementado**, **proposto** e **condicionado à aprovação**. Para decisões históricas e fundamentação, consulte `docs/architecture/foundation.md`, `docs/adr/ADR-001-commerce-provider.md` e `docs/adr/ADR-002-storefront-framework.md`.

## 1. Objetivo e fronteiras

O produto é um **storefront próprio**, com foco imediato em uma demonstração comercial ao Dega. Cultura, blog e Wheels continuam na visão de produto, mas ficam **adiados no MVP de loja**. A Chouga não deve construir o próprio motor de pagamentos, pedidos, estoque ou conciliação.

- **Brand / UI:** identidade, páginas, navegação e experiência de compra.
- **Commerce:** catálogo, contratos comerciais, variantes e futuro carrinho integrado.
- **Editorial e Wheels:** planejados para outra etapa, sem dependência obrigatória para a loja.
- **Integrations:** adaptadores para fontes de dados e provedores externos.

O modelo arquitetural aprovado é **monólito modular**, desenvolvido por fatias verticais. O App Router é infraestrutura de páginas; regras comerciais não pertencem às rotas.

## 2. Arquitetura implementada (`main`)

```text
src/
├── app/
│   ├── layout.tsx          # metadata global, fontes, html pt-BR
│   ├── page.tsx            # Header + Hero + FeaturedProducts + Footer
│   └── page.module.css
├── components/
│   ├── Header/
│   ├── Hero/
│   ├── FeaturedProducts/   # array estático de quatro itens
│   ├── ProductCard/        # card informativo, sem link de detalhes
│   └── Footer/
└── styles/globals.css      # variáveis CSS e reset
```

- **Runtime:** Next.js 16.4.0, React 19.3.0, TypeScript strict, CSS Modules.
- **CI:** lint, typecheck, build e smoke HTTP em PRs; CodeQL separado.
- **CD:** publicação em GitHub Pages quando há push em `main`.
- **Status:** nenhuma rota de produto/carrinho ou integração Supabase/Nuvemshop existe nesta árvore; não há suíte Playwright nem testes unitários configurados.

A navegação atual mostra âncoras `#cultura` e `#wheels` sem correspondentes seções na Home. A correção é parte do acabamento da primeira demo.

## 3. Arquitetura alvo *proposta* (não implementada)

```text
Next.js App Router (SSR/SSG conforme hospedagem)
   ├── Home e catálogo (Server Components quando viáveis)
   ├── /produtos/[slug] -> ProductDetails + VariantSelector
   └── /carrinho -> estado interativo local na demo
                    |
              Commerce application
                    |
              Commerce domain
          Product, Variant, Money, Cart
                    |
              CommerceProvider (contrato)
                 /          \
     SupabaseCommerceProvider  Fixture/Mock provider
       read-only (proposto)     demo/testes (proposto)
                    |
   Futuro adaptador Nuvemshop, sob validação das capacidades
```

Propor **apenas** os contratos que surgirem da primeira fatia; não construir interfaces genéricas para fornecedores hipotéticos. Domain deve ser independente de Next.js/React/Supabase. A camada de UI recebe dados normalizados, não payloads SQL ou da Nuvemshop. Serviços cuidam de consulta, falha e transformação de dados. Componentes interativos devem permanecer Client Components pequenos.

### Domínio comercial mínimo

- `Product`: id estável, slug, nome, descrição opcional, categoria, imagens, preços, variantes e estado de publicação.
- `Variant`: id ou SKU estável, coleção flexível de opções (não assumir tamanho/cor), estoque e regra de disponibilidade.
- `Money`: valores em unidades menores (centavos) + moeda para evitar erros de ponto flutuante.
- `ProductImage`: URL, texto alternativo, ordem e contexto de variante/cor.
- `CommerceProvider`: operações mínimas de leitura (listagem e consulta por slug), com erros e valores ausentes explícitos.

Não presumir que estoque zero equivale a encomenda, nem gerar variantes inexistentes. A estratégia de carrinho e fechamento só será definida quando o provedor suportar o fluxo real.

## 4. Supabase legado e compatibilidade

O repositório **`LuizMoreira-DevOps/chouga-online`** possui `Chouga-online/src/services/produtosServices.js` com `getProdutosCatalogo` e `getProdutoBySlug`, baseados na view `public.produtos_catalogo`. Migrations versionadas mostram tabelas `produtos`, `variacoes_produto`, `categorias`, `marcas`, `cores`, `tamanhos`, `imagens_produto`, `tags`, `produto_tag`, e revisão das políticas públicas de leitura.

**Importante:** apenas o repositório foi inspecionado. O estado implantado, a integridade do catálogo, as RLS ativas, os acessos e o desempenho das consultas **não foram verificados no Supabase ao vivo**.

Contrato de compatibilidade para a demo, se aprovado:

1. auditar **somente leitura** o esquema e a view no ambiente real;
2. mapear dados atuais para `Product`/`Variant` em adaptador isolado;
3. preservar os contratos e o comportamento do legado, sem mudanças de schema;
4. configurar **somente chave pública publishable/anon**, com RLS confirmada, ou obter dados no build por mecanismo autorizado;
5. não usar credencial privilegiada, escrita em produção, ou sincronização bidirecional;
6. garantir fallback explícito de fixture para builds de demonstração quando a fonte real não estiver configurada.

A Chouga Basic Branca foi cadastrada em **uma loja Nuvemshop de homologação**, não necessariamente na base Supabase existente. Não afirmar que consta no catálogo legado. Escolher produto real da view ou usar fixture claramente identificada.

Ver [INTEGRATION](commerce/INTEGRATION.md) e [ADR-003 proposto](adr/ADR-003-supabase-readonly-homologation.md).

## 5. Publicação atual e limitações

`next.config.ts` usa `GITHUB_PAGES=true` para definir `output: "export"`, `basePath: "/ChougaSkateboard"` e imagens não otimizadas pelo servidor. O workflow `.github/workflows/cd.yml` gera `out/` e publica via GitHub Pages.

**GitHub Pages não hospeda um backend Next.js em execução.** Route Handlers dinâmicos, Server Actions que precisam de runtime, autenticação privada e atualizações SSR em requisição não funcionarão nessa publicação.

Opções para MVP estático:
- fixtures versionadas em build, declaradas como dados demonstrativos;
- consultar Supabase diretamente do browser com chave pública e políticas RLS auditadas, quando necessário e aprovado;
- coletar dados públicos **no build** para gerar rotas estáticas (`generateStaticParams`) e artefatos, com atualização apenas após novo deploy.

**Não** incluir `service_role`, tokens Nuvemshop ou segredos em HTML, bundle, `NEXT_PUBLIC_*`, variáveis de ambiente injetadas no export nem GitHub Actions logs. Se o catálogo dinâmico ou integração autenticada exigir runtime, decidir hospedagem adequada **antes** da implementação.

## 6. Nuvemshop e futuro estado comercial

A Nuvemshop continua escolhida no **ADR-001 como Commerce Provider da V1**. A conta de homologação existente não fornece, por si, integração autenticada com o storefront. Assinatura e ativação de APIs foram adiadas até apresentar a demo ao Dega e validar a decisão.

**Não** afirmar que o carrinho local corresponde ao carrinho Nuvemshop nem que a passagem ao checkout real está resolvida. Investigar oficialmente a compatibilidade de carrinho/checkout e plano antes da implementação transacional.

**Alvo futuro:** Nuvemshop como fonte de verdade de produtos, variantes, preços, disponibilidade e pedidos comerciais conforme integração viável; Supabase legado permanece protegido durante a transição, sem duas fontes contraditórias mantidas sem política definida.

## 7. Qualidade e processo

- Construir por fatias verticais: contrato → origem de dados → página → teste → deploy.
- Tipagem estática **e validação em runtime** para dados externos/localStorage.
- Preferir componentes do servidor; Client Components só para interação.
- Testar domínio (unit), contratos (integration), jornadas (Playwright desktop/mobile) e falhas relevantes.
- Estabelecer medição de performance **antes/depois**; evitar otimização especulativa.
- Acessibilidade WCAG 2.2 AA como objetivo, ver `ACCESSIBILITY.md`.
- CI deve impedir regressões com checks relevantes; criar PRs pequenos e revisáveis.
- Logs/diagnósticos e relatórios de testes sem dados pessoais ou tokens.

Práticas aproveitadas do Pirate Battle/Jungle Gaming: isolamento entre regras e UI, contratos fortes, mocks delimitados, testes de navegação/responsividade, rastreabilidade por PR e releases. **Não** copiar PixiJS, MSW, Axios ou TanStack Query sem necessidade comprovada neste projeto.

## 8. Decisões pendentes

| Decisão | Estado |
| --- | --- |
| Reutilizar Supabase existente em modo leitura no MVP | Proposta condicionada a auditoria e aprovação (ADR-003) |
| Reutilizar produtos reais ou fixture da Chouga Basic Branca | Aberto até conferir view e catálogo |
| Catálogo em build ou leitura direta do navegador | Aberto; depende de latência, política RLS, SEO e hospedagem |
| Carrinho demonstrativo e forma de persistência | Proposto; sem checkout verdadeiro |
| Hospedagem de backend de produção | Aberto; GitHub Pages é apenas estático |
| Estratégia de migração da loja Nuvemshop | Aberto, exige aprovação do Dega e validação comercial |
| Sanity, blog e Wheels | Fora do MVP atual; hipótese futura |

Decisão relevante exige aprovação de Nando e registro de ADR, sem sobrescrever ADR aceito silenciosamente.

## 9. Referências e retomada

- `AGENTS.md`: regras duráveis;
- `docs/HANDOFF.md`: progresso e próxima ação;
- `docs/ROADMAP.md`: etapas e critérios;
- `SETUP.md`: comandos;
- `SECURITY.md`: proibições e processo seguro;
- `docs/TESTING.md`: estratégia de testes;
- `docs/architecture/foundation.md`: documentação arquitetural original.
