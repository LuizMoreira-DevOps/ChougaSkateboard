# ROADMAP · MVP da loja Chouga 2.0

**Data de planejamento:** 15/10/2026. **Objetivo:** demonstração concreta ao Dega, sem assinatura Nuvemshop e sem comércio transacional. Não usar este plano como comprovação de implementação.

## 1. Produto e limites

**Dentro do MVP demonstrativo:** Home coerente com identidade Chouga; navegação comercial; produtos em destaque; catálogo; detalhe de produto; variantes; disponibilidade demonstrativa; carrinho local com itens, subtotal e estados vazios; responsividade; acessibilidade; SEO básico; CI/testes; deploy navegável.

**Fora do MVP:** blog/CMS, Wheels, contas de usuário, pagamentos, pedidos efetivos, logística/frete reais, estoque real sincronizado, motor comercial próprio, backend de escrita, ERP e assinatura Nuvemshop. Não prometer checkout funcional antes de validar recursos e custos da integração.

**Diferencial:** operação visual 80% elegante / 20% textura, com navegação comercial padronizada e fácil de usar.

## 2. Etapas por fatia vertical

### F0 · Memória do projeto e decisões (DOCUMENTAÇÃO)

- [ ] Reconciliar README/AGENTS/arquitetura com estado do Git e preparar PR documental.
- [ ] Revisar proposta ADR-003 com Nando.
- [ ] Confirmar baseline e próximo passo no HANDOFF.

**Aceite:** qualquer colaborador consegue recuperar estado, próximos passos, comandos e riscos sem novo briefing.

### F1 · Product Details com catálogo desacoplado (PRIMEIRA FATIA DE CÓDIGO)

- [ ] Auditar somente leitura a view existente e consumidores do legado; nenhuma escrita.
- [ ] Aprovar política de fonte de dados: fixture e/ou leitura da view do Supabase.
- [ ] Contratos `Product`, `Variant`, `Money` e `CommerceProvider` mínimos.
- [ ] Normalização e validação runtime na fronteira externa.
- [ ] Mock/fixture separada para desenvolvimento e testes.
- [ ] `SupabaseCommerceProvider` read-only **somente após** auditoria/aprovação.
- [ ] Home recebe dados via provedor, sem array hardcoded em componente.
- [ ] `ProductCard` navegável, com IDs e slugs estáveis.
- [ ] `/produtos/[slug]` com dados, imagem/placeholder honesto, metadata, seleção acessível de variantes, preço e estados de indisponibilidade.
- [ ] `generateStaticParams` e links compatíveis com export GitHub Pages.
- [ ] Testes de domínio e de navegação; lint/typecheck/build + build export.

**Aceite:** um visitante acessa a página de produto pelo card e por URL direta, seleciona uma variante válida por mouse/teclado, entende a disponibilidade e navega de volta; tudo funciona após reload no Pages. Não exibir CTA de compra sem função real.

**Produto inicial:** escolher item real existente no catálogo legado, **ou** usar fixture declarada “Chouga Basic Branca, R$ 90,00, PP/P/M/G/GG/XG”. O cadastro na Nuvemshop **não** implica presença no Supabase.

### F2 · Catálogo navegável

- [ ] Página de listagem por produto ativo, com navegação por categoria quando dados permitirem.
- [ ] Fotos e estados vazios, carregamento/falha conforme estratégia de dados.
- [ ] Filtros e ordenação essenciais somente se agregarem valor e houver dados confiáveis.
- [ ] Acessibilidade e mobile; SEO de categorias/rotas públicas.

**Aceite:** visitante localiza produto e abre detalhes sem links quebrados; dados publicados consistentes com fonte escolhida.

### F3 · Carrinho demonstrativo local

- [ ] Modelo de item por produto+variante/identificador estável.
- [ ] Adicionar item, alterar quantidades, remover item e limpar estado.
- [ ] Persistência local validada e versionada, com recuperação de dados inválidos.
- [ ] Subtotal calculado em centavos; limites e indisponibilidade explícitos.
- [ ] Estado vazio e feedback acessível.
- [ ] Aviso claro de homologação: **nenhum pedido/pagamento gerado**.
- [ ] Teste E2E da jornada após reload e em dispositivos móveis.

**Aceite:** usuário consegue repetir a jornada de adicionar/editar/remover sem dados contraditórios e sem acreditar que concluiu uma compra verdadeira.

### F4 · Qualidade, deploy e apresentação ao Dega

- [ ] Ajustar links de Cultura/Wheels que não possuem seção de destino.
- [ ] Rodar testes relevantes, verificar contraste/teclado/zoom e responsividade.
- [ ] Medir baseline de performance, otimizar ativos críticos comprovadamente problemáticos.
- [ ] Validar export estático no GitHub Pages, rotas e recursos sob `basePath`.
- [ ] Preparar roteiro de apresentação da demo e registrar o que está mockado.
- [ ] Corrigir documentação conforme estado real; atualizar HANDOFF.

**Aceite:** demo íntegra e navegável no URL publicado, sem erros críticos de UI, redirecionamento enganoso ou dependência oculta de servidor.

### F5 · Pós-validação de negócio (FORA DO MVP ATUAL)

- [ ] Dega avalia proposta e autoriza investimento/integração.
- [ ] Validar planos e capacidades da API/carrinho/checkout Nuvemshop.
- [ ] Definir fonte de verdade e eventual migração sem quebrar legado.
- [ ] Escolher hospedagem com backend apropriado, se autenticação privada for necessária.
- [ ] Projetar e testar integração comercial transacional em ambiente isolado.

## 3. Regra para prioridades

Priorizar **fatia funcional** sobre abstração antecipada. Não introduzir novo banco, SaaS ou biblioteca só porque foi útil na Jungle Gaming. Dados reais são desejáveis; **não justificam riscos sobre produção**. Mudanças estruturais pedem aprovação de Nando e ADR.

## 4. Protocolo de release

Issue → branch curta → PR com escopo e critérios → CI e testes relevantes → revisão → squash merge → Release Please → publicação aprovada. A demo no GitHub Pages é um ambiente estático, não uma demonstração de backend funcional.

Próxima ação operacional em [HANDOFF](HANDOFF.md).
