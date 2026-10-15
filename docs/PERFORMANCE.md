# PERFORMANCE · Chouga 2.0

**Situação em 15/10/2026:** não há baseline Lighthouse/Web Vitals nem testes de performance registrados neste repositório para o storefront atual. Este documento define critérios e método, **não** apresenta números inventados.

## 1. Metas iniciais (alvos, não resultados)

| Métrica | Alvo inicial | Contexto |
| --- | --- | --- |
| LCP | <= 2,5 s (75º percentil) | Experiência visual de carregamento |
| INP | <= 200 ms (75º percentil) | Resposta à interação |
| CLS | <= 0,1 (75º percentil) | Estabilidade visual |
| Erros JS | 0 bloqueadores nas jornadas | Confiabilidade |
| Overflow horizontal | 0 nos viewports de teste | Responsividade |

São alvos associados aos Core Web Vitals; requerem dados de campo ou avaliação contextual. Lighthouse sintético é um sinal de diagnóstico, não substitui métricas reais. Não definir metas rígidas de tamanho de bundle antes de medir o artefato.

## 2. Baseline a estabelecer

Páginas: Home, futuro catálogo, detalhe de produto e carrinho. Estado: build de produção, cold/warm load quando relevante, desktop e mobile.

Para cada medição, registrar:

- data, commit/PR e URL de build;
- ferramenta/versão, navegador, dispositivo, viewport, rede e throttling;
- LCP, CLS, INP (se houver dados de campo), TBT e requests relevantes;
- bytes de JS/CSS/imagens e principais gargalos;
- capturas e diagnóstico para justificar mudanças.

**Protocolo comparável:** executar múltiplas medições por cenário; identificar outliers e manter configuração idêntica antes/depois; anotar alterações de conteúdo, cache e CDN.

## 3. Prioridades próprias da loja

1. **Imagens de produto:** dimensões/aspect-ratio reservados; formatos adequados; `srcset`/`sizes` quando aplicáveis; lazy loading apenas abaixo da dobra; LCP não deve ficar atrasado por lazy loading.
2. **Fonts/layout:** evitar layout shift em fontes e galerias; definir fallback coerente.
3. **JavaScript por rota:** Server Components por padrão; enviar JS apenas para variantes/carrinho; evitar bibliotecas pesadas globais.
4. **Interações:** seleção de variante e atualização do carrinho imediatas; não bloquear o main thread.
5. **Rede/catálogo:** reduzir consultas redundantes, lidar com falha/latência, escolher cache adequado ao provedor e ao ambiente.
6. **SEO e performance:** HTML inicial indexável nas rotas estáticas; metadata e imagens apropriadas.

## 4. Restrições do GitHub Pages

No workflow de CD, `GITHUB_PAGES=true` ativa `output: "export"` e desativa otimização de imagens pelo servidor. Portanto:

- otimizar assets antes do commit/deploy ou usar URLs/imagens responsivas previamente otimizadas;
- páginas `[slug]` precisam existir na geração estática e funcionar com `basePath`;
- não depender de backend ou revalidation runtime nessa hospedagem;
- se a atualização do catálogo ocorrer apenas em build, informar a latência de atualização do produto e plano de rebuild.

## 5. Checklist por PR

- [ ] Há baseline antes/depois ou justificativa de por que não se aplica.
- [ ] Recursos críticos não aguardam código não essencial.
- [ ] Imagens possuem espaço reservado e descrição apropriada.
- [ ] O componente interativo fica isolado da estrutura estática quando possível.
- [ ] Não existe import/dependência pesada adicionada sem necessidade.
- [ ] Desktop e mobile foram verificados com condições registradas.
- [ ] Não foram alterados dados de produção para benchmarks.
- [ ] Desempenho de carrinho/variant selector foi observado quando afetado.

## 6. Aprendizados da Jungle Gaming

No Pirate Battle, performance foi investigada por medições, cenários e separação da lógica da renderização. Para a Chouga, adaptamos a **disciplina de diagnóstico**, não a instrumentação de frames: Web Vitals, waterfall de rede, tamanho dos assets, estado de interface e rastreamento de regressões. Não instrumentar sem hipótese ou custo-benefício.

## 7. Links

- [Core Web Vitals](https://web.dev/articles/vitals)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview)
- [Testing](TESTING.md)
- [Accessibility](ACCESSIBILITY.md)
