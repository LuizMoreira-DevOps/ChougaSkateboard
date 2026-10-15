# Processo de Release — Chouga 2.0

## 1. Objetivo

Este documento define como versões da Chouga 2.0 são identificadas, validadas e publicadas.

O processo deve permanecer simples, rastreável e proporcional à maturidade do projeto.

Release e deploy são conceitos diferentes.

Uma release representa uma versão identificável do software.

O deploy representa a disponibilização dessa versão em um ambiente.

A demonstração atual é publicada automaticamente no GitHub Pages após alterações na `main`. A hospedagem transacional definitiva ainda será definida.

---

## 2. Fonte da release

Releases são produzidas exclusivamente a partir da branch:

`main`

A `main` representa o estado integrado e aprovado do projeto.

Não criar inicialmente:

- `develop`;
- branches permanentes de release;
- branches de versão;
- fluxos paralelos de publicação.

Mudanças devem seguir o fluxo normal:

```text
Issue
↓
Branch de trabalho
↓
Pull Request
↓
Validação
↓
Squash merge
↓
main
```

## 3. Automação de release

A Chouga utiliza Release Please para automatizar o versionamento e a criação de releases.
O workflow responsável está localizado em:

`.github/workflows/release-please.yml`

Ele é executado sempre que novas alterações são integradas à `main`.

A configuração atual utiliza:

```text
release-type: simple
```

Nesse modo, o Release Please gerencia:
- cálculo da próxima versão;
- criação e atualização da Release Pull Request;
- CHANGELOG.md;
- atualização do estado de versão no manifesto `.release-please-manifest.json`;
- criação da tag;
- criação do GitHub Release.
O Release Please não realiza deploy da aplicação.

## 4. Semantic Versioning
A Chouga utiliza Semantic Versioning.

Formato:
```text
MAJOR.MINOR.PATCH
```

Exemplo:
```text
0.3.1
```

As tags Git utilizam o prefixo `v`:
```text
v0.3.1
```

PATCH
Correções compatíveis incrementam PATCH.

Exemplo:
```text
fix: correct product availability
```

Pode resultar em:
```text
v0.2.0
↓
v0.2.1
```

MINOR
Novas funcionalidades compatíveis incrementam MINOR.

Exemplo:
```text
feat: add product catalog
```

Pode resultar em:
```text
v0.2.1
↓
v0.3.0
```

MAJOR
Breaking changes incrementam MAJOR.
Exemplo:
```text
feat!: replace public product contract
```

Pode resultar em:
```text
v0.3.0
↓
v1.0.0
```

Breaking changes devem ser utilizados apenas quando existir incompatibilidade real e intencional.

## 5. Conventional Commits

O histórico da `main` deve seguir Conventional Commits.

Como a estratégia de merge utilizada é Squash Merge, o título da Pull Request possui importância especial.

O título da PR deve representar corretamente a mudança realizada, pois ele será utilizado como commit na main e poderá ser interpretado pelo Release Please.

Exemplos:
```text
feat: initialize Chouga storefront
fix: correct mobile navigation
docs: update release process
chore: configure repository
refactor: isolate commerce adapter
perf: optimize product images
```

Os tipos `feat` e `fix` influenciam diretamente o versionamento.

Breaking changes podem ser declarados utilizando:
```text
feat!: replace product contract
```

ou:
```text
BREAKING CHANGE: descrição da incompatibilidade
```

Tipos como `docs`, `chore`, `refactor` e `perf` continuam sendo importantes para manter o histórico compreensível, mas não devem ser utilizados apenas para provocar uma nova versão.

## 6. Release Pull Request
O Release Please não publica uma nova versão imediatamente após cada merge.

Quando encontra alterações versionáveis na `main`, ele cria ou atualiza uma **Release Pull Request**.

Fluxo:
```text
Pull Request de desenvolvimento
↓
Squash merge
↓
main
↓
Release Please
↓
Release Pull Request
```

Enquanto novas alterações forem integradas à `main`, a Release Pull Request pode continuar sendo atualizada automaticamente.

Ela representa a próxima versão candidata do projeto.

