# Warband Legacy 0.3.0 — Alterações de jogabilidade e visual

## Entregue

- Quatro pisos roguelite progressivos e biomas com nomes/paletas próprias.
- Recompensa de transição: cura e suprimentos, espólios ou vantagem permanente na run.
- Scaling de HP/dano e número de inimigos em pisos posteriores.
- Dois objetivos e um guardião por piso. Derrotar o guardião 4 encerra a expedição.
- Terreno triangulado contínuo e pigmentação procedural, sem padrão quadrado repetitivo.
- Caminhos orgânicos, nova vegetação decorativa, árvores com troncos e copas, pedras e flores.
- Ajuste do shader para evitar aparência cinzenta durante marcha/câmera.
- Novo ataque básico manual do comandante, golpe em área, traço e impactos.
- Esquiva do comandante com deslocamento curto, recarga e invulnerabilidade de 0,45 s.
- HUD de progresso de andares, novas ações e destaque de interações.
- Migração segura da expedição v0.2 ativa (preservando quartel/roster).

## QA

- `npm run check` verifica os módulos principais.
- `npm test` executa testes de mundo, economia, progresso, quatro pisos, golpe e esquiva.
- `node tools/build-standalone.mjs` produz HTML portátil.
- Renderização WebGL2 **não validada visualmente** neste ambiente: conferir no Chrome/Edge com GPU, principalmente texturas procedurais, estética, quedas de FPS e interface mobile.
- Simulações automatizadas verificam coerência da lógica; não substituem playtest de 20–40 minutos.

## Próximas etapas sugeridas

1. Visual: modelos GLB realmente estilizados, rigging e biblioteca de animações.
2. Combate: hit-stop, efeitos de antecipação, sons sincronizados e feedback de acerto mais refinado.
3. Conteúdo: elites, eventos narrativos, chefes exclusivos de cada piso e rotas alternativas.
4. UX: tutorial interativo de controles e objetivos; perfis gráficos automáticos por GPU.
