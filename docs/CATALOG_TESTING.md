# Validação da integração de catálogo

**Data:** 20 de outubro de 2026
**Ambientes:** Sanity Development e Supabase Development
**Branch:** `feat/sanity-product-cms`

## Objetivo

Validar a sincronização de produtos publicados no Sanity para o banco relacional Supabase Development, incluindo criação, atualização, imagens, variações, tags, estoque, idempotência e rollback transacional.

## Cenários executados

| Cenário                          | Resultado                      | Evidência                                        |
| -------------------------------- | ------------------------------ | ------------------------------------------------ |
| Leitura de produtos publicados   | Aprovado                       | Dois produtos consultados                        |
| Planejamento `--all`             | Aprovado                       | Dois produtos preparados sem escrita             |
| Criação de produto               | Aprovado                       | Laboratório Branca criado com novo UUID          |
| Associação de categoria e marca  | Aprovado                       | `camisetas-basicas` e `chouga`                   |
| Criação de variação              | Aprovado                       | Novo SKU com estoque zero                        |
| Associação de tags               | Aprovado                       | Tag `Teste` associada ao Laboratório             |
| Atualização de produto existente | Aprovado                       | Basic Branca atualizada mantendo seu UUID        |
| Inclusão de imagem               | Aprovado                       | Uma imagem adicionada à Basic Branca             |
| Preservação de estoque           | Aprovado                       | Estoque 7 da Basic Branca mantido                |
| Idempotência                     | Aprovado nos cenários testados | Reexecuções sem novas imagens, variações ou tags |
| Rejeição de SKU conflitante      | Aprovado                       | Combinação Branco/M já cadastrada foi rejeitada  |
| Rollback transacional            | Aprovado                       | Preço R$ 96 rejeitado e preço R$ 95 preservado   |

## Produtos utilizados

### Camiseta Chouga Basic Branca

- Slug: `camiseta-chouga-basic-branca`
- UUID Development: `7ae210ca-ef57-4ecd-8e9e-a4e6f6589d7a`
- Preço preservado após rollback: R$ 95
- SKU existente: `CHOUGA-DEV-BRANCA-M`
- Estoque preservado: 7
- Imagens verificadas no catálogo: 1

### Camiseta Chouga Laboratório Branca

- Slug: `camiseta-chouga-laboratorio-branca`
- UUID Development: `c718f6f3-4c35-4a1d-ada9-4dff6ac099b9`
- Preço: R$ 110
- SKU: `CHOUGA-DEV-LAB-BRANCA-M`
- Estoque inicial: 0
- Tag associada: `Teste`
- Imagens na última consulta: 0

A imagem do produto Laboratório permanece pendente de publicação ou confirmação de leitura no Sanity.

## Teste de rollback

Foi publicado temporariamente no Sanity Development:

- Preço: R$ 96
- SKU: `CHOUGA-CONFLITO-TESTE-M`
- Cor/tamanho: Branco/M

A execução transacional retornou HTTP 400, com o erro de combinação de cor/tamanho já cadastrada.

Após a falha, uma consulta ao Supabase Development confirmou:

| Campo   | Valor preservado      |
| ------- | --------------------- |
| Preço   | R$ 95                 |
| SKU     | `CHOUGA-DEV-BRANCA-M` |
| Estoque | 7                     |

O resultado demonstra rollback correto **para o cenário de conflito testado**.

Os dados temporários do Sanity devem ser restaurados e publicados novamente após o teste.

## Qualidade de código

Comandos executados na raiz do projeto:

```powershell
git diff --check
npm run lint
npx tsc --noEmit
npm run build
```

Todos concluíram sem erros.

A build do Next.js 16.4.0 gerou as rotas estáticas `/` e `/_not-found`.

No diretório `chouga-studio/`, o comando:

```powershell
npm run build
```

também foi concluído com sucesso.

## Testes e revisões pendentes

- Confirmar publicação e sincronização de imagem do produto Laboratório.
- Verificar explicitamente as permissões `EXECUTE` da RPC para `anon`, `authenticated` e `service_role`.
- Exercitar cenários de concorrência e criação simultânea do mesmo produto/SKU.
- Verificar tratamento de produtos inativos no planejamento.
- Testar falhas de rede e recuperação após uma RPC confirmada.
- Revisar os privilégios e políticas RLS das tabelas relacionadas.
- Validar o catálogo consumido pelo storefront Next.js.
- Executar testes automatizados e regressivos antes de qualquer promoção para produção.

## Conclusão

A integração apresentou resultados positivos de criação, atualização, preservação de estoque, idempotência e rollback nos cenários executados no ambiente Development.

Os resultados **não constituem aprovação para produção**. Ainda são necessárias a revisão final de segurança, a validação de concorrência, a integração com o storefront e testes adicionais.
