# AGENTS.md — Chouga 2.0

Este arquivo define as regras permanentes de produto, engenharia e arquitetura da Chouga 2.0.

As regras universais de colaboração com o Capitão continuam válidas.

Documentação detalhada pertence a `docs/`. Este arquivo deve permanecer curto, estável e útil como contexto permanente.

---

# 1. Missão

A Chouga 2.0 é a plataforma digital de uma marca de skate, streetwear e cultura urbana.

Ela combina duas dimensões:

- Commerce;
- Culture.

O objetivo é construir uma plataforma capaz de vender produtos, representar a identidade Chouga, publicar conteúdo e evoluir sem repetir o crescimento desorganizado do legado.

Princípio de produto:

> Loja limpa. Conteúdo sujo. Engenharia limpa.

Princípio técnico:

> Compramos commodity. Construímos identidade.

---

# 2. Papel do Capitão

Nando é o diretor do produto.

O agente atua como copiloto técnico, de produto e arquitetura.

O agente pode:

- analisar;
- investigar;
- comparar;
- recomendar;
- propor;
- explicar.

Decisões relevantes de:

- produto;
- negócio;
- arquitetura;
- design;
- fornecedores;
- escopo;

devem ser apresentadas ao Capitão antes de mudanças estruturais.

O agente recomenda.

O Capitão decide.

---

# 3. Legado

A Chouga antiga é fonte de:

- conhecimento;
- regras;
- conteúdo;
- assets;
- UX;
- identidade;
- aprendizados;
- problemas já descobertos.

Ela não é arquitetura obrigatória da nova aplicação.

Ao avaliar algo do legado, classificar quando relevante como:

- Preservar;
- Reprojetar;
- Descartar;
- Referência.

Não copiar automaticamente diretórios, componentes ou estruturas.

Antes de reaproveitar código legado, entender:

1. qual problema ele resolve;
2. se o problema ainda existe;
3. onde essa responsabilidade pertence na nova arquitetura;
4. se vale reutilizar código ou apenas comportamento e conhecimento.

---

# 4. Filosofia de engenharia

Preferir:

- simplicidade;
- modularidade;
- baixo acoplamento;
- alta coesão;
- contratos claros;
- composição;
- segurança;
- acessibilidade;
- testabilidade;
- manutenção;
- performance medida.

Evitar arquitetura especulativa.

Não usar complexidade como símbolo de maturidade.

Não introduzir tecnologia apenas porque ela é popular.

Antes de adicionar dependência, serviço ou camada, explicar:

1. qual problema resolve;
2. por que a solução atual não é suficiente;
3. qual complexidade adiciona;
4. qual benefício concreto traz.

---

# 5. Arquitetura

A arquitetura inicial é um monólito modular.

Domínios principais:

- Commerce;
- Editorial;
- Brand;
- Wheels.

Integrações externas são adaptadores.

Estrutura conceitual:

```text
App
├── Commerce
├── Editorial
├── Brand
├── Wheels
└── Integrations
```

Commerce e Editorial devem permanecer desacoplados.

A camada de aplicação pode compor informações dos dois.

Evitar:

- imports profundos entre módulos;
- regras de negócio dentro de páginas;
- acesso arbitrário a serviços externos;
- `shared` como depósito de código sem dono.

Cada responsabilidade deve possuir localização clara.

---

# 6. Commerce

Na V1, a Chouga não deve desenvolver seu próprio motor comercial.

A estratégia atual é utilizar uma plataforma de commerce madura.

Candidatas em avaliação:

- Shopify;
- Nuvemshop.

A escolha ainda é uma decisão aberta.

Não assumir uma delas como definitiva sem ADR aprovado.

Critérios relevantes incluem:

- operação brasileira;
- Pix;
- cartão;
- frete;
- APIs;
- capacidade headless;
- checkout;
- estoque;
- pedidos;
- experiência administrativa;
- custo total de operação.

Não duplicar a fonte de verdade comercial.

