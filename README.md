# ⚔ Warband Legacy — Protótipo 0.2.0

**Every soldier has a story.**

Roguelite 3D isométrico de exércitos para navegador e celulares compatíveis. Cada soldado possui identidade, progressão, ferimentos e risco de morte permanente.

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
| Habilidade 1 | 1 | Botão esquerdo de habilidade |
| Habilidade 2 | 2 | Botão direito de habilidade |
| Alternar seguir/defender | Q | Painel de ordens |
| Alterar formação | F | Botão ↻ Formação |
| Pausa | Esc | Ⅱ |

## 🎯 Objetivo

1. Selecione até cinco soldados no quartel e um dos dois comandantes.
2. Entre na expedição e explore o mapa. Os marcadores ficam no minimapa.
3. Recrute soldados, abra baús, descanse, compre melhorias temporárias e derrote patrulhas.
4. Conquiste **três estandartes** para desbloquear a fortaleza.
5. Derrote o **Lorde da Cinza**, conquiste insígnias e escolha até dois novos recrutas para o quartel.
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
