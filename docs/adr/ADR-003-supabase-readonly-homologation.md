# ADR-003 (PROPOSTO) · Reuso do Supabase legado em modo somente leitura para homologação

- **Status:** PROPOSTO, **não aprovado**.
- **Data:** 15/10/2026.
- **Decisor:** Nando, responsável pela direção do produto.
- **Contexto:** Chouga 2.0 demonstrativa; `chouga-online` com Supabase compartilhado em produção; Nuvemshop contratada/integrada somente após avaliação com o Dega.

## Contexto

A Chouga 2.0 precisa demonstrar catálogo e detalhe de produtos antes de contratar integração com Nuvemshop. O sistema legado já usa Supabase e expõe a view `public.produtos_catalogo` por meio de `getProdutosCatalogo()` e `getProdutoBySlug()`. Existem migrations de read policies e `security_invoker`, mas **não foi auditado o banco implantado**.

O ADR-001 seleciona Nuvemshop como provedor comercial da V1. Esse ADR **não revoga** tal decisão: propõe uma fonte temporária **somente leitura** para homologação da experiência visual/comercial, sem transações reais e sem modificar dados existentes.

## Decisão proposta

Após auditoria de compatibilidade e autorização explícita, a Chouga 2.0 poderá consultar a view existente do Supabase **apenas para dados públicos de catálogo**, através de `SupabaseCommerceProvider` isolado por contratos TypeScript independentes do fornecedor.

Nenhuma migration, view, tabela, grant, RLS, sync ou registro de produção pode ser modificado para viabilizar a demonstração. Caso a política atual não seja suficiente, utilizar `FixtureCommerceProvider` até haver plano de migração seguro. A estratégia de acesso (SSG no build vs browser com publishable key) será decidida separadamente.

## Alternativas

1. **Somente fixtures:** menor risco, melhor reprodutibilidade, mas sem dados reais; é o fallback obrigatório.
2. **Supabase read-only:** reaproveita catálogo existente, mas adiciona risco de dependência do legado; exige auditoria e monitoramento.
3. **Nuvemshop agora:** contraria sequência de validação comercial e depende de custos/capacidades não aprovados.
4. **Banco novo/cópia própria:** custo e manutenção adicionais desnecessários para esta fatia; evitado.

## Consequências se aprovado

**Benefícios:** redução de retrabalho, dados reais, rapidez de prototipação, contratos estáveis e menor necessidade de setup.

**Riscos:** contrato da view mudar, dados não serem idênticos ao destino comercial futuro, conteúdo privado exposto por configuração de RLS, dependência de disponibilidade e atualização do Supabase, efeitos indiretos na aplicação legada por tráfego adicional.

**Mitigações:** adapter isolado, somente leitura, checagem RLS/grants, observabilidade de falhas, consultas limitadas, fixtures para testes, nenhuma escrita, aprovação de Nando e estratégia de migração/rollback para mudanças futuras.

## Critérios para aprovar

- [ ] schema, view, grants e RLS implantados verificados sem alterar o banco;
- [ ] impactos e consumidores do legado identificados;
- [ ] acesso público read-only conferido, sem uso de `service_role`;
- [ ] plano de leitura (build ou navegador) documentado;
- [ ] fonte de verdade do catálogo de homologação explicitada;
- [ ] fallback com fixture disponível;
- [ ] aprovação expressa de Nando.

**Até a aprovação:** não implementar acesso ao Supabase real nem realizar escritas. Pode-se desenvolver domínio e fixtures.

## Revisão futura

Reavaliar após demonstração ao Dega, assinatura da Nuvemshop e validação técnica de carrinho/checkout. Impedir fontes de verdade duplicadas e não retirar suporte do legado sem cronograma de migração aprovado.
