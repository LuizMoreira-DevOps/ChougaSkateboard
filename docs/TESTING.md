# TESTING · Chouga 2.0

## 1. Estado verificado

Em 15/10/2026, o repositório contém `npm run lint`, `npm run typecheck`, `npm run build`, CI com smoke HTTP da Home, CodeQL e deploy GitHub Pages. **Não existem** scripts `test`/`test:e2e`, Playwright ou suíte unitária configurada. A criação e execução desses testes pertence às próximas fatias de código.

## 2. Estratégia aprendida na Jungle Gaming

Aproveitar do Pirate Battle: contratos explícitos, lógica desacoplada da UI, cenários reproduzíveis, mocks controlados, testes E2E de fluxos reais, acessibilidade mobile, diagnósticos anexados no CI. Não copiar necessariamente as mesmas bibliotecas ou a quantidade de testes de um jogo para um catálogo.

### Pirâmide proposta

- **Unitários:** formatação/preço em centavos, disponibilidade de variante, mapeamento/normalização de dados, carrinho e validação de persistência.
- **Integração:** contrato `CommerceProvider`, adaptador Supabase de **leitura** com fixtures de resposta e tratamento de erros; ausência de escrita.
- **E2E:** abrir Home, acessar produto, escolher tamanho, navegar, reload, carrinho (quando existir), viewports desktop/mobile.
- **Revisões manuais:** contraste, leitor de tela, toque real, zoom, velocidade percebida e inspeção visual.

## 3. Matriz de casos prioritários

| Caso | Camada | Aceite |
| --- | --- | --- |
| Produto válido por slug | Integração | Dados tipados e normalizados |
| Produto inexistente/inativo | Integração/E2E | 404/estado coerente, não lista indevidamente |
| Produto com 0/1/N opções | Unit/E2E | Sem suposições globais de tamanho/cor |
| Tamanho indisponível | Unit/E2E | Não pode ser selecionado como disponível |
| Preço em BRL | Unit | Cálculo sem erro de ponto flutuante |
| Imagem ausente | UI/E2E | Placeholder com significado acessível |
| Erro de consulta | Integração/UI | Mensagem e comportamento previsíveis |
| Link de card | E2E | Rota correta, funcionamento por teclado |
| Carrinho: adicionar/alterar/remover | Unit/E2E (F3) | Itens, quantidade e subtotal coerentes |
| Persistência corrompida | Unit (F3) | Fallback seguro, sem crash |
| Mobile 320/390/768 px | E2E + inspeção | Sem overflow horizontal; controles operáveis |
| Export com basePath | Build + smoke | URL direta de produto funciona no Pages |
| Segurança de catálogo | Auditoria autorizada | Acesso público limitado a leitura esperada |

## 4. Implementação gradual

1. Selecionar framework unitário apenas na F1 e adicionar scripts reais ao `package.json`.
2. Introduzir Playwright quando existir página navegável; começar com 1 smoke e 1 jornada ponta a ponta, expandir conforme bugs e regressões.
3. Fixar cenários de testes sem depender de produção, rede externa, hora, aleatoriedade ou dados mutáveis; usar fixtures e adapters falsos.
4. Integrar testes relevantes ao CI; guardar screenshots/traces em falhas, com retenção adequada.
5. Evitar `waitForTimeout` arbitrário, sleeps e retries como cura de flakiness; esperar eventos/estados observáveis.

## 5. Comprovação por PR

Relatar **comando**, **ambiente**, **resultado** e **limitação**. Separar:

- confirmado no CI;
- executado localmente;
- revisado manualmente;
- não executado.

Nunca escrever “todos os testes passaram” quando o projeto ainda não possui suíte correspondente. Registrar evidências no PR e atualizar `docs/HANDOFF.md` ao encerrar.

## 6. Critérios de bloqueio

Bloqueiam a demo: crash de rota de produto/carrinho, opção indisponível que parece disponível, dado de preço incorreto, checkout que parece verdadeiro sem ser, ausência de teclado para função central, publicação que não abre URL direta, segredo exposto ou efeito em produção. Ajustes puramente estéticos podem ir para backlog sem impedir fatia funcional.
