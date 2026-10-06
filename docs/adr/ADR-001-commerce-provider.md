# Registrar Nuvemshop como Commerce Provider da V1

## Objetivo

Registrar formalmente a Nuvemshop como plataforma de Commerce da Chouga 2.0 na V1.

Criar:

`docs/adr/ADR-001-commerce-provider.md`

## Contexto

A Chouga 2.0 não desenvolverá seu próprio motor comercial na V1.

A prioridade inicial é validar o produto e a operação utilizando uma solução pronta, evitando custos e complexidade desnecessários.

Após pesquisa prévia, a Nuvemshop foi escolhida porque permite iniciar a operação utilizando seu plano inicial, sem exigir a contratação antecipada de uma estrutura comercial mais cara.

## Decisão

Utilizar Nuvemshop como Commerce Provider da Chouga 2.0 na V1.

A Nuvemshop será responsável pelos dados e processos comerciais que lhe pertencem, como produtos, variantes, preços, estoque, carrinho, checkout e pedidos, conforme as capacidades utilizadas pela integração.

A aplicação Chouga continuará responsável pela experiência do storefront.

A integração deve permanecer atrás da fronteira `Commerce`, evitando acoplamento desnecessário do restante da aplicação à Nuvemshop.

## Alternativas consideradas

### Shopify

Plataforma madura e com forte capacidade de Commerce.

Não foi escolhida para a V1 porque a estratégia atual prioriza iniciar a operação com o menor comprometimento financeiro possível.

### Commerce próprio

Não será desenvolvido na V1.

Criar e manter catálogo, estoque, carrinho, checkout, pagamentos, pedidos e conciliação adicionaria complexidade sem benefício proporcional neste estágio do projeto.

Pode ser reconsiderado futuramente caso existam necessidades comerciais que justifiquem o investimento.

## Consequências

### Positivas

- menor barreira financeira inicial;
- redução da complexidade operacional;
- utilização de infraestrutura comercial pronta;
- foco da engenharia na experiência e identidade da Chouga;
- possibilidade de validar o negócio antes de investir em Commerce próprio.

### Riscos

- dependência de capacidades e limites da plataforma;
- integração limitada ao que as APIs disponíveis permitirem;
- eventual necessidade futura de migração.

Para reduzir esse risco, detalhes específicos da Nuvemshop devem permanecer isolados no adaptador de Commerce.

## Fora de escopo

- criar conta ou loja;
- configurar Nuvemshop;
- instalar SDK;
- consumir APIs;
- cadastrar produtos;
- implementar carrinho;
- implementar checkout;
- migrar dados do legado.

## Critérios de aceite

- `docs/adr/ADR-001-commerce-provider.md` criado;
- Nuvemshop registrada como decisão da V1;
- justificativa comercial registrada;
- Shopify e Commerce próprio registrados como alternativas;
- riscos e consequências documentados;
- nenhuma integração implementada.
