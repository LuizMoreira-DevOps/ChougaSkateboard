# INTEGRATION · Commerce e fontes de dados

**Data:** 15/10/2026. **Status:** plano e diagnóstico via GitHub. **Nenhuma conexão ao Supabase ao vivo nem integração Nuvemshop foi feita.**

## 1. Objetivo

Reutilizar conhecimento/dados já existentes da Chouga, com cuidado para **não alterar o Supabase compartilhado com o site legado em produção**, e manter o storefront livre de acoplamento direto a um fornecedor comercial.

O destino empresarial definido no ADR-001 é **Nuvemshop como Commerce Provider da V1**, após validação do investimento com Dega. O Supabase legado pode atuar como **fonte read-only para a demonstração**, se a auditoria confirmar segurança e compatibilidade. Isso **não implica** manter duas fontes de verdade de preços e estoque quando o sistema transacional entrar em operação.

## 2. Fontes identificadas

### Legado `LuizMoreira-DevOps/chouga-online`

- Cliente: `Chouga-online/src/lib/supabaseClient.js` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Serviço: `Chouga-online/src/services/produtosServices.js` chama `.from("produtos_catalogo").select("*").eq("ativo", true)` e filtra por `slug` no detalhe.
- View: `public.produtos_catalogo` agrega produto, categoria, marca, imagens, variantes e tags; migração de 29/07/2026 inclui informações editoriais adicionais e associação de imagem a cor.
- Entidades versionadas: `produtos`, `variacoes_produto`, `categorias`, `marcas`, `cores`, `tamanhos`, `imagens_produto`, `tags`, `produto_tag`.
- Segurança versionada: `20260729122200_harden_catalog_read_permissions.sql` define grants SELECT e políticas de leitura; view com `security_invoker`.

**Atenção:** o Git não é o banco implantado. Auditar schema/constraints/policies/grants vigentes **somente por leitura**, com autorização do responsável, antes de habilitar novo cliente.

### Homologação Nuvemshop

- Loja: `https://chougaskateboard.lojavirtualnuvem.com.br/`.
- Produto de teste: `Chouga Basic Branca`, R$ 90,00, opções PP/P/M/G/GG/XG, URL `https://chougaskateboard.lojavirtualnuvem.com.br/produtos/chouga-basic-branca-1dgkl/`.
- Sem integração de API habilitada/comprovada na Chouga 2.0; não tentar transferir esse produto para Supabase de produção como atalho.
- A assinatura e os detalhes do carrinho/checkout serão discutidos com Dega após a demonstração.

## 3. Mapeamento inicial (proposto, conferir dados reais)

| `produtos_catalogo` legado | Contrato de domínio | Observações |
| --- | --- | --- |
| `id` | `Product.id` | identidade estável |
| `slug` | `Product.slug` | rota; validar unicidade e formato |
| `nome` | `Product.name` | texto obrigatório |
| `descricao`, `descricao_detalhada` | `Product.description` | normalizar nulos, preservar conteúdo relevante |
| `preco`, `preco_promocional` | `Product.price`, `salePrice` em centavos | conferir tipos, escala e promoções antes de mapear |
| `categoria`, `categoria_slug` | `Product.category` | evitar reconstruir slug sem necessidade |
| `marca`, `marca_slug` | `Product.brand` | dado informativo |
| `ativo`, `destaque` | visibilidade / destaque | filtrar ativos, não vazar rascunhos |
| `imagens[]` | `Product.images[]` | `url`, `alt_text`, `ordem`, `principal`, `cor_id`, `cor_slug` |
| `variacoes[]` | `Product.variants[]` | `sku`, `cor`, `tamanho`, `estoque`, `ativo` |
| `tags[]` | tags / filtros opcionais | não acoplar lógica central a tags |

`variacoes[]` na view agregada versionada usa `sku` e opções, mas não necessariamente expõe o ID de cada variante. Se for insuficiente para carrinho futuro, **não modificar a view em produção de imediato**: considerar identidade estável via SKU quando segura ou um plano de evolução compatível aprovado.

