# Processo de Release — Chouga 2.0

## 1. Objetivo

Este documento define como versões da Chouga 2.0 são identificadas, validadas e publicadas.

O processo deve permanecer simples, rastreável e proporcional à maturidade do projeto.

Release e deploy são conceitos diferentes.

Uma release representa uma versão identificável do software.

O deploy representa a disponibilização dessa versão em um ambiente.

A estratégia de hospedagem e deploy será definida separadamente.

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