A release somente deve ser publicada quando essa Pull Request for revisada e aprovada para merge.

## 7. Publicação

O merge da Release Pull Request representa a decisão explícita de publicar uma nova versão.

Após esse merge, o Release Please é responsável por gerar os artefatos de release.

Fluxo:
```text
Release Pull Request
↓
Revisão
↓
Merge
↓
Tag
↓
GitHub Release
```

Exemplo:
```text
v0.1.0
```

Tags de release não devem ser criadas manualmente enquanto essa automação estiver vigente, exceto diante de necessidade excepcional e documentada.

## 8. CHANGELOG

O arquivo:
`CHANGELOG.md`
é gerenciado automaticamente pelo Release Please.
Ele registra o histórico das versões publicadas e suas principais alterações.
O changelog não deve ser mantido manualmente como uma segunda fonte de verdade.
Alterações relevantes devem surgir do histórico de mudanças integrado à main.

## 9. Estado de versão

A versão registrada pelo Release Please é acompanhada no arquivo `.release-please-manifest.json`.

O repositório não possui `version.txt` nesta etapa. Não presumir sua existência nem criá-lo sem necessidade aprovada.

A versão do projeto não representa automaticamente versões de API, banco de dados ou contratos de integrações externas.

## 10. Critérios para publicação
Antes de mergear uma Release Pull Request, verificar quando aplicável:
- alterações planejadas estão integradas à main;
- critérios de aceite das issues relacionadas foram atendidos;
- build conclui com sucesso;
- lint conclui com sucesso;
- testes relevantes passam;
- regressões conhecidas foram avaliadas;
- documentação afetada foi atualizada;
- não existem problemas bloqueadores conhecidos;
- a versão proposta corresponde ao impacto das mudanças.
As validações devem evoluir junto com o projeto.
Enquanto não houver CI completo, algumas verificações poderão ser executadas manualmente.
Quando CI estiver estabelecido, checks relevantes deverão fazer parte da proteção da main.

## 11. Hotfix
Correções urgentes continuam seguindo o mesmo fluxo de desenvolvimento.
```text
main
↓
fix/...
↓
Pull Request
↓
Validação
↓
Squash merge
↓
main
↓
Release Please
↓
Release Pull Request
```

Não realizar correções diretamente na `main`.
Um hotfix normalmente resulta em incremento PATCH.
Exemplo:
```text
v1.2.0
↓
fix: correct checkout failure
↓
v1.2.1
```

## 12. Release e deploy

Release e deploy são processos distintos.

**Deploy demonstrativo atual:** qualquer push integrado à `main` aciona `.github/workflows/cd.yml`, que gera a exportação estática e publica no GitHub Pages.

**Release:** o Release Please administra propostas de versão, tags, changelog e GitHub Releases conforme seus próprios critérios.

Portanto, o deploy do storefront demonstrativo não depende da publicação de uma nova GitHub Release.

Esse fluxo poderá mudar quando a Chouga tiver hospedagem e operação comercial definitivas.

## 13. Histórico e maturidade das releases

Em 15/10/2026, a Chouga 2.0 já possui releases de `v0.1.0` até `v0.6.0`.

As versões `0.x.y` representam uma aplicação ainda em evolução. O marco `v1.0.0` deverá corresponder a critérios explícitos de estabilidade e prontidão comercial.

Não criar releases artificiais para cada mudança documental. Continuar utilizando Conventional Commits e revisão humana das Release Pull Requests.

## 14. Regra operacional

A partir da adoção do Release Please:
```text
Issue
↓
Branch
↓
Pull Request com Conventional Commit
↓
Squash merge
↓
main
↓
Release Please
↓
Release Pull Request
↓
aprovação
↓
GitHub Release
```

O versionamento é calculado automaticamente.

A decisão de publicar continua humana.

## 15. Princípio final

O versionamento existe para tornar a evolução do produto compreensível, rastreável e reproduzível.
A automação deve eliminar trabalho mecânico sem retirar controle sobre a publicação.

> Integrar com disciplina, versionar automaticamente e publicar conscientemente.
