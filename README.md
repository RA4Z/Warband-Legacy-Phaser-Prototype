# ⚔ Warband Legacy — Protótipo 0.3.0

**Every soldier has a story.**

Roguelite 3D isométrico de exércitos para navegador e celulares compatíveis. Cada soldado possui identidade, progressão, ferimentos e risco de morte permanente.

## 🌳 Atualização 0.3.0 — cenário, combate e andares roguelite

- **Quatro andares com progressão**: Bosque de Arven, Floresta Esmeralda, Ermos de Cinza e Altos do Crepúsculo. Cada andar tem dois postos inimigos, um Guardião, reforços inimigos mais fortes e uma escolha de recompensa antes do próximo andar. O chefe final encerra o quarto andar.
- **Cenário redesenhado**: saiu o tabuleiro quadriculado. Entraram terreno contínuo com cores procedurais, caminhos entre locais, gramíneas, flores, rochas, arbustos, árvores mais orgânicas e paletas específicas de cada bioma.
- **Cores nítidas**: shader sem névoa acinzentada à distância, iluminação ambiente equilibrada, maior densidade de pixels no desktop. Em celulares o limite de resolução é menor para preservar FPS.
- **Comandante ativo**: ESPAÇO/botão ATAQUE executa golpe em arco, acerta até três oponentes próximos e mostra trilha de espada e faíscas. SHIFT/botão ESQUIVA avança, concede invulnerabilidade breve e tem recarga. Tropas continuam combatendo automaticamente; habilidades 1/2 permanecem.
- **Feedback**: pontos de interesse próximos mostram nome, comando de interação, marcador no chão e destaque do botão E; impactos exibem partículas e números de dano.
- **HUD**: faixa dos quatro andares, progresso por posto, botões reagrupados e painel de ordens mais discreto.
- **Compatibilidade com saves v0.2**: quartel e veteranos permanecem; uma expedição v0.2 em andamento reinicia no primeiro andar para evitar bloqueios.

### Limitações honestas

Os personagens continuam sendo malhas 3D procedurais originais, não modelos GLB com animação esquelética. As novas animações são simples e o combate, o balanceamento e o desempenho em celulares reais ainda exigem validação manual. O cenário é um ambiente estilizado, não um mapa AAA. O renderizador continua sendo WebGL2 nativo; não é Three.js.

## 🎨 Atualização visual e de movimentação 0.2.0

- Comandante agora corre a **7,8 unidades por segundo** (antes 4,6); as tropas receberam velocidade extra e uma regra de reagrupamento para não ficar para trás.
- **Câmera mais próxima e responsiva**: zoom inicial 14,8 no desktop (antes 24), 16,8 em telas pequenas e controle pela rodinha (entre 11,5 e 28).
- Modelos 3D low poly reconstruídos, com classe reconhecível, peças de armadura, escudos, armas, capacetes e proporções melhores. As unidades distantes usam modelos simplificados para evitar queda brusca de desempenho.
- Animações procedurais **idle** (respiração), **walk** (passos e braços alternados) e **attack** (movimento de braço e arma), sem exigir arquivos externos.
- É uma melhoria artística inicial: os personagens ainda são modelos procedurais e não substituem uma etapa futura de modelagem/rigging profissional.

## ▶ Jogar agora — mais fácil

No Windows, dê dois cliques em **`INICIAR_JOGO.bat`** ou abra o arquivo `Warband_Legacy_JOGAR.html` com **Google Chrome ou Microsoft Edge**. Não precisa de npm, internet, API, conta ou servidor. O arquivo contém HTML, CSS e JavaScript necessários.

Se o navegador bloquear a execução local, use o servidor de desenvolvimento abaixo.

## 🛠 Executar o projeto organizado

Pré-requisito: Node.js 18 ou superior.

```bash
npm run dev
```

Abra **http://localhost:5173** no computador ou o endereço local do computador no celular (mesma rede Wi-Fi e porta liberada). Não é necessário `npm install`: a implementação não usa dependências externas.

```bash
npm test         # testes automatizados do domínio
npm run check    # validações de sintaxe
node tools/build-standalone.mjs  # regenera o HTML único depois de alterações
```

## 🎮 Controles

| Ação | Desktop | Celular |
|---|---|---|
| Movimento | WASD ou setas | Joystick esquerdo |
| Interagir | E | Botão ✧ |
| Ataque do comandante | Espaço | Botão ⚔ |
| Esquiva com invulnerabilidade breve | Shift | Botão ➤ |
| Habilidade 1 | 1 | Botão esquerdo de habilidade |
| Habilidade 2 | 2 | Botão direito de habilidade |
| Alternar seguir/defender | Q | Painel de ordens |
| Alterar formação | F | Botão ↻ Formação |
| Pausa | Esc | Ⅱ |

## 🎯 Objetivo

1. Selecione até cinco soldados no quartel e um dos dois comandantes.
2. Entre na expedição e explore o mapa. Os marcadores ficam no minimapa.
3. Recrute soldados, abra baús, descanse, compre melhorias temporárias e derrote patrulhas.
4. Conquiste **dois estandartes** por andar para abrir o portal.
5. Derrote os **Guardiões**, escolha recompensas entre andares e vença o quarto andar para terminar a jornada.
6. Aprimore instalações, trate feridos e promova veteranos antes da próxima expedição.

Se o comandante morrer, a expedição será perdida. Soldados derrotados podem voltar feridos ou morrer permanentemente. O memorial registra seus nomes.

## 📂 Documentação

- `docs/ESPECIFICACAO_ORIGINAL.md`: prompt mestre original, ainda é a visão de longo prazo.
- `docs/STATUS.md`: funcionalidades entregues e limitações reais.
- `docs/CONTINUAR_COM_CODEX.md`: plano de migração e melhorias ao recuperar limites do Codex.
- `docs/QA_REPORT.md`: o que foi testado, problemas corrigidos e limitações.

## ⚙️ Notas

- Gráficos 3D em **WebGL2 nativo** com geometria procedural sem bibliotecas. Documentada a divergência em relação à stack Three.js/TypeScript desejada.
- O progresso é salvo no `localStorage` do navegador. Arquivos HTML abertos com diferentes URLs podem ter saves separados.
- O jogo ainda não passou por validação visual real no hardware de destino nem por testes de jogabilidade com usuários.
- O código é original e não contém assets protegidos de jogos comerciais.
