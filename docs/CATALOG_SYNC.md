# Integração do catálogo: Sanity CMS → Supabase

## Visão geral

A Chouga V2.0 utiliza o Sanity Studio para edição do catálogo e o Supabase como banco relacional de produtos.

O objetivo é separar a gestão editorial das operações de catálogo e estoque, mantendo um contrato de produto independente da origem dos dados.

Fluxo implementado:

1. O administrador edita e publica um produto no Sanity.
2. O script Node.js consulta os produtos publicados no dataset `development`.
3. O script valida os campos e resolve referências existentes no Supabase Development.
4. A função PostgreSQL `sync_catalog_product_dev` aplica os dados de um produto em uma transação.
5. O Supabase disponibiliza os produtos através da view `public.produtos_catalogo`.

**A sincronização ainda é manual.** Publicar no Sanity não dispara automaticamente a atualização do Supabase.

## Estrutura de arquivos

| Caminho                                                | Responsabilidade                                         |
| ------------------------------------------------------ | -------------------------------------------------------- |
| `chouga-studio/schemaTypes/product.js`                 | Schema de produtos do CMS                                |
| `chouga-studio/schemaTypes/event.js`                   | Schema editorial de eventos                              |
| `scripts/catalog/readSanityProducts.mjs`               | Consulta e normalização dos produtos publicados          |
| `scripts/catalog/planCatalogPriceSync.mjs`             | Planejamento da sincronização de preços                  |
| `scripts/catalog/applyCatalogPriceSync.mjs`            | Sincronização isolada de preços                          |
| `scripts/catalog/syncFullCatalog.mjs`                  | Sincronização transacional de produtos e relacionamentos |
| `scripts/catalog/sql/001_sync_catalog_product_dev.sql` | Migração da função SQL transacional                      |
| `src/features/catalog/product.ts`                      | Contrato de produto da aplicação                         |

Os scripts auxiliares de comparação e de sincronização de preço pertencem à etapa de desenvolvimento da integração e não substituem o sincronizador completo.

## Ambientes

A integração foi desenvolvida e testada com:

- Sanity: projeto `esjkriae`, dataset `development`.
- Supabase: projeto separado de **Development**.
- Aplicação: Next.js 16, React e TypeScript.
- Banco de dados de produção: **fora do escopo desta implementação**.
- Repositório legado `chouga-online`: **somente leitura**.

Não reutilizar credenciais do ambiente de produção para testes.

## Configuração local

Na raiz do projeto, o arquivo ignorado pelo Git `.env.local` deve conter as variáveis do Supabase Development:

```dotenv
SUPABASE_URL=https://SEU-PROJETO-DEVELOPMENT.supabase.co
SUPABASE_PUBLISHABLE_KEY=CHAVE_PUBLICA_DEVELOPMENT
SUPABASE_DEV_PROJECT_REF=REF_DO_PROJETO_DEVELOPMENT
```

Para operações de escrita autorizadas, o arquivo ignorado pelo Git `scripts/catalog/.env.sync.local` deve conter:

```dotenv
SUPABASE_SECRET_KEY=CHAVE_SECRETA_DEVELOPMENT
```

O valor fixo de `DEV_PROJECT_REF` no sincronizador também precisa corresponder ao projeto de Development.

**Nunca versionar arquivos `.env`, chaves secretas ou credenciais de produção.** A chave secreta deve ser utilizada apenas por scripts locais confiáveis ou por infraestrutura de backend devidamente protegida.

## Preparação do banco

Executar a migração `scripts/catalog/sql/001_sync_catalog_product_dev.sql` exclusivamente no SQL Editor do Supabase Development, depois de preparar as tabelas relacionais necessárias.

A migração cria a função `public.sync_catalog_product_dev`, cuja permissão de execução deve ficar restrita a `service_role`.

O banco precisa ter categorias, marcas, cores e tamanhos cadastrados previamente. O sincronizador resolve esses relacionamentos pelos slugs correspondentes.

## Comandos

Executar na raiz de `ChougaSkateboard`.

### Consultar produtos publicados

```powershell
node .\scripts\catalog\readSanityProducts.mjs
```

### Planejar o catálogo inteiro, sem escrita

```powershell
node --env-file=.env.local .\scripts\catalog\syncFullCatalog.mjs --all
```

### Planejar um produto, sem escrita

```powershell
node --env-file=.env.local .\scripts\catalog\syncFullCatalog.mjs --slug=camiseta-chouga-basic-branca
```

### Sincronizar um único produto no Development

Somente após revisar os dados e confirmar que o destino é o Supabase Development:

```powershell
node --env-file=.env.local --env-file=.\scripts\catalog\.env.sync.local .\scripts\catalog\syncFullCatalog.mjs --slug=camiseta-chouga-basic-branca --apply --confirm-dev-write
```

O modo `--all` é destinado ao planejamento. A aplicação exige um slug específico e confirmação explícita.

## Regras de sincronização

- Produtos são identificados pelo slug.
- Categorias, marcas, cores e tamanhos são resolvidos por referências existentes no banco.
- Imagens novas podem ser acrescentadas sem remover as anteriores.
- Variações existentes são preservadas e novas variações são identificadas por SKU.
- O estoque das variações existentes não é controlado pelo Sanity.
- Uma variação nova é cadastrada inicialmente com estoque zero.
- Tags podem ser criadas e associadas, sem remoção automática das associações anteriores.
- Não há exclusão automática de produtos, imagens ou variações ausentes no CMS.
- Cada chamada à função SQL aplica um produto dentro de uma transação PostgreSQL.

## Segurança e limitações conhecidas

1. A integração foi validada somente no ambiente Development.
2. O `dry-run` prepara os dados, mas nem todos os conflitos são detectados antes da execução da transação.
3. A visão pública é controlada pelas permissões e políticas RLS do Supabase. Consultas com chave pública podem não revelar produtos inativos.
4. As escritas usam uma credencial privilegiada, restrita ao ambiente de desenvolvimento.
5. A operação é transacional **por produto**, não para o catálogo inteiro.
6. Falhas na verificação posterior à RPC não desfazem uma transação já confirmada.
7. A prevenção de concorrência utiliza identificador, preço esperado e data de atualização; a revisão completa de cenários concorrentes ainda está pendente.
8. Não existe mecanismo automático de publicação, fila, auditoria de alterações ou recuperação operacional.
9. A interface pública do storefront ainda precisa ser integrada e validada contra o catálogo.

**Estado atual:** integração funcional em Development, sem autorização de uso em produção.
