# ADR-002 — Framework do Storefront

**Status:** Aceito  
**Data:** 2026-10-06

## Contexto

A Chouga 2.0 terá um storefront próprio, independente da plataforma responsável pelo Commerce.

A aplicação precisa atender duas grandes dimensões:

- Commerce;
- Culture.

O storefront deverá consumir dados comerciais da Nuvemshop e conteúdo editorial de uma solução CMS, mantendo essas responsabilidades desacopladas.

A plataforma também precisa atender requisitos importantes para a Chouga:

- React;
- TypeScript;
- SEO;
- páginas indexáveis;
- renderização estática e dinâmica;
- boa performance;
- integração com APIs externas;
- responsividade;
- acessibilidade;
- possibilidade de hospedagem fora de um fornecedor específico;
- desenvolvimento incremental;
- suporte a conteúdo editorial e e-commerce na mesma aplicação.

## Decisão

Utilizar **Next.js com App Router** como framework do storefront da Chouga 2.0.

React continuará sendo responsável pela construção da interface.

Next.js será responsável pela infraestrutura de aplicação necessária ao storefront, incluindo roteamento, estratégias de renderização e recursos relacionados ao ciclo de vida das páginas.

A arquitetura interna continuará seguindo o modelo de monólito modular definido pela Chouga.

Conceitualmente:

```text
Next.js
│
├── Application
│
├── Commerce
│   └── Nuvemshop Adapter
│
├── Editorial
│   └── CMS Adapter
│
├── Brand
│
└── Wheels
```

Next.js não representa um domínio da aplicação.

Ele é infraestrutura para execução do storefront.

## Motivos

### React

A Chouga continuará utilizando React, tecnologia já alinhada ao conhecimento atual do projeto e adequada à construção da interface proposta.

### SEO e renderização

A aplicação possuirá páginas de:

- produtos;
- categorias;
- coleções;
- matérias;
- atletas;
- eventos;
- páginas institucionais.

Essas páginas precisam ser adequadamente indexáveis.

Next.js oferece estratégias de renderização compatíveis com páginas estáticas, conteúdo atualizado e dados dinâmicos.

### Commerce + Editorial

A Chouga não possui apenas uma loja.

Ela combina dados comerciais e editoriais.

Next.js permite que diferentes páginas adotem estratégias adequadas ao seu conteúdo sem transformar toda a aplicação em uma SPA exclusivamente executada no navegador.

### Metadata

O framework possui suporte próprio para metadata das páginas, facilitando responsabilidades relacionadas a:

- títulos;
- descrições;
- canonical;
- Open Graph;
- robots;
- sitemap.

### Integrações externas

O storefront precisará consumir serviços como:

```text
Nuvemshop
    ↓
Commerce Adapter
    ↓
Chouga
```

e:

```text
CMS
 ↓
Editorial Adapter
 ↓
Chouga
```

Next.js permite executar parte dessas integrações no servidor quando necessário, evitando expor credenciais ou responsabilidades privadas ao navegador.

### Hospedagem

A utilização de Next.js não implica obrigatoriamente utilizar Vercel.

A estratégia de hospedagem será decidida separadamente.

## App Router

Utilizar o App Router como modelo de roteamento da aplicação.

O Pages Router não será utilizado em código novo, salvo necessidade técnica futura devidamente justificada.

O App Router será tratado como infraestrutura.

A organização de domínio não deve ser substituída pela organização de rotas.

Por exemplo, não devemos assumir que:

```text
app/
```

é o local onde todas as regras da aplicação devem existir.

Rotas devem coordenar comportamento.

Regras de negócio devem permanecer em seus respectivos módulos.

## Server e Client Components

A aplicação deve evitar transformar todos os componentes em Client Components por conveniência.

Preferir execução no servidor quando não houver necessidade de:

- estado local;
- eventos do navegador;
- hooks client-side;
- APIs exclusivas do browser.

Client Components devem existir quando houver necessidade concreta de interatividade.

A decisão deve ser feita por responsabilidade, não por preferência automática.

## Alternativas consideradas

### React Router Framework Mode

React Router oferece atualmente recursos de:

- Server-Side Rendering;
- Client-Side Rendering;
- pre-rendering;
- rotas;
- carregamento de dados.

Seria tecnicamente capaz de atender a Chouga.

Não foi escolhido porque a Chouga possui forte necessidade conjunta de:

- SEO;
- conteúdo editorial;
- páginas comerciais;
- diferentes estratégias de renderização.

Next.js oferece uma solução mais integrada para esses requisitos e reduz a quantidade de decisões de infraestrutura que precisaríamos tomar inicialmente.

### React + Vite SPA

É uma abordagem conhecida pelo projeto legado.

Possui simplicidade inicial e excelente experiência de desenvolvimento.

Entretanto, uma SPA exclusivamente client-side exigiria decisões adicionais para atender adequadamente:

- SEO;
- pre-rendering;
- metadata;
- conteúdo editorial indexável;
- páginas dinâmicas de produto.

Por isso não será utilizada como arquitetura principal da Chouga 2.0.

### Framework próprio

Descartado.

Não existe necessidade de desenvolver infraestrutura própria de roteamento, rendering ou build.

Isso contrariaria o princípio:

> Compramos commodity. Construímos identidade.

## Consequências positivas

A decisão fornece uma base pronta para:

- React;
- TypeScript;
- roteamento;
- SEO;
- rendering;
- metadata;
- integração server-side;
- páginas estáticas e dinâmicas.

Também permite concentrar o desenvolvimento nas partes que realmente diferenciam a Chouga.

## Consequências negativas

A equipe precisará compreender conceitos adicionais do Next.js, incluindo:

- App Router;
- Server Components;
- Client Components;
- caching;
- rendering;
- revalidation.

Existe também risco de utilizar recursos específicos do framework de maneira excessiva e criar acoplamento desnecessário.

Para reduzir esse risco:

> regras de negócio pertencem aos módulos da Chouga, não ao framework.

## Relação com a arquitetura

A decisão pelo Next.js não altera o modelo arquitetural.

Continua vigente:

```text
App
├── Commerce
├── Editorial
├── Brand
├── Wheels
└── Integrations
```

Next.js fornece a infraestrutura utilizada para expor essa aplicação na Web.

## Relação com Commerce

Nuvemshop continuará sendo a autoridade comercial da V1.

Next.js não substituirá:

- catálogo comercial;
- estoque;
- pedidos;
- checkout;
- pagamentos.

O storefront consumirá o Commerce através da fronteira definida pela Chouga.

## Relação com Editorial

O CMS editorial continuará sendo uma responsabilidade externa.

Next.js consumirá seu conteúdo através do módulo Editorial.

A escolha definitiva do CMS deverá ser registrada em ADR próprio.

## Hospedagem

A escolha do framework não define automaticamente o provedor de hospedagem.

Vercel pode ser considerada futuramente, assim como outras plataformas compatíveis.

Hospedagem será tratada como decisão independente.

## Fora de escopo desta decisão

Este ADR não define:

- hospedagem;
- estratégia de CSS;
- Design System;
- CMS definitivo;
- configuração da Nuvemshop;
- estrutura final de diretórios;
- analytics;
- observabilidade.

Essas decisões serão tomadas separadamente conforme necessário.

## Resultado

A Chouga 2.0 utilizará:

```text
React
  +
TypeScript
  +
Next.js
  +
App Router
```

como base do storefront.

A implementação deverá preservar os limites de domínio da Chouga e evitar que o framework se torne a arquitetura do produto.
