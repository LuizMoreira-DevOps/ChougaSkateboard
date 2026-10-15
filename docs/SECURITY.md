# SECURITY · Chouga 2.0

## Regra zero: não afetar a Chouga em produção

O Supabase do legado `LuizMoreira-DevOps/chouga-online` atende uma aplicação em produção. **Não executar mudanças de schema, migrations, RLS, grants, views, triggers, sync, seeds ou dados**, e não modificar a aplicação legada, sem aprovação explícita de Nando, análise de impacto, backup verificável, plano de deploy compatível e rollback. A fase inicial da Chouga 2.0 é **leitura e homologação**.

## Princípio de menor privilégio

- Utilizar dados públicos do catálogo somente através das políticas RLS permitidas e validadas no banco **real**.
- A migration `20260729122200_harden_catalog_read_permissions.sql` e a view `security_invoker` são **evidências versionadas**; auditar que o banco implantado corresponda.
- Chave publishable/anon não é segredo e pode ir ao frontend **somente se** o acesso público desejado estiver protegido pela RLS adequada. Não confundir chave pública com autorização.
- Nunca expor `service_role`, chave secreta, credenciais de sincronização, OAuth client secret ou tokens Nuvemshop em bundle, `NEXT_PUBLIC_*`, HTML estático, código versionado ou logs.
- Se uma integração requer segredo, implementá-la em infraestrutura servidor segura, **não** no GitHub Pages.

## Desenho de risco do MVP

| Fluxo | Política |
| --- | --- |
| Ver lista e detalhe do produto | Leitura somente após auditar view e permissões |
| Selecionar variante | Estado client-side, não altera estoque |
| Carrinho demonstrativo | Estado local claramente identificado; validar dados recuperados do localStorage |
| Checkout, pedido, pagamento | **Não implementados**; sem simulação enganosa |
| Dados de teste | Fixtures ou ambiente isolado, nunca seed na produção compartilhada |
| Formulários e analytics | Só criar com escopo, tratamento de dados e consentimento aprovados |

## Antes de qualquer integração com Supabase

1. Confirmar qual projeto e qual ambiente é produção, sem compartilhar segredos na conversa/issue.
2. Listar dependências do legado e a view utilizada (somente leitura).
3. Conferir schema/RLS/grants atuais com conexão segura e autorização de consulta.
4. Testar consultas com perfil de menor privilégio; verificar que operações indevidas falham.
5. Medir impacto e limites (consultas, caching, quotas) antes de fazer chamadas adicionais em volume.
6. Registrar aprovação de Nando e decisão de renderização (build ou navegador).
7. Se não for possível validar segurança e compatibilidade, **continuar com fixtures**, não relaxar as políticas.

## Mudanças futuras de schema

Uma alteração em estrutura compartilhada deve ser feita como mudança **compatível em múltiplas etapas**:

- mapear consumidores e contratos;
- preparar backup/recovery point;
- planejar migration expansiva (aditiva) em ambiente isolado;
- validar aplicação legada e nova aplicação;
- realizar rollout controlado, com rollback e observabilidade;
- remover compatibilidade legada somente depois de migração aprovada.

Nunca alterar diretamente a view `produtos_catalogo` como parte da criação da página de produto.

## Reporte e revisão

Segredos eventualmente expostos devem ser revogados/rotacionados conforme procedimentos do provedor; remover apenas do último commit não os apaga do histórico. Não incluir chaves, dados pessoais, mensagens internas ou URLs privadas em screenshots e relatórios. Em PRs, incluir risco de segurança e efeito sobre o legado como itens explícitos de revisão.

**Veja:** `docs/commerce/INTEGRATION.md`, `ARCHITECTURE.md`, `docs/HANDOFF.md`.