**Não inferir regras comerciais**: estoque zero, made-to-order, preço promocional e publicação devem ter interpretação documentada após revisão com responsável da operação.

## 4. Interface do provedor (sugestão, não código entregue)

```ts
interface CommerceProvider {
  listProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
}
```

Começar apenas com essas operações. Adaptadores possíveis:

- `FixtureCommerceProvider`: dados estáveis para testes e demo offline;
- `SupabaseCommerceProvider`: somente SELECT em origem aprovada, com parser/normalização;
- `NuvemshopCommerceProvider`: futuro, condicionado a API, autenticação, checkout e plano comercial.

A UI depende do contrato, não de clientes de banco; erros são tratados na camada de aplicação e apresentados de forma apropriada.

## 5. GitHub Pages: decisão de como ler dados

O deploy atual usa `GITHUB_PAGES=true`, `output: "export"`, `basePath: "/ChougaSkateboard"`.

**A. Snapshot no build (SSG):** consulta pública/autorizada durante CI, geração de `generateStaticParams` e HTML estático. Prós: SEO e pouca rede no navegador; contras: dados desatualizam até novo deploy e CI depende da disponibilidade do provedor. **Nenhum segredo pode ser incorporado ao artefato.**

**B. Consulta do browser com chave pública e RLS:** dados atualizados em runtime pelo Supabase; prós: refletir catálogo atualizado sem rebuild; contras: depender de rede, limitar exposição pública, gerenciar loading/erro e SEO. **Publicável só depois de auditoria RLS e grants.**

**C. Fixture local:** independente de rede/credencial; ótima para começar e apresentar demo; dados são fictícios e devem ser rotulados.

Não escolher A ou B apenas por conveniência antes de avaliar segurança, SEO, atualização, custos e confiabilidade. Nessa etapa, **não criar Route Handler dinâmico achando que executará no GitHub Pages**.

## 6. Auditoria somente leitura obrigatória

- [ ] Conferir o projeto/ambiente do Supabase realmente usado pela aplicação legada.
- [ ] Confirmar que a view `produtos_catalogo` existe e corresponde à migration versionada.
- [ ] Conferir colunas/tipos retornados, produtos ativos e variantes reais sem gravar dados.
- [ ] Confirmar permissões da chave pública e RLS nos objetos acessados pela view.
- [ ] Confirmar isolamento de itens não publicados, dados sensíveis e escrita não autorizada.
- [ ] Entender impacto de consultas simultâneas e política de caching.
- [ ] Verificar se há produto válido para a F1; decidir fixture caso não.
- [ ] Obter aprovação de Nando para o tipo de acesso e decisão A/B/C.

Se não for possível confirmar qualquer item de segurança crítico, **não conectar produção**. Prosseguir com fixtures.

## 7. Condições de transição para Nuvemshop

Quando o Dega aprovar investimento:

1. confirmar que o plano contratado e API permitem o fluxo desejado, incluindo checkout;
2. selecionar ambiente de teste e estratégia de credenciais protegidas no servidor;
3. definir fonte de verdade comercial e política para o legado Supabase;
4. mapear dados/variantes e planejar migração sem alterar a aplicação atual às cegas;
5. escolher hospedagem que execute backend quando necessário;
6. validar jornadas com testes e plano de rollback antes de entrada em produção.

**Não criar dois estoques autônomos ou duplicar preços como fontes de verdade.**

## 8. Documentos relacionados

- [ADR-001](../adr/ADR-001-commerce-provider.md): Nuvemshop como Commerce Provider;
- [ADR-003 proposto](../adr/ADR-003-supabase-readonly-homologation.md): exceção de homologação;
- [SECURITY](../../SECURITY.md): proteção do legado;
- [ARCHITECTURE](../../ARCHITECTURE.md): fronteiras;
- [HANDOFF](../HANDOFF.md): próxima ação.
