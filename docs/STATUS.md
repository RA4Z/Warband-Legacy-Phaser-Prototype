# Status real da versão 0.1.0

## Implementado no código

- Menu, quartel e seleção de 2 comandantes com habilidades distintas.
- 6 classes distintas de tropa com modelos low poly procedurais e equipamentos.
- Mapa por seed com árvores, rochas, terreno, pontos de recrutamento, santuários, baús, fogueiras, patrulhas, 3 estandartes e fortaleza.
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
- Modelos 3D geométricos básicos e animações procedurais simples; sem assets GLB/GLTF nem animações sofisticadas.
- Sem colisões detalhadas de cenário, A* ou steering avançado de multidões; mapas evitam bloqueios sólidos.
- Efeitos e sons básicos; chefe tem ataque telegráfico simplificado.
- Sem equipamento individual inventariado, apenas visual modular por classe/graduação.
- Sem batalhas PvP, login, servidores, publicidade ou transações.
- Balanceamento inicial exploratório; não validado com jogadores reais nem em celular físico.
- Dependência de WebGL2; navegadores sem WebGL2 exibem um erro apropriado.

## Evidência de testes

- Nove testes de domínio via `node --test` passaram; simulação de 100 expedições com estratégia de recrutamento concluiu 100/100 (ainda fácil e curta demais; ver relatório QA).
- Fluxos de menu, quartel e início de partida foram testados no Chromium headless com renderizador gráfico simulado.
- O Chromium disponibilizado na máquina de geração não expõe WebGL/WebGL2, impedindo validar a imagem 3D ou FPS neste ambiente. Não alegar que os gráficos foram visualmente aprovados.

## Próximo marco

Testar o arquivo HTML único no Chrome/Edge do Windows com WebGL2 e começar ajustes conforme bugs/prints reais, mantendo essa versão como ponto de partida para o Codex.
