# AGENTS.md | CHOUGA SKATEBOARD

> **Código com propósito. Arquitetura com consciência. Criatividade sem coleira.**

## 1. Identidade do projeto

A Chouga não é apenas uma loja de skate.

É uma marca que vive a rua, o skate, o streetwear e a cultura underground.

A Chouga V2.0 deve unir:

- **Atitude:** identidade autêntica, urbana e expressiva.
- **Experiência:** comprar deve ser simples, intuitivo e confiável.
- **Engenharia:** código organizado, modular e sustentável.
- **Liberdade criativa:** experimentar faz parte do desenvolvimento.

**Não reinventamos o comércio eletrônico. Reinventamos como a Chouga se expressa dentro dele.**

## 2. Filosofia de desenvolvimento

**Construir primeiro. Validar na prática. Documentar o necessário.**

- Priorizar funcionalidades reais e experiências visuais.
- Evitar abstrações prematuras e complexidade desnecessária.
- Não criar processos apenas por formalidade.
- Não introduzir dependências sem necessidade concreta.
- Favorecer soluções simples, legíveis e fáceis de evoluir.
- Permitir experimentação, refatoração e mudanças de direção.

Boas práticas são ferramentas, não obstáculos.

## 3. Arquitetura e modularidade

Cada módulo deve ter responsabilidades claras.

- Componentes devem manter seus estilos e recursos específicos organizados.
- Cores, tipografia, espaçamentos e demais tokens compartilhados pertencem ao `globals.css`.
- Estilos exclusivos pertencem aos respectivos CSS Modules.
- Lógica reutilizável deve ser compartilhada quando existir uma necessidade real.
- Evitar arquivos gigantes, responsabilidades misturadas e duplicação desnecessária.
- Respeitar a estrutura existente antes de criar novas pastas ou abstrações.

**Modularizar para facilitar, não para fragmentar.**

## 4. Interface e experiência

A direção visual da Chouga é **underground editorial**.

- Visual autêntico, marcante e conectado à cultura skate.
- Navegação comercial familiar, inspirada nas boas práticas do mercado.
- Responsividade desde o início.
- Acessibilidade como parte da implementação.
- Performance considerada nas decisões visuais e técnicas.
- Animações e efeitos devem enriquecer a experiência, nunca prejudicá-la.

A identidade pode ser ousada. A usabilidade deve ser clara.

## 5. Qualidade de código

- Utilizar TypeScript com tipagem adequada.
- Preferir componentes coesos e responsabilidades bem definidas.
- Tratar erros e estados de interface relevantes.
- Evitar código morto, duplicações e soluções improvisadas permanentes.
- Manter semântica HTML e acessibilidade.
- Validar alterações com as ferramentas disponíveis no projeto.
- Criar testes proporcionais ao risco e à complexidade da funcionalidade.

**Qualidade não significa complexidade.**

## 6. Fluxo de trabalho

O desenvolvimento deve seguir um ciclo simples:

**Criar → Executar → Avaliar → Ajustar → Validar.**

- Trabalhar em branches para isolar mudanças.
- Commits devem representar alterações coerentes.
- Issues e pull requests são ferramentas opcionais conforme a necessidade.
- Não exigir planejamento extenso para alterações pequenas.
- Não expandir o escopo sem alinhamento com o desenvolvedor.
- Não refatorar partes não relacionadas apenas por preferência arquitetural.

O objetivo é manter o projeto evoluindo.

## 7. Documentação

**Documentar o que existe, não tudo o que imaginamos construir.**

- Documentação deve ser curta, objetiva e útil.
- Registrar decisões técnicas importantes quando necessário.
- Explicar configurações ou comportamentos que não sejam evidentes no código.
- Evitar documentos redundantes, relatórios obrigatórios e burocracia artificial.
- Não exigir atualização documental para cada pequena alteração.
- Não criar documentação espontaneamente sem necessidade ou solicitação.

O próprio código deve comunicar suas intenções sempre que possível.

## 8. Segurança e integrações

- Nunca expor credenciais ou segredos.
- Não modificar sistemas ou bancos de produção sem autorização explícita.
- Respeitar as responsabilidades dos serviços externos.
- Não implementar infraestrutura comercial própria sem necessidade definida.
- Preservar os sistemas existentes enquanto a V2.0 evolui.

## 9. Como o agente deve colaborar

O agente é um parceiro técnico e criativo, não um gerente burocrático.

Deve:

- Ouvir a intenção antes de propor soluções.
- Focar exclusivamente no escopo solicitado.
- Consultar o código existente antes de sugerir alterações.
- Apresentar implementações práticas e verificáveis.
- Explicar decisões importantes com objetividade.
- Questionar escolhas quando houver riscos técnicos reais.
- Respeitar as decisões criativas do desenvolvedor.
- Não inventar testes executados, resultados ou funcionalidades concluídas.
- Evitar listas intermináveis de tarefas e documentação não solicitada.

**O agente ajuda a construir. Não assume o controle criativo do projeto.**

---

## Princípio fundamental

**A Chouga nasceu da rua, não de um manual.**

Queremos uma aplicação profissional, mas também queremos experimentar, errar, aprender, criar e evoluir.

A arquitetura deve sustentar a criatividade, nunca aprisioná-la.

**Menos burocracia. Mais código. Mais skate. Mais Chouga.**
