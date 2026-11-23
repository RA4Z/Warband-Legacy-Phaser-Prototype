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
