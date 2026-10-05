# Chouga 2.0 — Fundação Arquitetural

## 1. Objetivo

Este documento define os princípios arquiteturais da Chouga 2.0.

Seu objetivo é orientar decisões técnicas sem transformar escolhas atuais em dogmas permanentes.

A arquitetura deve permitir que a Chouga:

- evolua de forma previsível;
- mantenha responsabilidades claras;
- reduza acoplamento;
- facilite manutenção;
- preserve performance;
- permita substituição de integrações externas;
- cresça sem repetir a desorganização estrutural do projeto legado.

Princípio:

> Engenharia limpa para permitir liberdade criativa.

---

# 2. Princípio arquitetural

A arquitetura inicial da Chouga 2.0 será um **monólito modular**.

Isso significa que a aplicação poderá ser desenvolvida e implantada como uma unidade, mas internamente será organizada em módulos com responsabilidades próprias.

Estrutura conceitual:

```text
App
├── Commerce
├── Editorial
├── Brand
├── Wheels
└── Integrations
```

O objetivo não é criar isolamento artificial.

O objetivo é evitar que qualquer parte da aplicação possa acessar arbitrariamente qualquer outra parte.

---

# 3. Por que monólito modular

A Chouga não possui, neste momento, necessidade comprovada de arquitetura distribuída.

Um monólito modular oferece:

- menor complexidade operacional;
- desenvolvimento local simples;
- deploy mais simples;
- debugging mais simples;
- menor custo;
- transações e fluxos mais fáceis de compreender;
- possibilidade de modularização sem criar infraestrutura desnecessária.

Não utilizar inicialmente:

- microserviços;
- filas distribuídas sem necessidade;
- event bus genérico;
- CQRS;
- event sourcing;
- múltiplos serviços independentes para responsabilidades pequenas.

Se algum módulo futuramente precisar ser separado, essa decisão deve ocorrer a partir de uma necessidade real e documentada.

---

# 4. Módulos principais

## Commerce

Responsável pelos conceitos relacionados à experiência comercial.

Pode envolver:

- produtos;
- variantes;
- coleções;
- preços;
- disponibilidade;
- carrinho;
- checkout;
- pedidos.

Na V1, parte importante dessas responsabilidades será executada por uma plataforma externa de Commerce.

O módulo Commerce representa a visão da Chouga sobre esses conceitos.

---

## Editorial

Responsável pelo conteúdo editorial.

Pode envolver:

- matérias;
- atletas;
- eventos;
- autores;
- campanhas;
- páginas institucionais;
- curadorias do Wheels.

O conteúdo editorial não deve armazenar ou controlar:

- preço;
- estoque;
- pagamento;
- estado de pedido.

---

## Brand

Responsável por elementos ligados à identidade e apresentação institucional da marca.

Pode envolver:

- conteúdo institucional;
- identidade visual aplicada;
- campanhas;
- storytelling;
- componentes relacionados à apresentação da marca.

Brand não deve se transformar em depósito de tudo que não encontrou outro módulo.

---

## Wheels

Responsável pela experiência experimental da Chouga.

Pode combinar conteúdo editorial com uma apresentação visual própria.

Wheels pode consumir conteúdos do Editorial.

Não deve possuir uma segunda fonte de verdade para matérias, atletas ou eventos.

Wheels é experiência e curadoria.

---

## Integrations

Responsável por adaptadores para serviços externos.

Exemplos possíveis:

- Commerce Provider;
- CMS;
- analytics;
- observabilidade;
- serviços de terceiros.

Integrações devem permanecer na borda do sistema.

Serviços externos não devem definir a arquitetura interna da Chouga.

---

# 5. Dependências entre módulos

Princípio geral:

> módulos conhecem contratos, não detalhes internos de outros módulos.

Commerce e Editorial devem permanecer independentes.

Exemplo:

```text
Editorial ──X──> implementação interna de Commerce

Commerce ──X──> implementação interna de Editorial
```

Quando uma página precisar combinar os dois:

```text
Commerce
    ↓
Application
    ↑
Editorial
```

A camada de aplicação faz a composição.

Evitar:

- imports profundos entre módulos;
- acesso direto ao banco ou API de outro módulo;
- compartilhamento de tipos internos;
- regras de negócio espalhadas entre páginas.

---

# 6. Fronteira de Commerce

A plataforma comercial utilizada pela Chouga deve ser tratada como fornecedor externo.

Conceitualmente:

```text
Chouga
   ↓
Commerce
   ↓
Commerce Provider
   ↓
Plataforma externa
```

