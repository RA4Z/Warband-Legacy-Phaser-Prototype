# Relatório de QA — Warband Legacy 0.1.0

**Escopo:** o código e a lógica foram produzidos em um ambiente sem acesso ao registro npm e cujo Chromium headless não disponibiliza WebGL/WebGL2.

## Verificações executadas

- Testes de domínio: **9** casos com `node --test` (proceduralidade, XP/promoção, risco de baixa, persistência, fluxo de vitória, habilidades, combate, feridos, recuperação de softlock).
- Gerador de mapas: **100 seeds verificadas** dentro dos testes.
- Fluxo de interface: menu → quartel → início de expedição, via Chromium headless com renderizador mockado. Sem exceções JavaScript.
- Simulação de 100 expedições completas com bot simples que recruta e usa descanso: **100 vitórias / 100 tentativas**, tempo médio **72,3 segundos** para a versão analisada. A simulação demonstra que é possível concluir o ciclo, mas **não valida retenção, diversão ou balanceamento**.
- Simulação inicial sem reforços: derrotas frequentes, demonstrando diferença grande de poder entre 5 e 11 tropas.

## Problemas descobertos e corrigidos

1. Comandante avançava mais rápido que as tropas e era focado pelos inimigos.
2. Formação inicialmente distribuiu combatentes em slots de forma inadequada (arqueiros à frente).
3. Dois grupos próximos podiam aparecer ao mesmo tempo, produzindo picos de dificuldade.
4. Encontros distantes podiam bloquear novos encontros.
5. Feridos da expedição podiam se recuperar automaticamente cedo demais.
6. Ataques de curandeiros podiam impedir o uso prioritário da cura.
7. UI sobreposta capturava toques que deveriam atingir o cenário.

## Limitações de validação

**Não foi possível testar a imagem WebGL2 em execução real.** O ambiente de navegador de QA não oferece contexto WebGL; as imagens de tela da UI são provas apenas do HTML/CSS, não do mundo renderizado. Um teste visual em Chrome/Edge/Android compatível ainda é obrigatório. Também não foram medidos FPS em dispositivo móvel.

**Balanceamento e duração ainda precisam mudar:** 100/100 vitórias com bot recrutador é fácil demais; o ciclo atual é muito mais rápido que a meta de 10–15 minutos. Nenhuma das estimativas de duração de partida do plano original foi validada com humanos.

## Próximas validações

- Abordar primeiro bugs de renderização real, se houver, e de ordenação de malhas 3D.
- Testar 10–20 pessoas sem explicações, observar como compreendem os controles e a exploração.
- Ajustar a dificuldade para manter recrutamento relevante sem tornar obrigatório comprar sempre as mesmas tropas.
- Ajustar a duração típica e reequilibrar taxas de ferimento/morte.
- Testar salvamento após fechar a aba no meio da expedição, incluindo Android real.

## Revisão 0.2.0 — velocidade, câmera, modelos e animação

- **11/11 testes automáticos aprovados** (9 regressões + 2 testes para movimento e modelos animados).
- Validado numericamente: comandante com 7,8 unidades/segundo; velocidade dos soldados entre 5,85 e 6,75 unidades/segundo, mais bônus elástico de reagrupamento.
- A câmera agora parte de zoom 14,8 no desktop / 16,8 em tela estreita e acompanha o comandante com amortecimento independente de FPS; zoom com roda do mouse (11,5 a 28).
- As poses idle, walk e attack foram comparadas por testes de malha: produzem vértices finitos e geometrias distintas. A articulação utiliza pivôs dos ombros e quadris; armas acompanham o braço de ataque.
- Foram adicionados modelos low poly distintos por classe e versão LOD para tropas afastadas. O gerador reduziu os segmentos de esfera e cilindro para limitar custo.
- Repetidas **100 expedições simuladas com bot recrutador: 100 vitórias, média de 55,3 segundos**. A velocidade torna o ritmo ainda mais curto; **a dificuldade/duração seguem pendentes**.

**Limitação importante:** o navegador headless deste ambiente impede abrir páginas locais e não fornece WebGL2, portanto **a aparência final e os FPS não foram validados visualmente**. A primeira execução manual em Chrome/Edge com WebGL2 continua obrigatória, principalmente para confirmar animações e desempenho com muitas tropas.


## Revisão 0.3.0 (23/11/2026)

- Testes automatizados: **14/14 aprovados** após corrigir disputa entre modal de recompensa de andar e modal de vantagem de patrulha.
- Cinco execuções de regressão sucessivas sem falhas.
- `npm run check`: sintaxe dos principais arquivos validada.
- Quatro andares: transições, recompensas, incremento de dificuldade, guardião final e salvamento validados por testes de domínio.
- Ataque básico: alcance, recarga e redução de HP verificados.
- Esquiva: deslocamento, invulnerabilidade e recarga verificados.
- **Não validado**: renderização real WebGL2 e legibilidade no dispositivo do usuário; o Chromium headless deste ambiente não disponibilizou captura visual confiável.
- **Próxima rodada de QA real:** navegação por todos os locais, desempenho GPU (PC/Android), visibilidade dos indicadores, ausência de travamentos em quatro andares consecutivos.


## Adendo 0.4.0 — 2026-11-23
- Testes locais: 17/17 aprovados (`npm test`).
- `npm run check` aprovado.
- Quadro visual do quartel testado em Chromium usando implementação gráfica simulada, sem erros JS.
- Responsividade mobile 390 px sem rolagem horizontal.
- O WebGL2 real não está disponível no navegador de testes; estética do mundo, sombras e FPS precisam de avaliação manual.
- O combo e a esquiva foram testados por ticks da simulação.
