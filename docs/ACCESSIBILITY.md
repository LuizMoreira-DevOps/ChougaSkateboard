# ACCESSIBILITY · Chouga 2.0

**Meta:** WCAG 2.2 AA quando aplicável, com validação por teclado, tecnologias assistivas e testes de dispositivo. **Estado atual:** existem recursos semânticos básicos e focos visíveis em alguns links; não há auditoria completa nem teste automatizado acessível configurado no repositório em 15/10/2026.

## 1. Princípios

- Uma loja deve permitir descobrir produto, selecionar variante e revisar carrinho sem mouse.
- Não usar cor, hover, movimento, número ou forma como único indicador.
- Não sacrificar legibilidade por estética underground; design pode ser ousado e continuar operável.
- Acessibilidade é requisito funcional, não revisão cosmética de fim de projeto.

## 2. Elementos existentes e lacunas

**Existentes no código:** `<html lang="pt-BR">`; landmark `<main>`; navegação com `aria-label`; marca linkada à Home; foco visível definido em Header/Footer; título `h1` no Hero, `h2` na seção de destaques e `h3` nos produtos; índice decorativo com `aria-hidden`.

**Lacunas constatadas:** `ProductCard` não oferece navegação; itens usam placeholder gráfico, não imagens de produto; links `#cultura` e `#wheels` não têm seção de destino na Home; ainda não existem selector de variantes, carrinho nem testes dedicados de acessibilidade.

**Não verificado:** leitores de tela, zoom 200/400%, reflow, orientação, contraste medido, teclado em navegador e comportamento real touch. Não declarar conformidade WCAG sem evidências.

## 3. Critérios da primeira fatia (produto)

- O link de `ProductCard` anuncia nome, preço e destino compreensível; toda a área clicável tem foco visível sem elementos aninhados indevidamente.
- Imagens reais: `alt` objetivo que descreve produto e ângulo/variante quando relevante; imagens decorativas com `alt=""` ou `aria-hidden`.
- Tamanho/cor: cada opção como botão/radio com rótulo compreensível, valor selecionado comunicado por `aria-checked`/`aria-pressed` conforme padrão adequado; seleção acessível por teclado.
- Variante indisponível deve ser anunciada textualmente (ex.: “Tamanho M indisponível”), e nunca apenas em cinza.
- Após selecionar variante, preço/estoque exibidos permanecem consistentes; mensagens de estado relevantes são anunciadas sem spam de regiões vivas.
- Controles touch possuem área de alvo confortável; foco visível em todos os elementos interativos.
- Heading de página de produto (`h1`) significativo, breadcrumb/nav contextual quando necessário, link claro de volta à loja.
- Erros de produto ausente/carregamento possuem recuperação ou mensagem e navegação de saída.
- Se a demo não tiver checkout real, CTA deve dizer “Demonstração” ou ser substituído por mensagem informativa; nunca um botão de compra que não funciona.

## 4. Critérios da fatia de carrinho

- Controle de quantidade com rótulo, limites e mensagens de erro anunciáveis.
- Ações de adicionar/remover e alterações de subtotal comunicadas sem deslocamento brusco de foco.
- Persistência local não pode produzir alterações inesperadas após a hidratação; estado inicial e recuperação de JSON inválido previsíveis.
- Estado vazio oferece ação de voltar às compras.
- Se houver modal/drawer: foco inicial, retenção de foco, Escape e retorno correto ao gatilho; não bloquear rolagem/foco da página sem compensação.

## 5. Matriz mínima de validação

| Dimensão | Evidência esperada |
| --- | --- |
| Teclado completo | Tab/Shift+Tab/Enter/Space; ordem lógica; sem armadilha |
| Leitor de tela | Nomes, papéis, estados e notificações compreensíveis |
| Mobile | 320 px, 390 px e 768 px; retrato/paisagem quando aplicável |
| Zoom/reflow | 200% e 400%, sem conteúdo essencial cortado |
| Contraste | Texto e elementos de interface com níveis AA pertinentes |
| Redução de movimento | `prefers-reduced-motion` respeitado onde houver animação |
| Formulários e estados | Rótulos, erros, indisponibilidade e feedback inteligíveis |
| Links e rotas | Sem âncoras mortas ou destino ambíguo |

## 6. Ferramentas e testes

Ao introduzir Playwright, criar testes E2E para navegação por teclado, seleção de variantes, links e reflow. `axe-core` ou integração equivalente pode complementar, **mas não substituir** inspeção manual. Não afirmar que ferramentas foram instaladas ou testes passaram antes da implementação.

Registrar resultado, ambiente, viewport, dispositivo e falhas na PR. Problemas que impeçam completar a jornada comercial por teclado ou toque são bloqueadores da demonstração.

## 7. Referências

- [WCAG 2.2 (W3C)](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [docs/TESTING.md](TESTING.md)
- [PERFORMANCE.md](PERFORMANCE.md)