O restante da aplicação não deve depender diretamente de:

- tipos específicos do fornecedor;
- nomes internos de campos;
- payloads;
- endpoints;
- SDKs;
- identificadores proprietários.

O adaptador traduz o fornecedor para conceitos que façam sentido para a Chouga.

Exemplo conceitual:

```text
Shopify Product
      ↓
Shopify Adapter
      ↓
Product
```

ou:

```text
Nuvemshop Product
       ↓
Nuvemshop Adapter
       ↓
Product
```

Isso reduz acoplamento.

Não significa construir uma abstração capaz de suportar qualquer plataforma existente.

A abstração deve cobrir apenas as necessidades reais da Chouga.

---

# 7. Fonte de verdade

Cada tipo de informação deve possuir uma autoridade clara.

Exemplo conceitual:

```text
Commerce Provider
├── produtos comerciais
├── variantes
├── preços
├── estoque
├── carrinho
├── checkout
└── pedidos

Editorial
├── matérias
├── atletas
├── eventos
├── autores
├── campanhas
└── conteúdo institucional
```

Evitar duplicar a mesma responsabilidade em dois serviços.

Exemplo ruim:

```text
Preço no Commerce
+
Preço no CMS
```

Isso cria duas fontes de verdade.

A aplicação pode combinar dados de diferentes fontes, mas não deve duplicar responsabilidade.

---

# 8. Editorial

A hipótese atual é utilizar Sanity como autoridade editorial.

Essa decisão deve ser documentada definitivamente por ADR quando aprovada.

O modelo editorial deve permitir relações entre conteúdos.

Exemplo:

```text
Athlete
├── Articles
├── Events
└── Media
```

```text
Event
├── Athletes
├── Articles
└── Media
```

Agenda deve ser derivada dos eventos publicados.

Não criar registros independentes para representar a mesma informação.

---

# 9. Banco de dados próprio

A Chouga não deve possuir banco próprio apenas porque aplicações normalmente possuem um.

Enquanto:

- Commerce possuir uma autoridade comercial;
- Editorial possuir uma autoridade editorial;

um terceiro banco pode ser desnecessário.

Banco próprio deve surgir quando existir um domínio que realmente pertença à Chouga.

Exemplos futuros:

- favoritos;
- comunidade;
- reviews próprios;
- dados operacionais;
- serviços internos;
- Commerce próprio;
- funcionalidades que não pertençam aos fornecedores atuais.

Princípio:

> primeiro nasce a necessidade, depois nasce o banco.

---

# 10. Storefront

A experiência visual será controlada pela Chouga.

A plataforma comercial não deve obrigatoriamente determinar:

- layout;
- navegação;
- ProductCard;
- página de produto;
- identidade visual;
- experiência editorial;
- Wheels;
- páginas institucionais.

O storefront deve consumir dados dos módulos e apresentar uma experiência própria.

A hipótese atual de framework será decidida separadamente.

Next.js é candidato, não decisão arquitetural definitiva enquanto não houver ADR.

---

# 11. Organização de código

A organização final de diretórios será definida durante a implementação.

Porém, conceitualmente, o código deve refletir responsabilidades.

Exemplo:

```text
src/
├── app/
├── modules/
│   ├── commerce/
│   ├── editorial/
│   ├── brand/
│   └── wheels/
├── integrations/
└── shared/
```

Essa estrutura é ilustrativa.

Não deve ser criada antecipadamente apenas para satisfazer este documento.

`shared` deve conter somente elementos verdadeiramente neutros.

Não utilizar `shared` como:

> “não sei onde isso pertence, então vou colocar aqui.”

---

# 12. Regras de negócio

Regras de negócio não devem depender da interface.

Evitar:

```text
Page
└── decide regra comercial
```

Preferir:

```text
Page
↓
Application / Domain
↓
regra
```

A interface apresenta o resultado.

Ela não deve ser autoridade para regras críticas.

Exemplos:

- disponibilidade;
- possibilidade de compra;
- estado comercial;
- política `made_to_order`.

Quando possível, regras críticas também devem ser validadas pela autoridade responsável pelo dado.

---

# 13. Interface não é autoridade

Dados enviados pelo navegador não devem ser considerados automaticamente confiáveis.

Especialmente:

- preço;
- descontos;
- disponibilidade;
- identificadores;
- estados comerciais.

O frontend pode exibir valores.

A autoridade comercial deve validar operações críticas.

Princípio:

> o navegador pede; a autoridade confirma.

---

