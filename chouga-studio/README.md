# Chouga CMS

Sanity Studio utilizado para gerenciamento editorial e cadastro de produtos da Chouga Skateboard.

## Arquitetura

- **Next.js + React + TypeScript:** storefront Chouga V2.0.
- **Sanity:** conteúdo editorial, eventos e edição de produtos.
- **Supabase/PostgreSQL:** catálogo relacional, variações, imagens e estoque.
- **Node.js:** sincronização controlada dos produtos publicados no Sanity para o Supabase.

O Sanity não substitui o banco relacional utilizado pelo e-commerce. O estoque permanece sob responsabilidade do Supabase.

## Ambientes

- Projeto Sanity: `Chouga CMS`
- Project ID: `esjkriae`
- Dataset utilizado nesta implementação: `development`
- Dataset `production`: existente e fora do escopo dos testes da V2.

**Atenção:** este Studio foi adaptado a partir da estrutura utilizada pelo projeto legado. Não publicar alterações em produção nem executar deploy de schemas sem revisão e autorização específicas.

## Desenvolvimento local

A partir do diretório `chouga-studio/`:

```powershell
npm install
npm run dev
```

O Studio local utiliza `http://localhost:3333`.

A configuração local deve apontar para o dataset `development`.

## Validação

```powershell
npm run build
```

O build valida a compilação do Studio, mas não implanta schemas nem publica o CMS.

## Sincronização do catálogo

A publicação de um produto no Sanity não realiza uma sincronização automática.

A leitura, a validação e a aplicação transacional dos produtos são realizadas pelos scripts disponíveis em `../scripts/catalog/`.

Documentação:

- [Integração do catálogo](../docs/CATALOG_SYNC.md)
- [Testes da integração](../docs/CATALOG_TESTING.md)

## Deploy

**Não executar `sanity deploy` ou `sanity schemas deploy` como parte deste fluxo de desenvolvimento.**

Qualquer publicação deve ser planejada separadamente, com revisão do dataset, destino, permissões e impacto sobre o projeto legado.

## Fluxo editorial de eventos

1. Criar ou editar o evento no Studio.
2. Preencher os campos obrigatórios.
3. Revisar data, horário, fuso e local.
4. Manter como rascunho durante a preparação.
5. Publicar somente quando o conteúdo estiver aprovado.

O frontend exibe eventos confirmados ou adiados cujo término ainda não ocorreu.
Eventos cancelados, encerrados ou mantidos como rascunho não aparecem.

## Integração com o frontend

O frontend utiliza:

```bash
VITE_SANITY_PROJECT_ID=esjkriae
VITE_SANITY_DATASET=production
```

Esses identificadores são públicos. Tokens de leitura ou escrita nunca devem
usar o prefixo VITE_ nem ser versionados.
As mesmas configurações devem existir como Repository Variables nos workflows
do GitHub Actions.

## Resiliência

Se o Sanity estiver indisponível ou não estiver configurado, a página utiliza o
conteúdo local de fallback. O cliente Sanity é carregado sob demanda apenas na
página de Eventos.
