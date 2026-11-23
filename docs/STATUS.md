# Status real da versão 0.3.0

## Implementado no código

- Menu, quartel e seleção de 2 comandantes com habilidades distintas.
- 6 classes distintas de tropa com modelos low poly procedurais e equipamentos.
- Mapa por seed com árvores, rochas, terreno, pontos de recrutamento, santuários, baús, fogueiras, patrulhas, 2 postos por andar e portais para guardiões em 4 andares.
- Comandante controlável (teclado ou joystick), habilidades e comandos seguir/defender/recuar/formação.
- Tropas individuais com nomes, traços, progressão XP, níveis, promoção, graduações e visual variável.
- Combate autônomo corpo a corpo, projéteis, cura, dano, boss e telegráfico simples.
- Recrutamento durante a expedição, melhoria aleatória entre 12 opções e moedas/suprimentos.
- Derrota, retirada, vitória, relatório final, seleção de até 2 recrutas para guardar e memória dos mortos.
- Melhorias permanentes, recuperação de ferimentos, morte permanente e salvamento local.
- SFX sintéticos originais, interface desktop/mobile, minimapa e opções de qualidade.
- HTML independente, para abrir sem instalar dependências, além do projeto modular.

## Simplificações / pendências conhecidas

- Renderizador escrito em WebGL2 nativo JavaScript, não Three.js/TypeScript; migração recomendada ao Codex.
- Sem exportação Android nativa; pode ser usado no navegador mobile com WebGL2.
- Modelos 3D low poly geométricos remodelados e três animações procedurais (idle/walk/attack) articuladas por pivôs. Ainda sem assets GLB/GLTF, rigging de estúdio ou animação esquelética sofisticada.
- Sem colisões detalhadas de cenário, A* ou steering avançado de multidões; mapas evitam bloqueios sólidos.
- Efeitos e sons básicos; chefe tem ataque telegráfico simplificado.
- Sem equipamento individual inventariado, apenas visual modular por classe/graduação.
- Sem batalhas PvP, login, servidores, publicidade ou transações.
- Balanceamento inicial exploratório; não validado com jogadores reais nem em celular físico.
- Dependência de WebGL2; navegadores sem WebGL2 exibem um erro apropriado.

## Evidência de testes

- Onze testes de domínio via `node --test` passaram; simulação de 100 expedições com estratégia de recrutamento concluiu 100/100 (ainda fácil e curta demais; ver relatório QA).
- Fluxos de menu, quartel e início de partida foram testados no Chromium headless com renderizador gráfico simulado.
- O Chromium disponibilizado na máquina de geração não expõe WebGL/WebGL2, impedindo validar a imagem 3D ou FPS neste ambiente. Não alegar que os gráficos foram visualmente aprovados.

## Próximo marco

Testar o arquivo HTML único no Chrome/Edge do Windows com WebGL2 e começar ajustes conforme bugs/prints reais, mantendo essa versão como ponto de partida para o Codex.

## Alterações 0.3.0

- Zoom inicial mais próximo; câmera segue o comandante com menos atraso.
- Movimentação do comandante e das tropas acelerada, com tropas alcançando a formação após corridas longas.
- Soldados, inimigos e comandante remodelados; silhuetas, equipamento e armadura mais reconhecíveis.
- Poses de respiração, caminhada e ataque, sem arquivos de animação externos.
- Malhas simplificadas à distância e testes automatizados para poses.
- **11 testes passando**, 100 expedições simuladas (100 vitórias; duração média 55,3s); a jogabilidade continua em ajuste.


## v0.3.0 — entregue

- Quatro pisos e recompensa após chefes intermediários.
- Quatro biomas com visuais e paletas de solo diferentes, árvores renovadas e adereços.
- Combate direto com Espaço/ataque e Shift/esquiva.
- Interações legíveis e HUD de progresso por andar.
- Migração de saves anteriores do quartel.
- 14 testes automatizados; validação visual e QA em celular pendentes.