# 14. Produtos e variantes

O domínio não deve assumir que todo produto possui:

```text
cor + tamanho
```

Produtos podem possuir:

- nenhuma opção;
- uma opção;
- várias opções.

Exemplos:

```text
Camiseta
├── tamanho
└── cor
```

```text
Shape
└── tamanho
```

```text
Adesivo
└── sem opções
```

Somente combinações comerciais realmente existentes devem ser tratadas como variantes vendáveis.

Não gerar automaticamente todas as combinações possíveis.

---

# 15. Stocked e made-to-order

A arquitetura deve permitir distinguir produtos:

- pronta entrega;
- sob encomenda.

Esses conceitos não devem ser deduzidos apenas pela quantidade de estoque.

Exemplo incorreto:

```text
stock = 0
↓
made_to_order
```

Essas são regras diferentes.

As políticas detalhadas serão documentadas separadamente.

---

# 16. Desenvolvimento por fatias verticais

O desenvolvimento deve priorizar fluxos completos pequenos.

Evitar:

```text
criar todos os models
↓
criar todos os services
↓
criar todos os components
↓
criar todas as páginas
↓
testar tudo no final
```

Preferir:

```text
produto
↓
listagem
↓
integração real
↓
UI
↓
teste
↓
validação
```

Depois:

```text
produto
↓
detalhe
↓
variante
↓
teste
↓
validação
```

Cada fatia ajuda a provar a arquitetura antes que ela cresça.

---

# 17. Estratégia de legado

O projeto antigo não será migrado mecanicamente.

Cada elemento deve ser avaliado como:

- Preservar;
- Reprojetar;
- Descartar;
- Referência.

Podem ser preservados:

- conteúdo;
- assets;
- URLs úteis;
- identidade;
- conhecimento;
- regras válidas;
- comportamentos de UX;
- soluções comprovadamente boas.

Devem ser reprojetados quando necessário:

- componentes excessivamente acoplados;
- modelos comerciais rígidos;
- fluxos dependentes da arquitetura antiga;
- regras dentro de páginas;
- integrações duplicadas.

O legado ensina.

Ele não governa a nova arquitetura.

---

# 18. Integrações externas

Toda integração deve possuir:

- responsabilidade clara;
- configuração isolada;
- tratamento de erro;
- observabilidade adequada;
- comportamento compreensível em caso de falha.

Evitar chamadas externas espalhadas pela aplicação.

Preferir:

```text
Application
↓
Adapter
↓
External Service
```

Credenciais nunca devem estar:

- hardcoded;
- commitadas;
- expostas ao cliente quando forem privadas.

---

# 19. Tratamento de falhas

Falhas externas devem ser tratadas de acordo com impacto.

Uma indisponibilidade editorial, por exemplo, não deve necessariamente derrubar toda a experiência comercial.

Da mesma forma, falhas de recursos experimentais não devem impedir funcionalidades críticas.

Prioridades:

```text
Compra
>
Navegação
>
Conteúdo complementar
>
Experimentos visuais
```

A estratégia específica dependerá de cada integração.

---

# 20. Segurança

Segurança deve existir desde o início, sem burocracia artificial.

Princípios:

- princípio do menor privilégio;
- segredos fora do código;
- validação de entradas;
- dependências mantidas;
- APIs protegidas;
- operações comerciais validadas pela autoridade adequada;
- exposição mínima de dados.

Não confiar em dados do cliente para decisões críticas.

---

# 21. Testes

Testes devem proteger comportamento importante.

Não testar apenas para aumentar cobertura.

Priorizar:

## Unidade

Para:

- regras;
- transformações;
- funções críticas.

## Integração

Para:

- contratos;
- adaptadores;
- comunicação entre módulos e serviços.

## Interface

Para:

- comportamento importante de componentes.

## E2E

Para jornadas críticas.

Exemplos futuros:

```text
produto
↓
variante
↓
carrinho
↓
checkout
```

e:

```text
evento
↓
agenda
↓
página do evento
```

---

# 22. Acessibilidade

Objetivo:

> WCAG 2.2 AA quando aplicável.

Considerar desde o início:

- navegação por teclado;
- foco;
- contraste;
- labels;
- semântica;
- leitores de tela;
- movimento reduzido;
- estados;
- feedback;
- áreas de toque adequadas.

A estética experimental da Chouga não justifica inacessibilidade.

---

# 23. Performance

Performance deve ser tratada como característica do produto.

Commerce deve permanecer especialmente leve.

Evitar globalmente:

