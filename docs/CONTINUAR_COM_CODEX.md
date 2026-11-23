# Continuação no Codex — Warband Legacy

Este protótipo foi desenvolvido dentro do ChatGPT sem acesso à instalação de pacotes npm. Por isso o jogo usa **WebGL2 nativo e JavaScript modular**, não Three.js + TypeScript do documento de especificações original. A implementação da mecânica é útil como base funcional; um passo de engenharia prioritário pode migrar o renderizador para Three.js e TypeScript strict **sem reescrever as regras de domínio**.

## Prioridades recomendadas para o Codex

1. Rodar `npm test` e `npm run dev`; validar visualmente em Chrome/Edge com WebGL2 e testar a versão única `Warband_Legacy_JOGAR.html`.
2. Auditar e corrigir eventuais bugs de movimentação, IA, colisões, performance e comportamento em tela de celular. Verificar 30 FPS em Android real.
3. Reconciliar o escopo com `docs/ESPECIFICACAO_ORIGINAL.md`. Algumas partes estão simplificadas, listadas em `docs/STATUS.md`.
4. Substituir a implementação WebGL2 nativa por Three.js com malhas compartilhadas/instancing; migrar gradualmente para TypeScript tipado.
5. Criar testes de navegador WebGL reais e testes de fluxo Android. Não considerar screenshots sem renderização de WebGL prova visual.
6. Polir o layout mobile, VFX, SFX, animações e balanceamento de encontros; telegráficos de chefe com aviso legível.
7. Preparar empacotamento Capacitor e build assinado Android, sem dependência de backend.
8. Internacionalizar textos PT-BR/EN, acrescentar analytics somente após consentimento e definição do produto; ainda sem publicidade/monetização integrada.

## Estrutura

- `src/game/simulation.js`: loop de simulação, IA, combate, eventos, resultados
- `src/game/data.js`: balanceamento e definições
- `src/game/units.js`: entidades persistentes, XP, promoção, baixa
- `src/game/world.js`: gerador de mapa determinístico
- `src/game/persistence.js`: localStorage versionado
- `src/render/geometry.js`: fábricas 3D low poly em código
- `src/render/renderer.js`: renderizador WebGL2
- `src/ui/interface.js`, `src/ui/styles.css`: telas, HUD, joystick
- `src/audio/sound.js`: Web Audio original
- `tests/game.test.mjs`: regressão via Node.js
- `tools/build-standalone.mjs`: gera HTML único e offline

## Notas

- O nome internacional de trabalho é **Warband Legacy**, sujeito a pesquisa de marcas e lojas.
- A versão offline não necessita de API, login ou conta.
- Não é uma versão comercial pronta; é um primeiro protótipo funcional para testes e evolução.


### Próximo passo depois da 0.4.0
- Testar WebGL2 no Chrome/Edge com 30/60 FPS e investigar o relato de borrão em movimento com profiler e gravação.
- Priorizar câmera, pós-processamento e shaders leves, sem sacrificar a legibilidade das tropas.
- Migrar progressivamente para assets GLB/GLTF com rigging e animações retargetáveis caso o estilo final peça modelos mais sofisticados.
- Testar responsividade e telegraph de ataques em tela touch.
- Evitar transformar o projeto em MMO ou expandir o escopo antes de validar retenção e combate.