---

# 7. Fronteira Commerce

A aplicação não deve ficar acoplada diretamente ao fornecedor comercial.

O domínio trabalha com conceitos próprios, por exemplo:

- Product;
- Variant;
- Collection;
- Price;
- Cart;
- Order.

Detalhes específicos do fornecedor devem permanecer em adaptadores.

Conceitualmente:

```text
Chouga
   ↓
Commerce
   ↓
Commerce Provider
```

Não espalhar tipos, payloads ou regras específicas do fornecedor pelo restante da aplicação.

Ao mesmo tempo, não construir uma abstração universal de commerce sem necessidade.

A fronteira existe para proteger o domínio.

---

# 8. Commerce próprio

Um motor comercial próprio somente deve ser considerado diante de necessidade concreta.

Exemplos:

- limitações comprovadas da plataforma;
- custos excessivos;
- workflows específicos;
- regras comerciais não atendidas;
- operação suficientemente madura;
- equipe capaz de manter estoque, pedidos, pagamentos e conciliação.

Não desenvolver Commerce próprio como exercício técnico.

---

# 9. Editorial

Sanity é a hipótese atual de autoridade editorial.

Conteúdos esperados incluem:

- Article;
- Athlete;
- Event;
- Author;
- InstitutionalPage;
- Campaign;
- WheelsCuration.

Preço e estoque não pertencem ao Editorial.

Conteúdo jornalístico não pertence ao Commerce.

Quando conteúdo referenciar produto, utilizar identificadores estáveis sem duplicar dados comerciais.

Agenda deve ser derivada de eventos publicados, não mantida como segunda fonte de conteúdo.

---

# 10. Wheels

Wheels é uma experiência da marca.

Pode ser:

- experimental;
- fotográfico;
- texturizado;
- irregular;
- animado.

Pode explorar:

- atletas;
- vídeos;
- eventos;
- spots;
- arquivos;
- fotografia;
- xerox;
- stickers;
- halftone;
- grain.

Wheels não deve:

- bloquear compra;
- prejudicar acessibilidade;
- tornar navegação confusa;
- criar uma segunda fonte editorial;
- carregar efeitos pesados globalmente.

---

# 11. Design

A experiência comercial deve utilizar padrões consolidados de e-commerce.

Não reinventar sem necessidade:

- navegação;
- produto;
- variante;
- carrinho;
- checkout;
- filtros;
- busca.

A identidade Chouga aparece através de:

- direção de arte;
- tipografia;
- fotografia;
- movimento;
- textura;
- conteúdo.

Direção visual:

> 80% elegância, 20% sujeira.

Textura é acento.

Não estrutura.

---

# 12. Design System

Estabelecer fundamentos mínimos antes de multiplicar páginas.

Definir progressivamente:

- cores;
- tipografia;
- spacing;
- grid;
- breakpoints;
- bordas;
- radius;
- motion;
- foco;
- estados.

Primitivas reutilizáveis devem surgir conforme uso real.

Preferir:

> necessidade real → padrão identificado → abstração

e evitar:

> abstração → procurar onde utilizá-la

---

# 13. Desenvolvimento

Desenvolver por fatias verticais.

Evitar construir todas as camadas antes de entregar comportamento real.

Exemplo Commerce:

```text
produto real
↓
listagem
↓
detalhe
↓
variante
↓
carrinho
↓
checkout
```

Exemplo Editorial:

```text
evento
↓
agenda
↓
atleta
↓
matéria
```

Cada fatia deve validar:

- arquitetura;
- dados;
- UX;
- integração;
- segurança;
- testes relevantes.

---

# 14. Produto e variantes

Nunca assumir que produto significa roupa.

O domínio deve conseguir representar diferentes tipos de produto.

Não assumir universalmente:

- cor;
- tamanho.

Um produto pode:

- possuir várias opções;
- possuir uma opção;
- não possuir opções.

Evitar gerar automaticamente todas as combinações possíveis.

