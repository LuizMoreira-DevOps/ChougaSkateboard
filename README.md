# Chouga 2.0 · Skateboard Storefront

**Estado verificado em 15/10/2026:** aplicação em desenvolvimento, com uma Home navegável e publicação demonstrativa no GitHub Pages. **Ainda não é um e-commerce transacional.**

A Chouga 2.0 é o novo storefront da Chouga Skateboard, combinando a operação comercial com a identidade de skate, streetwear e cultura urbana da marca.

> Loja limpa. Conteúdo sujo. Engenharia limpa.
> Compramos commodity. Construímos identidade.

**Links**
- [Demonstração pública](https://luizmoreira-devops.github.io/ChougaSkateboard/)
- [Repositório](https://github.com/LuizMoreira-DevOps/ChougaSkateboard)
- [Legado em produção](https://github.com/LuizMoreira-DevOps/chouga-online)
- [Loja Nuvemshop de homologação](https://chougaskateboard.lojavirtualnuvem.com.br/) (não integrada ao storefront)

## Comece por aqui, inclusive em uma nova conversa

**[docs/HANDOFF.md](docs/HANDOFF.md)** é o ponto de retomada: estado real, decisões, bloqueios, próxima tarefa e procedimentos. Leia-o antes de propor implementações. Depois consulte [AGENTS.md](AGENTS.md) e [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## O que existe hoje

| Item | Situação em `main` |
| --- | --- |
| Next.js App Router, React e TypeScript strict | Implementados |
| Header, Hero, Footer | Implementados |
| Home com FeaturedProducts e ProductCard | Implementada com dados locais estáticos |
| Página de produto, variantes selecionáveis, catálogo completo, carrinho | **Não implementados** |
| Supabase na Chouga 2.0 | **Não integrado** |
| Nuvemshop na Chouga 2.0 | **Não integrada** |
| Blog, Editorial, Wheels | Adiados para etapa posterior |
| CI, CodeQL, CD, Release Please | Configurados |
| Testes automatizados de jornadas comerciais | **Não implementados** |

O PR #54 (produtos em destaque) foi integrado em 15/10/2026. A última release conferida foi **v0.6.0**, e o commit de referência de `main` foi `719c64fe`.

## Objetivo imediato

Entregar ao Dega um **MVP demonstrável da loja**, sem assinatura Nuvemshop nem cobranças reais, com Home, catálogo, detalhe de produto, variantes, carrinho demonstrativo e navegação responsiva/acessível. Não apresentar o fluxo de checkout como transação real.

O backlog ordenado está em [docs/ROADMAP.md](docs/ROADMAP.md). A primeira fatia vertical é **contratos `Product`/`Variant`, leitura de catálogo desacoplada e página de produto**.

## Dados comerciais e risco de produção

O legado `chouga-online` já utiliza um **Supabase compartilhado com a aplicação em produção**, incluindo a view `public.produtos_catalogo` e serviços de leitura. Pretendemos **reaproveitar dados em modo somente leitura**, depois de conferir o schema e as políticas **efetivamente implantados**. As migrations encontradas no Git não provam o estado atual do banco.

**Proibido sem aprovação explícita e plano de impacto:** alterar migrations aplicadas, tabelas, views, políticas RLS, grants, dados, sincronizadores ou a aplicação legada. Nunca usar chave `service_role` no navegador ou em builds públicos. Consulte [SECURITY.md](docs/SECURITY.md) e [docs/commerce/INTEGRATION.md](docs/commerce/INTEGRATION.md).

A **Nuvemshop continua como provedor comercial planejado** para operação futura (ADR-001). Até lá, nenhum backend de pagamento, pedido ou estoque próprio será construído.

## Tecnologia e execução

- Next.js **16.4.0** com App Router, React **19.3.0** e TypeScript em modo `strict`.
- CSS Modules e tokens globais; não adicionar dependências sem benefício comprovado.
- Deploy atual: **GitHub Pages com `output: "export"`**. Não há backend Node.js executando nesse ambiente.
- Fluxo: issue → branch curta → PR → CI → revisão → squash merge → release consciente.

```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm run build
```

Use Node.js **24** (versão configurada no CI). Instruções completas para Windows, ambiente, publicação e troubleshooting em [SETUP.md](docs/SETUP.md).

## Documentação

- [AGENTS.md](AGENTS.md): regras duráveis de colaboração, produto e engenharia.
- [ARCHITECTURE.md](docs/ARCHITECTURE.md): arquitetura implementada versus proposta e limites de hospedagem.
- [ACCESSIBILITY.md](docs/ACCESSIBILITY.md): metas, critérios e matriz de testes de acessibilidade.
- [PERFORMANCE.md](docs/PERFORMANCE.md): orçamento e protocolo de medição (sem resultados inventados).
- [SETUP.md](docs/SETUP.md): desenvolvimento local e comandos válidos.
- [SECURITY.md](docs/SECURITY.md): proteção do Supabase de produção e segredos.
- [docs/HANDOFF.md](docs/HANDOFF.md): retomada operacional entre sessões.
- [docs/ROADMAP.md](docs/ROADMAP.md): escopo MVP e critérios de aceite por fatia.
- [docs/TESTING.md](docs/TESTING.md): plano de testes baseado na Jungle Gaming.
- [docs/commerce/INTEGRATION.md](docs/commerce/INTEGRATION.md): mapa legado → domínio e provedor comercial.
- [docs/adr/ADR-003-supabase-readonly-homologation.md](docs/adr/ADR-003-supabase-readonly-homologation.md): **proposta**, ainda não aprovada.
- [docs/architecture/foundation.md](docs/architecture/foundation.md): fundação arquitetural existente.
- [docs/products/vision.md](docs/products/vision.md): visão de longo prazo, não escopo da demo.
- [docs/adr/ADR-001-commerce-provider.md](docs/adr/ADR-001-commerce-provider.md): decisão existente da Nuvemshop.
- [docs/adr/ADR-002-storefront-framework.md](docs/adr/ADR-002-storefront-framework.md): decisão existente do Next.js.
- [docs/release/process.md](docs/release/process.md): processo de releases existente.

## Política de atualização

Ao concluir cada sessão relevante, **atualize `docs/HANDOFF.md`** com data, commit/branch, mudanças concluídas, checks efetivamente executados, bloqueios e próxima ação. Uma feature não deve ser declarada pronta apenas porque está planejada ou visualmente representada.