- bibliotecas grandes sem necessidade;
- vídeos pesados;
- animações caras;
- scripts de terceiros excessivos;
- assets experimentais.

Wheels pode possuir experiências mais pesadas, desde que:

- sejam isoladas;
- carreguem apenas quando necessárias;
- respeitem dispositivos e conexões;
- possuam comportamento adequado com movimento reduzido.

Princípio:

> medir → entender → otimizar → medir novamente.

---

# 24. SEO

SEO deve fazer parte da arquitetura.

Considerar:

- HTML indexável;
- metadata;
- URLs estáveis;
- canonical;
- redirects;
- sitemap;
- structured data;
- imagens;
- links internos;
- performance.

A arquitetura não deve depender exclusivamente de JavaScript no cliente para tornar conteúdo essencial descobrível.

---

# 25. Observabilidade

A aplicação deve permitir compreender falhas importantes.

A estratégia futura poderá incluir:

- logs estruturados;
- monitoramento de erros;
- métricas;
- analytics.

Ferramentas específicas ainda não estão decididas.

Não adicionar múltiplos serviços de observabilidade antes de existir necessidade.

O objetivo não é observar tudo.

O objetivo é conseguir responder:

> “O que quebrou, onde e para quem?”

---

# 26. Analytics

Analytics deve responder perguntas de produto e negócio.

Não instrumentar eventos apenas porque podem ser coletados.

Exemplos futuros:

```text
view_item
add_to_cart
begin_checkout
purchase
```

e:

```text
read_article
view_event
view_athlete
```

A escolha de ferramentas deve ocorrer separadamente.

---

# 27. Dependências

Antes de adicionar uma dependência:

1. identificar o problema;
2. verificar se a plataforma já resolve;
3. avaliar alternativas;
4. verificar manutenção;
5. avaliar peso e impacto;
6. justificar a inclusão.

Não instalar uma biblioteca para evitar poucas linhas de código simples.

Também não reimplementar problemas complexos que uma biblioteca madura resolve melhor.

---

# 28. Decisões arquiteturais

Decisões importantes devem utilizar ADRs.

Formato:

```text
# ADR-XXX — Título

Status:
Data:

## Contexto

## Decisão

## Alternativas consideradas

## Consequências
```

ADRs devem registrar principalmente decisões difíceis de reconstruir no futuro.

Não criar ADR para decisões triviais.

---

# 29. Decisões atuais

Consideramos atualmente decisões:

- arquitetura em monólito modular;
- storefront próprio;
- Commerce e Editorial separados;
- plataforma Commerce pronta na V1;
- integrações externas tratadas como adaptadores;
- ausência de banco próprio sem necessidade concreta;
- desenvolvimento por fatias verticais;
- migração consciente do legado.

---

# 30. Hipóteses abertas

Ainda precisam ser confirmadas:

- Shopify ou Nuvemshop;
- Sanity como solução editorial definitiva;
- Next.js como framework;
- estratégia de estilos;
- hospedagem;
- observabilidade;
- analytics;
- políticas completas de `stocked`;
- políticas completas de `made_to_order`.

Hipótese não deve ser implementada como decisão definitiva sem validação.

---

# 31. Fora de escopo arquitetural inicial

Não introduzir sem necessidade comprovada:

- microserviços;
- multi-tenant;
- CQRS;
- event sourcing;
- event bus genérico;
- framework próprio;
- plugin system;
- motor próprio de busca;
- motor próprio de Commerce;
- aplicação mobile;
- infraestrutura distribuída;
- abstrações destinadas a necessidades hipotéticas.

---

# 32. Critério para evolução arquitetural

A arquitetura pode mudar.

Mudanças devem acontecer quando houver evidência.

Antes de uma alteração estrutural relevante, responder:

1. qual problema temos hoje?
2. qual evidência demonstra esse problema?
3. a arquitetura atual consegue resolvê-lo?
4. qual é a solução mais simples?
5. quais alternativas existem?
6. qual custo será introduzido?
7. qual benefício concreto esperamos?
8. como validaremos o resultado?

Arquitetura não é monumento.

É ferramenta.

---

# 33. Princípio final

A arquitetura da Chouga deve permitir que o produto evolua sem transformar cada nova funcionalidade em uma negociação com o passado.

Ela deve ser simples o suficiente para ser entendida.

Modular o suficiente para crescer.

Flexível o suficiente para evoluir.

E disciplinada o suficiente para não virar novamente um monólito sem freio.

> **Loja limpa. Conteúdo sujo. Engenharia limpa.**