Somente variantes realmente existentes devem ser vendáveis.

---

# 15. Stocked e made-to-order

Distinguir claramente:

- pronta entrega;
- sob encomenda.

Estoque zero não deve representar implicitamente disponibilidade ou indisponibilidade.

As políticas comerciais precisam ser explícitas.

Quando relevante, considerar:

- prazo;
- capacidade;
- quantidade;
- cancelamento;
- comunicação ao cliente.

---

# 16. Banco próprio

Não criar Supabase/PostgreSQL apenas por antecipação.

Enquanto:

- Commerce estiver em uma plataforma externa;
- Editorial estiver no Sanity;

um banco adicional deve existir somente quando surgir um domínio concreto que precise dele.

---

# 17. Business-first

Arquitetura deve servir ao negócio.

Antes de desenvolver uma funcionalidade, perguntar:

- qual problema resolve?
- qual valor entrega ao cliente?
- é necessária para a V1?
- quem opera isso depois?
- qual custo de manutenção cria?
- temos evidência da necessidade?

Uma funcionalidade sem dono operacional está incompleta.

---

# 18. SEO, acessibilidade e performance

SEO faz parte da arquitetura.

Considerar:

- HTML indexável;
- URLs estáveis;
- redirects;
- metadata;
- canonical;
- sitemap;
- structured data;
- links internos.

Acessibilidade deve ser considerada desde o desenvolvimento.

Objetivo: WCAG 2.2 AA quando aplicável.

A identidade underground não justifica inacessibilidade.

Commerce deve permanecer leve.

Efeitos experimentais devem carregar apenas onde forem necessários.

Medir antes de otimizar.

---

# 19. Testes e validação

Nenhuma implementação é concluída apenas porque aparentemente funciona.

Aplicar validações proporcionais ao risco e à alteração.

Podem incluir:

- tipos;
- lint;
- testes unitários;
- testes de integração;
- testes de UI;
- E2E;
- inspeção visual;
- responsividade;
- acessibilidade;
- performance;
- segurança.

Não criar testes apenas para aumentar cobertura.

Proteger principalmente:

- regras;
- contratos;
- jornadas críticas;
- regressões conhecidas.

---

# 20. Documentação e ADRs

Documentação detalhada pertence a `docs/`.

Decisões importantes devem ser registradas em ADRs curtos.

Quando uma tarefa envolver decisão já documentada, consultar o ADR correspondente.

Estrutura esperada:

```text
docs/
├── product/
├── architecture/
├── business/
├── marketing/
└── adr/
```

Não duplicar grandes trechos desses documentos neste arquivo.

---

# 21. Decisões e hipóteses atuais

Considerar vigentes:

## Decisões

- monólito modular;
- storefront próprio;
- plataforma Commerce pronta na V1;
- Commerce e Editorial separados;
- Wheels como experiência;
- migração consciente do legado;
- desenvolvimento por fatias verticais;
- não criar banco próprio sem necessidade concreta.

## Hipóteses ainda abertas

- Shopify ou Nuvemshop;
- Sanity como CMS editorial definitivo;
- Next.js como framework;
- estratégia de estilos;
- estratégia final de hospedagem;
- políticas detalhadas de `stocked` e `made_to_order`;
- escopo exato da V1.

Hipótese não deve ser tratada como decisão definitiva.

---

# 22. Fora de escopo inicial

Não criar sem necessidade comprovada:

- microserviços;
- CQRS;
- event sourcing;
- event bus genérico;
- multi-tenant;
- framework interno;
- plugin system;
- recomendação por IA;
- aplicativo mobile;
- motor próprio de busca;
- motor próprio de commerce;
- infraestrutura especulativa.

---

# 23. Regra de ouro

Não construir tecnologia para provar capacidade técnica.

Construir tecnologia para:

- vender;
- comunicar;
- criar cultura;
- operar bem;
- aprender;
- evoluir.

> Compramos commodity. Construímos identidade.
