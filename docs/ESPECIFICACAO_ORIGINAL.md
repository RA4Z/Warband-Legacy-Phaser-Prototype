> **ATUALIZAÇÃO DO PROJETO:** o nome escolhido posteriormente é **Warband Legacy**; todas as referências a “Legião Errante” abaixo representam o mesmo jogo, não outro projeto. Este documento guarda a especificação original para o Codex.

# PROMPT MESTRE PARA CODEX — LEGIÃO ERRANTE
## Protótipo mobile completo e jogável — estratégia isométrica 3D low poly + exército + roguelite

> **Cole todo este documento no Codex, preferencialmente em um repositório novo e vazio.**
> **Nome de trabalho:** Legião Errante (provisório; todos os nomes, artes, textos e sons devem ser originais).
> **Objetivo:** construir de verdade um **vertical slice completo, testável e jogável**. Não entregar somente arquitetura, mockups, plano, wireframes, telas estáticas, documentação, placeholders sem funcionamento ou um projeto que apenas compila.

---

# 0. PAPEL, MODO DE TRABALHO E REGRA PRINCIPAL

Você (Codex) atuará como **game director técnico, arquiteto, programador de gameplay, designer de sistemas, artista técnico 3D procedural, implementador de UI/UX e QA**. Execute a implementação efetiva de ponta a ponta no workspace disponível.

**Autonomia:** examine primeiro o estado do diretório, as ferramentas instaladas, as instruções do repositório (`AGENTS.md`, se houver), o sistema operacional e os comandos de build/teste. Se for repositório novo, crie o projeto integralmente. Se houver código preexistente que claramente pertença a este jogo, preserve e evolua; **não altere repositórios de outros jogos nem use código ou recursos de projetos distintos sem autorização**. Tome decisões técnicas locais razoáveis sem solicitar aprovação a cada etapa. Documente decisões em `docs/DECISIONS.md`.

**Prioridade absoluta:** o jogador tem de conseguir abrir o jogo, comandar um herói e seu exército, explorar, recrutar, lutar, sofrer baixas ou ferimentos, desenvolver soldados individualmente, enfrentar o chefe, terminar uma expedição, retornar ao quartel e iniciar outra expedição com progresso persistido. Tudo realmente conectado.

Trabalhe por etapas executáveis e mantenha o projeto compilável entre elas. Após cada etapa, rode os testes correspondentes. Se não houver suporte local para alguma validação (por exemplo Android SDK ou automação de navegador), **não invente que ela foi executada**: registre a limitação e realize as alternativas possíveis. Não invente funcionalidades prontas; não masque defeitos com botões decorativos ou valores falsos.

**Não interrompa na fase de planejamento.** Planejar é parte do trabalho; implementar, testar e corrigir é a entrega.

---

# 1. VISÃO DO JOGO

## 1.1 Fantasia principal

Jogo single-player mobile-first, **3D low poly visto por câmera isométrica**, no qual o jogador controla **um comandante** que se movimenta livremente por um mapa, liderando uma formação de soldados autônomos. Durante cada expedição, encontra patrulhas e acampamentos inimigos, liberta prisioneiros, recruta tropas, encontra recursos e melhorias, escolhe riscos e enfrenta exércitos maiores.

Os soldados têm identidade própria: nome, classe, nível, XP, promoção, atributos, estatísticas, histórico de batalhas, condição física e morte permanente. Um arqueiro veterano deve importar mais ao jogador que uma unidade descartável anônima. Depois dos encontros, uma unidade derrubada pode **morrer de verdade** ou ficar **ferida**, exigindo recuperação. O progresso individual dos sobreviventes deve conectar várias expedições.

A sensação pretendida: **começar com uma pequena companhia de 4–5 guerreiros e potencialmente terminar com um exército de 20–40 unidades**, com batalhas que parecem maiores, mas continuam legíveis e divertidas na tela de um telefone.

## 1.2 Gênero e diferenciação

- Roguelite, não roguelike puro: mapa, encontros, reforços e vantagens variam por expedição; quartel, desbloqueios e veteranos podem persistir.
- Mistura de exploração direta, liderança de tropa, auto-combat com intervenção tática e progressão de soldados.
- Controles de uma mão preferencialmente possíveis para deslocamento; as habilidades ficam do lado direito.
- Partidas-alvo de **10–15 minutos**, configuráveis via dados.
- **Sem multiplayer, PvP, backend, gacha, ads, compras ou login** no protótipo. Offline primeiro.

## 1.3 Plataforma

- **Primeira execução:** navegador desktop e móvel, utilizando WebGL.
- **Prioridade de UX:** Android em modo paisagem. Em retrato o app deve permanecer utilizável ou mostrar uma sugestão elegante de girar a tela sem travamento/erro.
- Preparar integração com **Capacitor** para empacotamento Android posteriormente. Se o ambiente permitir, configurar e testar `android`/projeto nativo; caso não permita, entregar web mobile funcional e comandos documentados, sem alegar APK gerado.
- Nenhum recurso de execução indispensável deve depender de rede ou CDN.

---

# 2. STACK E ARQUITETURA PROPOSTAS

Use, salvo impedimento comprovado e documentado:

- **TypeScript strict** + **Vite**.
- **Three.js** para renderização 3D, iluminação, câmera ortográfica, Raycaster, geometria procedural e animação hierárquica simples.
- **HTML/CSS responsivo** para telas, menus, HUD e controles touch, sem UI framework pesado desnecessário.
- **Vitest** para regras de domínio e simulação; **Playwright** para smoke/E2E de navegador, caso instalável.
- **Web Audio API** para efeitos sonoros sintéticos originais e leves; respeitar bloqueio de áudio antes da primeira interação.
- **IndexedDB** ou localStorage com versão e validação para salvar progresso; preferir IndexedDB se houver razão técnica, mas manter implementação robusta, simples, recuperável e offline.
- **Capacitor** apenas como ponte futura para Android; não permitir que atrapalhe a versão web.
- Evitar motores de física pesados. Navegação e colisão podem ser resolvidas com grade 2D + steering no plano XZ, representadas em 3D.

**Por que Three.js?** Este projeto exige mundo tridimensional e modelos modulares com vista fixa; não use Phaser para fingir tridimensionalidade em sprites. A renderização é 3D real e a simulação pode ser essencialmente 2D no plano do chão.

### Estrutura de referência

```text
src/
  app/               bootstrap, estados de tela, ciclo de vida
  core/              tipos, RNG determinístico, tempo, eventos, utilitários
  data/              definições e tabelas de balanceamento
  domain/            soldado, comandante, progresso, economia, salvamento
  simulation/        mundo, movimento, formações, IA, combate, encontros
  rendering/         renderer, câmera, modelos low poly, VFX, animações
  generation/        geração de mapa e distribuição validada de POIs
  ui/                HUD, quartel, painéis, controles touch, resultados
  audio/             sons sintetizados e gerenciamento
  persistence/       storage, validação, migração, autosave
  debug/             ferramentas de teste/desenvolvimento
  styles/
tests/
  unit/
  integration/
  e2e/
docs/
public/
```

Não é exigida a estrutura literal acima se outra organização for nitidamente mais simples, mas **separação entre regras, simulação, renderização e interface é obrigatória**. Não colocar todo o jogo em um arquivo gigante.

### Regras de engenharia

1. Separar `GameState` (fonte da verdade) de objetos Three.js. A renderização observa o estado; modelos 3D não definem regra de combate.
2. Usar IDs estáveis para comandante, soldados, inimigos, expedições, itens e eventos.
3. Estado e RNG do combate isolados para teste determinístico. Evitar `Math.random()` dentro da simulação; usar PRNG semeado.
4. Simulação com passo fixo (por exemplo 30 ticks/s), renderização interpolada quando apropriado; `deltaTime` com clamp.
5. Preferir tabelas declarativas de tropas, atributos, classes, equipamentos, vantagens, inimigos e progressão a constantes espalhadas.
6. Toda transição crítica (fim do encontro, ferimento, morte, salvamento, início/fim da run) deve ser **idempotente** ou protegida contra processamento duplo.
7. Sem bibliotecas desnecessárias; código legível, tipado, comentando apenas trechos não triviais.
8. Todos os textos visíveis da primeira versão em **português brasileiro**, com camada centralizada para facilitar futura tradução.

---

# 3. DIREÇÃO VISUAL E MODELOS 3D — IMPLEMENTAÇÃO OBRIGATÓRIA

## 3.1 Estilo

Medieval/fantasia **low poly estilizado, cartunesco discreto, colorido e legível**, câmera isométrica ortográfica, sombras suaves, silhuetas marcantes, proporções levemente caricatas, sem visual realista e sem pixel art. O resultado deve parecer um jogo acabado em miniatura, não um teste com caixas sem personalidade.

**Paleta sugerida:** campos verde-oliva, estradas terrosas, rochas cinza quentes, casas de madeira; aliados com marcas azuis/verde-azuladas; inimigos com marcas vinho/vermelho; efeitos curativos claros e habilidades douradas/azuis. Diferenciar aliados/inimigos também por forma, emblema e contorno/indicador, não apenas pela cor.

## 3.2 Gerar os modelos de verdade sem depender de IA de imagens

Criar uma **fábrica de modelos low poly procedural em código**, com `Group`, malhas primitivas, compartilhamento de geometrias e materiais e componentes visuais reutilizáveis. Não entregar placeholder `BoxGeometry` simples como personagem final.

**Anatomia básica modular de humanoide:**
- cabeça/rosto simplificado;
- tronco/corpo;
- braços esquerdo/direito ligados a pivôs independentes;
- pernas esquerda/direita ligadas a pivôs;
- mãos e pés simplificados;
- acessórios equipáveis ancorados no corpo (capacete, ombreiras, peito, capa, escudo, arma, aljava etc.);
- duas proporções de corpo/cabeça opcionais e variantes de tonalidade/rosto, sem impacto de atributos.

**Modelos de classes distintos** por silhueta e equipamento:
1. **Espadachim:** espada curta, escudo pequeno ou sem escudo; meio termo.
2. **Guardião:** escudo grande e armadura pesada; linha de frente.
3. **Lanceiro:** lança longa e proteção média; alcance corpo a corpo superior.
4. **Arqueiro:** arco, aljava, postura de disparo e projétil.
5. **Místico:** cajado, túnica, ataque mágico com projétil/efeito.
6. **Curandeiro:** cajado/símbolo de cura, roupa clara, partículas de cura.

**Comandantes iniciais:**
- **Capitão de Ferro:** espada e capa, habilidade de brado que aumenta ataque/defesa próximos, e investida curta com recarga.
- **Estrategista do Vale:** lança ou bastão de comando, habilidade de reagrupamento/escudo temporário e ordem de saraivada que fortalece arqueiros ou causa dano em área indicado.

**Elementos do mundo:** árvores variadas, arbustos, pedras, trilhas, ruínas, torres, paliçadas, tendas, pequenos fortes, bandeiras, baús, santuários, brasas/fogueiras, ponte ou arco decorativo se couber. Tudo com geometria low poly reutilizável e variação por semente.

**Variações de equipamentos por graduação** com visual realmente alterado: capacete, ombreira, peitoral, detalhes de escudo/arma, cores e emblema; sem necessidade de seis modelos completamente novos por classe.

## 3.3 Animação procedural obrigatória

Criar animações legíveis por transformações de pivôs:
- idle com respiração sutil;
- caminhada/corrida com braços e pernas alternados;
- ataque corpo a corpo com antecipação, golpe e recuperação;
- disparo de arco;
- conjuração e cura;
- reação ao dano;
- queda ao ser derrubado;
- pequena celebração ao vencer;
- indicadores de seleção e pequenos VFX com geometria/partículas simples.

É aceitável não usar arquivos `.glb` e armatures complexas no MVP: **malhas procedurais hierárquicas são modelos 3D reais** e podem ser animadas por código. A arquitetura deve permitir substituir por GLB/GLTF posteriormente sem reescrever o domínio.

## 3.4 Câmera e clareza

- Câmera **ortográfica em ângulo isométrico aproximado** (azimute ~45°, elevação ~45–55°) seguindo suavemente o comandante, sem giros involuntários.
- Zoom limitado (mouse wheel/pinça, se viável). Evitar cortes e oclusão por árvores; objetos podem tornar-se semitransparentes quando taparem o herói.
- Indicador claro de aliados, inimigos, comandante, alvos, unidades derrubadas, poços de vida críticos.
- HP individual acima das unidades **somente quando necessário** (em combate, selecionadas, feridas ou com HP baixo), para não poluir batalha com 60 barras.
- Recursos visuais leves para telefones de entrada: compartilhamento de geometrias/material, `InstancedMesh` prioritariamente para vegetação/objetos estáticos, sombras limitadas, distância de renderização controlada, pixel ratio configurável, partículas contidas.

---

# 4. LOOP COMPLETO DO JOGO

## 4.1 Fluxo de telas

**Tela inicial** → **Quartel** → **Escolher comandante e tropa inicial** → **Iniciar expedição** → **Explorar e combater** → **Resultado** (vitória, retirada ou derrota) → **Aplicar perdas e recompensas** → **Quartel** → nova expedição.

O botão **Continuar expedição** deve restaurar o jogo após fechar/recarregar a aba, sempre que houver salvamento válido. Início limpo e reinício também devem funcionar.

## 4.2 Objetivo de uma expedição

Mapa de **um único bioma** procedural, aproximadamente 100–140 unidades de lado, com caminhos e pontos de interesse claros. Três posições hostis especiais guardam **três estandartes/sigilos** (ou equivalente); ao conquistar os três, libera-se a fortaleza final com um **chefe comandante inimigo**.

A expedição termina ao:
- vencer o chefe (vitória);
- escolher **Retirar-se** em uma zona segura apropriada (saída antecipada, com recompensa reduzida);
- comandante cair e a companhia ser derrotada (derrota).

Definir textos claros para os objetivos e um indicador de progresso `0/3 estandartes`.

## 4.3 Conteúdo de mapa mínimo

Garantir por seed válida e verificável:
- ponto seguro de início e eventual extração;
- 3 acampamentos fortes com estandartes;
- 4–6 encontros menores de patrulha;
- 2–3 pontos de recrutamento/libertação de prisioneiros;
- 2 acampamentos seguros de cura/descanso;
- 2 baús de recursos;
- 1 santuário de melhoria aleatória;
- 1 fortaleza final;
- obstáculos ambientais não bloqueantes com colisão simples.

O gerador não pode criar mapas impossíveis. Use geração baseada em seed + checagem de acessibilidade por BFS/A* na grade + fallback/regeneração. A posição dos pontos deve variar entre expedições sem sacrificar legibilidade.

## 4.4 Interações

Ao aproximar-se de um ponto de interesse, mostrar contextualização, distância e ação `Interagir`; no desktop `E`, mobile botão de contexto. Capturar baú deve realmente conceder recurso, resgatar prisioneiros deve realmente oferecer recrutamento, descansar deve realmente aplicar cura e consumir recursos quando apropriado, santuário deve realmente abrir 3 escolhas de vantagem.

O usuário nunca deve ficar sem saber o que fazer: guia inicial curto, marcadores e minimapa simples, com direção do próximo objetivo.

---

# 5. CONTROLE, FORMAÇÕES E ORDENS

## 5.1 Controles desktop

- `WASD` e/ou setas: comandante move-se pelo plano do mapa com velocidade normalizada em diagonais.
- Mouse: clicar em inimigo ou unidade para selecionar inspecionar/definir alvo prioritário (não exigir microgerenciamento).
- `1`, `2`: habilidades do comandante; `E`: interagir; `Space`: alternar/acionar ordem contextual se fizer sentido; `Esc`: pausar/voltar.
- Botões explícitos para `Seguir`, `Defender posição`, `Focar alvo` e `Recuar/Reagrupar` no HUD; teclas de atalho opcionais.

## 5.2 Controles mobile

- **Joystick virtual** com zona de toque clara no canto inferior esquerdo; deve funcionar com multitouch e não interferir no clique das habilidades.
- Lado direito: **dois botões de habilidade**, botão de interação e botão de comando tático.
- Toque em soldado: mostrar mini cartão e opção `Inspecionar`; toque em inimigo: priorizá-lo quando ao alcance/visível.
- Botões com tamanho confortável (alvo touch ~44–48 CSS px ou mais), safe areas e escala responsiva.
- UI deve evitar que o dedo esconda completamente a batalha.

## 5.3 Comportamento da tropa

- Soldados seguem o comandante e mantêm **slots de formação estáveis** sem empilhar exatamente no mesmo ponto.
- Preferência de posição: guardiões/lanceiros na frente, espadachins no meio, arqueiros/místicos/curandeiros atrás.
- Interpolação suave, steering local, separação entre unidades, evitar oscilações e teletransporte perceptível.
- Ao encontrar inimigos, unidades escolhem alvos conforme classe: guardiões interceptam, arqueiros buscam distância, curandeiros priorizam aliados com menos HP, etc.
- Ordem `Defender` segura a posição; `Seguir` retoma a formação; `Focar` atribui prioridade ao grupo; `Reagrupar` interrompe perseguição excessiva e retorna próximo ao comandante.
- Se unidade ficar muito distante ou presa, usar recuperação controlada (repath e, somente em última instância, reposicionamento fora da câmera). Nunca teleportar em frente ao jogador.

## 5.4 Limites e desempenho

Limitar tropas do jogador a **40 soldados ativos**, além do comandante; inimigos simultâneos na cena preferencialmente limitados a ~40 (ou um limite dinâmico equivalente). Não simular patrulhas distantes com IA pesada a cada quadro. Definir limites configuráveis e desacelerar spawn/visual antes de prejudicar estabilidade.

---

# 6. COMBATE TÁTICO AUTOMÁTICO DE VERDADE

## 6.1 Regras básicas

- Cada entidade de combate tem atributos: HP máximo/atual, ataque, defesa, alcance, velocidade, intervalo de ataque, alvo, estado, equipe, buffs/debuffs.
- Unidades identificam inimigos em raio limitado, avaliam classe/distância/prioridade, aproximam-se quando necessário e atacam com cooldown real.
- Ataque corpo a corpo exige alcance; arqueiro/mago lança projétil que pode alcançar alvo com trajetória visível (simplificação de acerto é aceitável, mas evitar dano instantâneo antes de parecer que o projétil acertou).
- Curandeiro usa cura periódica com limite/cooldown, não cura inimigos nem ressuscita permanentemente mortos.
- Combate com variação leve e **determinística por seed**, evitando resultados absurdamente aleatórios.
- Evitar `NaN`, HP negativo persistente, múltiplas mortes para a mesma unidade, ataques de mortos, duplo XP e recompensas duplicadas.

**Modelo inicial ajustável:**

```text
Dano bruto = ataque * multiplicadorDeHabilidade * variacaoSeed(0.90 ... 1.10)
Dano final = max(1, dano bruto * 100 / (100 + defesaEfetiva))
```

Usar multiplicadores de classe e vantagem de formação somente se forem claramente representados na UI. Números são proposta inicial e devem ser ajustados após simulações.

## 6.2 Classes jogáveis — parâmetros iniciais para balanceamento

| Classe | HP | ATQ | DEF | Alcance | Intervalo | Papel |
|---|---:|---:|---:|---:|---:|---|
| Espadachim | 100 | 15 | 10 | 1.6 | 1.1 s | equilibrado |
| Guardião | 165 | 9 | 24 | 1.5 | 1.4 s | tanque/interceptação |
| Lanceiro | 110 | 14 | 11 | 2.5 | 1.3 s | linha de frente e alcance |
| Arqueiro | 72 | 19 | 4 | 11 | 1.7 s | dano à distância |
| Místico | 68 | 24 | 3 | 9 | 2.2 s | magia/área leve |
| Curandeiro | 85 | 5 | 6 | 9 (cura) | 2.6 s | suporte; cura 18 HP em aliado |

As estatísticas acima são **valores-base sugeridos**, declarados em `src/data`, não valores imutáveis. Proteger o equilíbrio: arqueiros morrem facilmente se expostos; tanques protegem, curandeiros aliviam mas não tornam tropas invencíveis.

## 6.3 Inimigos

Criar pelo menos quatro arquétipos reutilizáveis com variações:
- saqueador espadachim;
- bruto defensor;
- arqueiro bandido;
- xamã/mago adversário.

Tipos de encontro: patrulha, emboscada simples com aviso, campo militar e elite de estandarte.

**Chefe:** comandante da fortaleza, acompanhado por guardas e arqueiros. Deve ter HP destacado, barra de chefe, telegráfo visível de golpe especial em área (1–1,5 s antes) e fase de pressão quando com HP baixo. A vitória exige derrotá-lo, não apenas chegar ao local.

## 6.4 Feedback de batalha

Som de golpe, flashes discretos, indicador de crítico opcional, números de dano com agrupamento/limite, projéteis, partículas leves, animação de morte, banner de vitória do encontro e painel pós-batalha. O jogador deve conseguir entender **por que ganhou, perdeu, teve feridos ou mortes**.

---

# 7. SISTEMA DE SOLDADOS INDIVIDUAIS — O CORAÇÃO DO PROTÓTIPO

## 7.1 Soldado é uma entidade persistente, não apenas um contador

Cada soldado precisa armazenar, no mínimo:

```ts
type SoldierId = string;
type SoldierClass = 'swordsman' | 'guardian' | 'spearman' | 'archer' | 'mystic' | 'healer';
type SoldierCondition = 'healthy' | 'wounded' | 'downed' | 'dead';
type SoldierGrade = 'recruit' | 'veteran' | 'elite' | 'legendary';

interface Soldier {
  id: SoldierId;
  name: string;
  classId: SoldierClass;
  level: number;
  xp: number;
  grade: SoldierGrade;
  condition: SoldierCondition;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  attackRange: number;
  attackCooldown: number;
  traitId?: string;
  woundSeverity?: 1 | 2 | 3;
  recoveryRunsRemaining?: number;
  appearanceSeed: number;
  battles: number;
  kills: number;
  recruitmentRunId: string;
  isPersistentVeteran: boolean;
}
```

A estrutura concreta pode variar, mas **não reduzir soldados a quantidade por classe**. IDs nunca devem se repetir, e mortes precisam continuar registradas em um memorial/histórico, ainda que o soldado saia da formação ativa.

## 7.2 Nome, aparência e personalidade leve

Gerar nomes originais a partir de listas combináveis, aparência levemente variada pela semente e **um traço simples** opcional: `Resistente` (+HP), `Ágil` (+velocidade), `Preciso` (+ataque de distância) ou `Prudente` (+chance de sobreviver como ferido). Não usar dezenas de traços no MVP.

## 7.3 XP, níveis e graduação

- Cada soldado sobrevive, luta ou participa de vitória e recebe XP individual; curandeiros ganham XP também por cura. Não dar todo o XP apenas para quem finalizou inimigos.
- Níveis **1–10**. Ganho de atributos suave e previsível por nível, com diferenças por classe.
- Graduação: **Recruta → Veterano → Elite → Lendário**.
- Requisitos ilustrativos: Veterano no nível ≥3, Elite ≥6, Lendário ≥9, mais pequeno custo de recursos e ação de promoção no quartel/campamento apropriado.
- Promoção melhora atributos e, **obrigatoriamente**, muda aparência modular (capacete/armadura/escudo/emblemas) de maneira visível.
- Exibir barra de XP, classe, nome, graduação, vitórias, baixas e equipamento visual no painel de soldado.
- A experiência não deve regredir entre expedições para soldados que continuarem vivos.

## 7.4 Queda, ferimento e morte permanente

- Ao chegar a 0 HP **durante o combate**, soldado passa a `downed` (derrubado, não ataca) e a unidade visual cai no chão.
- Ao encerrar aquele encontro, cada derrubado recebe **uma única resolução de baixa** gerada por RNG da expedição:
  - **65%** `wounded` (ferido, indisponível ou com debuff relevante até recuperação);
  - **35%** `dead` (morto permanentemente, removido do exército e registrado no memorial).
- Esses percentuais são **parâmetros de balanceamento iniciais**, e podem receber modificadores explícitos por traço/nível da enfermaria (sem ultrapassar limites seguros). Nunca sortear a baixa duas vezes no mesmo combate, após reload ou após clicar repetidamente.
- Ao menos um tipo de ferimento com gravidade e penalidade funcional. Exemplo: -20% HP máximo e -15% velocidade durante recuperação; ferimento grave impede participar da próxima expedição. Explicar o efeito na interface.
- Em acampamento seguro, disponibilizar ação **Tratar ferido** consumindo suprimentos ou curativo. Em quartel, enfermaria permite recuperação entre expedições e/ou pagando recursos. Não curar gratuitamente todo o exército após qualquer encontro.
- Morte é permanente **inclusive para veteranos carregados de expedições anteriores**. O comandante principal pode ser salvo por convenção de gameplay e causar derrota da run em vez de morte permanente, para evitar bloquear a conta.
- Derrota geral deve resolver as baixas de forma definida, sem duplicar recompensas nem tornar veteranos magicamente imortais.

## 7.5 Registro histórico

Tela `Memorial` com nome, classe, grau, nível, número de batalhas, mortes/kills e expedição em que tombou. Recrutas e veteranos são indivíduos.

---

# 8. RECRUTAMENTO, EXÉRCITO E CRESCIMENTO

## 8.1 Começo de jogo

Na primeira abertura, gerar 1 comandante disponível e um **pequeno elenco inicial** de, por exemplo, 6 soldados Recrutas no quartel. Permitir seleção de até **5 soldados iniciais** para a primeira expedição (com pelo menos uma unidade de frente e uma de distância, para ser divertida). O segundo comandante deve estar disponível para teste ou desbloqueável por meta-progresso curto e transparente.

## 8.2 Durante a expedição

Recrutamento por:
- libertação de prisioneiros;
- mercenários em acampamentos, pagando moedas;
- recompensas de eventos;
- conversão/recrutamento de sobreviventes inimigos em um evento especial, não a cada abate.

O jogador escolhe unidades de uma lista curta (`+2 Lanceiros`, `+1 Curandeiro`, por exemplo) em vez de sempre receber soldados aleatórios. **Soldado criado precisa nascer como entidade individual**, aparecer fisicamente no mapa e entrar na formação.

Limite inicial: 40 soldados durante a run. Ao atingir o limite, oferecer substituição/dispensa ou impedir recrutamento com feedback claro; jamais ultrapassar silenciosamente.

## 8.3 Entre runs — preservar o significado dos veteranos sem quebrar roguelite

No **Quartel**, manter um elenco persistente de sobreviventes (capacidade inicial 12, expansível). Antes da run, o jogador seleciona até 5 **soldados saudáveis** como núcleo da companhia. Ao longo da run, novos recrutas entram temporariamente na expedição, ganham XP e podem morrer.

**Retorno ao quartel:** veteranos do núcleo que sobreviverem voltam automaticamente; entre os recrutas novos sobreviventes, permitir escolher até **2 para integrar permanentemente o quartel**, respeitando capacidade. Demais recrutas são desmobilizados ao fim da expedição — mostrar texto de lore explicando. Na derrota, permitir retornar apenas sobreviventes conforme regra explícita e consistente; não ressuscitar mortos.

Isso oferece o ciclo ideal: exército cresce durante uma partida, mas o jogador se apega a um pequeno grupo persistente. Evita que 40 soldados de uma vitória tornem as expedições seguintes triviais.

## 8.4 Formações e composição

Exibir contador por classe, tamanho total, poder estimado sem falsa precisão e número de soldados feridos. Permitir mudança simples de formação entre `Equilibrada`, `Defensiva` e `Ofensiva` (pelo menos duas plenamente funcionais se três comprometerem o MVP); alterar slots e/ou pequenas prioridades IA, não apenas o nome no UI.

---

# 9. PROGRESSÃO ROGUELITE E ECONOMIA

## 9.1 Dois níveis de progresso

**Progresso da expedição (reinicia):** moedas comuns, reforços adicionais, 3–6 vantagens aleatórias de run, estandartes capturados, baús, consumíveis e tropas temporárias não retidas ao fim.

**Meta-progresso (persiste):** quartel, soldados sobreviventes retidos, promoções, recursos permanentes, desbloqueios de comandante, melhorias de enfermaria/capacidade, memorial e estatísticas globais.

Separar explicitamente ambos no modelo e na tela, evitando inconsistências após reload.

## 9.2 Vantagens de expedição

Implementar **ao menos 12 melhorias diferentes, funcionais**, com nomes/descrições em PT-BR e efeitos realmente aplicados. Exemplos:

1. Escudos reforçados: +15% defesa de guardiões.
2. Treino de arco: +12% dano de arqueiros.
3. Marcha rápida: +8% velocidade do grupo.
4. Cura de campanha: +15% cura dos curandeiros.
5. Disciplina: +10% HP do exército.
6. Investida coordenada: curto bônus de dano ao entrar em combate.
7. Lanças longas: +15% alcance de lanceiros.
8. Misticismo: +15% dano dos místicos.
9. Fúria da companhia: bônus moderado com HP baixo.
10. Saqueadores: +20% moedas de encontros.
11. Intendência: +1 suprimento por baú, dentro de limite.
12. Veterania acelerada: +20% XP individual recebido na expedição.

Oferecer **escolha de 1 entre 3 cartas**, com descrições quantitativas honestas, em santuários ou marcos após encontros. Controlar stacking, duração e limites. O jogador deve notar diferenças reais no exército.

## 9.3 Recursos

- **Moedas de campo:** obtidas na run, usadas para contratar unidades/tratar feridos em acampamentos; reiniciam ao fim.
- **Suprimentos:** obtidos na run; usados para cura/ações de campo; reiniciam ao fim.
- **Insígnias de legado:** recebidas por conclusão, exploração, derrotas com menor rendimento, usadas nas instalações permanentes.
- **Moedas do quartel** (opcional): se realmente necessária para promoções. Evitar excesso de moedas sem função; a implementação pode reutilizar insígnias de legado para promoções com preços baixos.

## 9.4 Melhorias permanentes do quartel

Implementar no mínimo:
- **Enfermaria** nível 0–3: reduz chance de morte de derrubados (ex. 35% → 31% → 27% → 23%, respeitando modificadores) e/ou permite recuperação mais eficiente.
- **Alojamentos** nível 0–2: aumenta número de soldados persistentes (12 → 16 → 20).
- **Academia** nível 0–3: pequeno bônus de XP a veteranos, sem tornar recrutas obsoletos.
- **Mesa de comando** nível 0–2: pequeno bônus inicial/recarga de comandante.

Cada compra precisa deduzir recursos, persistir, afetar o jogo de verdade, impedir compra inválida e exibir custo/próximo efeito. Primeira run deve permitir uma melhoria modesta sem grind excessivo.

## 9.5 Ritmo

Uma run vencida deve durar aproximadamente 10–15 minutos em condições típicas; use parâmetros de velocidade, distâncias, tamanho de grupos e recompensas para atingir essa faixa. Não inflar conteúdo com caminhada vazia. Derrotas precoces ainda devem oferecer aprendizado e incentivo para tentar novamente.

---

# 10. QUARTEL, TELAS E INTERFACE

## 10.1 Telas necessárias

1. **Abertura/menu:** Jogar, Continuar (se run ativa), Quartel, Configurações, Novo jogo/Apagar save com confirmação.
2. **Quartel:** comandantes, capacidade, moedas de legado, upgrades permanentes, seleção da equipe inicial, soldados feridos, recuperação, promoções, Memorial, iniciar expedição.
3. **Game HUD:** comandante, vida, habilidades/cooldowns, recursos da run, objetivo, tamanho do exército, estado da ordem, minimapa, pausa; indicadores claros de unidades em perigo.
4. **Inspeção de soldado:** nome, classe, grau, nível, XP, stats, traço, status, histórico, retrato 3D opcional, botão promover/curar se aplicável.
5. **Escolha de vantagem/recrutamento:** cards touch-friendly, custo e efeito explícito.
6. **Pós-combate:** inimigos vencidos, recursos, XP, sobreviventes, feridos, mortos; opção clara de continuar.
7. **Fim da run:** vitória/retirada/derrota, duração, kills, baixas, veteranos preservados, recursos permanentes obtidos, escolha dos 2 recrutas a reter e retorno ao quartel.
8. **Configurações:** som, qualidade gráfica (Baixa/Média/Alta), tamanho de UI ou escala simples, instruções e controles.

## 10.2 Prioridades de UX

- Layout com alinhamentos, hierarquia visual, tipografia legível em tela pequena, animações e transições discretas.
- Botões funcionam em toque e mouse; ícones e texto claros.
- Mostrar **ferimento** e **morte** com feedback emocional contido, nunca como um número escondido.
- Tutorial de primeira run de até 4 dicas contextuais, dispensável e persistido: mover, recrutar, comandar, resolver batalha.
- Pausar simulação ao abrir telas modais relevantes; impedir ataques e comandos disparados por cliques em UI.
- Ocultar/atenuar HUD quando alguma tela ocupar grande parte do espaço.
- Tratar eventos de perda de foco/aba em segundo plano para pausar e salvar quando permitido.

---

# 11. MUNDO, IA E PROCEDURALIDADE

## 11.1 Mundo isométrico

Utilizar terreno simples `PlaneGeometry` ou tiles/patches 3D com diferenças discretas de cor e trilhas. Obstáculos têm posição, raio/caixa de colisão e etiqueta navegável ou não. A câmera permanece isométrica, mas mundo é 3D real.

Use **seed explícita e reproduzível** por expedição. O mapa muda por partida quanto a posição de encontros, recursos e rotas. Ofereça seed em modo debug.

## 11.2 IA de patrulha e combate

Estados claros: `idle`, `patrol`, `alert`, `pursue`, `attack`, `retreat` (se necessário), `dead`. Grupos têm centro, leash/range, composição e dificuldade. Não deixar grupos persegui-lo até o outro lado do mapa infinitamente. Cuidado com múltiplas patrulhas empilhando sobre a posição inicial.

Unidades usam detecção espacial eficiente (grade/hash ou consultas restritas) e pathing simples; não fazer busca de todos-contra-todos a cada frame sem controle. Sem física individual de ragdoll.

## 11.3 Balanceamento e justiça

- Apresentar nível de perigo relativo dos encontros antes de engajar.
- Início sempre possível: primeiro encontro deve ser vencível pela tropa inicial após tutorial.
- Chefe deve ser desafiador, não impossível sem um meta-upgrade específico.
- Curandeiros precisam agregar valor, mas manter chance real de baixas.
- Gerador não pode bloquear a fortaleza ou POIs necessários.
- RNG semeado evita divergências inexplicáveis em testes.

---

# 12. SOM E POLIMENTO

Gerar pequenos efeitos sonoros **originais** por Web Audio (ou assets próprios criados localmente): passo discreto (opcional), espada, arco, magia, cura, ganho de nível, recrutamento, alerta, vitória, derrota. Botão de mute e volume.

Fazer animações de interface com CSS para cards, banners, XP, progressão de nível, contagem de baixas. VFX 3D simples e limitados para manter FPS. Não usar música ou sprites de jogos existentes nem baixar conteúdo proprietário de terceiros.

---

# 13. SALVAMENTO, ESTABILIDADE E QUALIDADE

## 13.1 Save robusto

Salvar, com schema versionado e validação:

```text
saveVersion
profileId
unlockedCommanders
barracksRoster (entidades e progresso individual)
memorial
globalResources
permanentUpgrades
statistics
tutorialFlags
settings
activeExpedition? (seed, RNG state, mapa/eventos já consumidos,
                   soldados atuais e HP, objetivos, perks, recursos,
                   resultado de encontros, comandante, posição, tempo)
```

- Criar **autosave** em ações relevantes (recrutamento, fim de encontro, promoção, cura, compra, conclusão da run), intervalo durante gameplay e `visibilitychange` quando viável.
- Se save corromper: tratar erro sem crash, oferecer recomeço e, se possível, backup da última versão válida.
- Migrações simples e explícitas por `saveVersion` ou reset seguro somente com aviso.
- Fechar/reabrir o navegador no meio da run deve restaurar sem reviver mortos, duplicar itens ou recriar recompensas de um POI já visitado.
- Não usar dados aleatórios do render como fonte da verdade.

## 13.2 Segurança de estado e robustez

- Validar custos, limites, IDs, quantidades, níveis e estado da tropa em ações do domínio.
- Comandante não pode ficar preso em objeto ou fora de mapa.
- Nenhum estado softlock: sem tropas, sem recursos ou com tropa ferida, deve existir um caminho de recuperação ou nova run básica.
- Não permitir eventos críticos duplicados por cliques rápidos ou touch simultâneo.
- Tratamento razoável de `webglcontextlost`, tela de erro de inicialização e assets/procedural model failures.

---

# 14. DESEMPENHO MOBILE — BUDGET E REGRAS

Alvos de desenvolvimento (medir, não prometer sem teste físico):

- **60 FPS** desejável em desktop comum; **30 FPS estáveis** no smartphone intermediário usado em QA.
- Alvo de cenário com **40 aliados + 40 inimigos** na mesma região, mais cenário/partículas moderados.
- DPR limitado em telefones, por exemplo 1.0–1.5 dependendo da qualidade.
- Sombras simples ou desligadas em `Baixa`.
- Pooling de projéteis/partículas, geometrias/material compartilhados, descarte explícito de recursos ao mudar de cena.
- LOD e distância de atualização para IA fora da câmera quando necessário.
- Nenhum log massivo nem criação descontrolada de malhas, arrays e vetores por frame.
- Testes de estresse com ao menos 80 unidades por alguns minutos, observando render, simulação, memória e erros.

Se o sistema ficar pesado, priorize **reduzir detalhes de cena, sombras, partículas e atualização de IA distante**, preservando a clareza da tropa, dos soldados individuais e do combate.

---

# 15. TESTES E CRITÉRIOS DE ACEITE (NÃO NEGOCIÁVEIS)

## 15.1 Testes unitários

Implementar testes automáticos cobrindo pelo menos:

1. Gerador de IDs únicos e soldados com atributos consistentes.
2. XP, subida de nível, promoções e limites.
3. Cálculo de dano, cooldown e cura, sem HP negativo indevido.
4. Transição de `healthy` → `downed` → exatamente um resultado `wounded` ou `dead`.
5. Soldados mortos não voltam, não atacam e aparecem no memorial.
6. Chance de morte modulada pela enfermaria e traços dentro de limites.
7. Recrutamento respeita limite de 40 e gera entidades distintas.
8. Compras do quartel: custo, recursos insuficientes, efeito e persistência.
9. Upgrade de run realmente altera atributos/efeitos calculados.
10. Vitória, retirada e derrota sem recompensa duplicada.
11. Geração de mapas: POIs mínimos presentes e alcançáveis em múltiplas seeds.
12. Save → load preserva IDs, XP, feridas, mortos, perks, seed e eventos consumidos.
13. Reprocessar resultado de encontro/save não duplica baixas, XP ou loot.
14. Partida continua possível com o quartel parcialmente vazio/ferido.

## 15.2 Integração e simulações

Criar **modo/headless simulation** separado do renderer que executa, no mínimo, **100 runs simuladas com sementes diferentes** de forma automatizada e gera métricas: tempo de run simulada, resultados, perdas, níveis, classes usadas, quantidade média de tropas, erros, encontros inalcançáveis e bloqueios de estado. Não exigir que taxa de vitória siga número arbitrário, mas ajustar desequilíbrios óbvios identificados.

Executar **teste de combate com muitas unidades** em modo headless e um teste manual/browser com cenário de estresse. Relatar o que realmente foi medido e o que depende de dispositivo físico.

## 15.3 E2E/smoke do jogo

Se houver suporte a browser automation, testar:

- tela abre sem erro fatal;
- iniciar uma run;
- mover comandante;
- interagir com um POI;
- recrutar soldado;
- enfrentar inimigos;
- abrir painel de soldado;
- usar habilidade;
- salvar, recarregar e continuar;
- concluir/retirar e voltar ao quartel;
- iniciar segunda run preservando progresso de sobreviventes.

Se a automação não conseguir lutar manualmente, criar **helpers de debug somente para testes** que avancem eventos de maneira controlada (sem inseri-los como mecânicas normais) e mantenham verificação real das regras.

## 15.4 Critérios visíveis de conclusão

O protótipo só será declarado pronto quando:

- [ ] Abre no browser sem recursos externos obrigatórios e com 3D real renderizado.
- [ ] Exibe modelos originais low poly distintos, animados e equipáveis modularmente.
- [ ] Há comandante com câmera isométrica e controles desktop + touch mobile.
- [ ] Aliados seguem em formação, atacam, curam e obedecem ordens úteis.
- [ ] Existem exploração, POIs interativos, recrutamento, loot e geração por seed.
- [ ] Há confrontos reais contra tropas inimigas e um chefe final.
- [ ] Soldados têm nome, XP, level, grau, aparência evolutiva, ferimento, morte permanente e memorial.
- [ ] O fim de cada encontro aplica baixas uma única vez e informa o jogador.
- [ ] Existe run completa com vitória, derrota e retirada.
- [ ] Existe Quartel funcional com sobreviventes, seleção de equipe, promoções, cura e upgrades.
- [ ] Há perks aleatórios da run e meta-progresso persistente.
- [ ] Fechar/reabrir preserva o estado; segunda expedição mostra progressão de veteranos.
- [ ] Build de produção, typecheck e testes automatizados passam.
- [ ] Documentação final instrui executar no desktop e smartphone e informa limitações reais.

---

# 16. ROTEIRO DE IMPLEMENTAÇÃO E VERIFICAÇÃO

Implemente nesta sequência preferencial, **sem se limitar a escrever um roteiro**:

### Fase A — Base executável
1. Inspecionar workspace, iniciar Vite + TS + Three.js, `strict`, scripts `dev/build/typecheck/test`.
2. Implementar estados de tela, domínio mínimo, cena 3D, câmera ortográfica, chão, comandante e movimento teclado/touch.
3. Criar uma pequena cena de teste executável e conferir rendering/input antes de expandir.

### Fase B — Tropas e arte procedural
4. Implementar gerador modular de corpos, equipamentos, classes, cores/grades e animações.
5. Implementar formação, steering, seleção de alvo, inimigos básicos e efeitos de combate.
6. Criar ferramentas de debug para gerar tropas e forçar cenas de teste, sem quebrar interface normal.

### Fase C — Loop completo da expedição
7. Implementar combate completo, unidades distintas, IA, projéteis, curas e habilidades do comandante.
8. Implementar mundo seedado/POIs, encontros, recrutamento, baús, acampamentos, santuários e chefe.
9. Conectar estado de run, XP, baixas, morte/ferimento, resultados de encontro e fim da run.

### Fase D — Meta-progresso
10. Implementar quartel, seleção inicial, memorial, tratamentos, promoções e upgrades.
11. Implementar regras de veteranos persistentes e seleção de até 2 novos recrutas sobreviventes.
12. Implementar save/load completo e retomar expedição.

### Fase E — Mobile e polimento
13. Finalizar HUD, layout responsivo, safe areas, botões touch e feedback.
14. Sons originais, VFX leves, quality presets e configurações.
15. Configurar Capacitor se viável sem atrapalhar web.

### Fase F — QA obrigatório
16. Testes unitários e integração, simulações de seeds, smoke/E2E.
17. Corrigir erros, revisar memória/performance e testar recomeço, reload, derrota e segunda run.
18. Documentar comandos, arquitetura, decisões, controles, balanceamento, limitações e próximos passos.

**Quando houver trade-off de tempo:** não reduza este jogo a um menu. Entregue primeiro um ciclo inteiro jogável com conteúdo pequeno e expandível; só depois adicione cosmética e profundidade secundária. Recursos essenciais jamais podem ser substituídos por telas falsas. Se um item não for implementado, registre explicitamente como pendência, não como concluído.

---

# 17. ARQUIVOS FINAIS ESPERADOS

- `README.md` com proposta, controles, requisitos, comandos, seed debug, estados e guia de execução em PC/celular.
- `docs/ARCHITECTURE.md` explicando domínio/simulação/render/UI/persistência e data flow.
- `docs/GAME_DESIGN.md` com loop, classes, números, upgrades, ferimentos/mortes e progressão.
- `docs/DECISIONS.md` para escolhas técnicas relevantes.
- `docs/QA_REPORT.md` com testes rodados, resultados, FPS se medido, limitações e itens pendentes.
- `docs/ROADMAP.md` para melhorias futuras, **sem substituir entregas do MVP**.
- Scripts `npm run dev`, `npm run build`, `npm run typecheck`, `npm run test`, `npm run test:sim` e, se possível, `npm run test:e2e`.
- Projeto com dependências declaradas e lockfile funcional.
- Código completo dos modelos low poly procedurais, classes, IA, UI, economia e save.

### O que reportar ao final

Entregar um relatório sintético:

1. O que foi implementado **e testado de verdade**.
2. Como iniciar e jogar, com URL local indicada pelo comando de dev (não inventar URL de hospedagem pública).
3. Principais atalhos/controles desktop e mobile.
4. Evidência do build/typecheck/teste/simulação e resultados concretos.
5. Limitações conhecidas (inclusive falta de build Android ou teste em hardware real, se for o caso).
6. Próximas 5 melhorias priorizadas, sem descaracterizar o escopo.

---

# 18. RESTRIÇÕES E ALERTAS DE QUALIDADE

- **Não fazer** multiplayer, autenticação, servidor, conta online, marketplace, anúncios, blockchain ou microtransações agora.
- **Não buscar** sprites/modelos de franquias conhecidas ou conteúdos sem licença adequada. O protótipo deve ter identidade original.
- **Não terceirizar** modelos a um serviço pago ou a uma API de geração de imagens; construir modelos low poly com malhas próprias e modularidade.
- **Não criar** 15 sistemas superficiais desconectados: quero 1 jogo pequeno, integrado e jogável do começo ao fim.
- **Não confundir** pixel art, sprites ou mockups com 3D: cenário, personagens e projéteis devem existir em espaço 3D.
- **Não repetir** ferimentos/mortes ou recompensas por bugs de transição.
- **Não quebrar** progressão de soldados ao iniciar nova expedição: veteranos sobreviventes conservam a própria identidade e experiência.
- **Não bloquear** o jogador por falta de tropas, já que haverá mortes permanentes: deve existir recrutamento básico de recuperação a cada nova run ou outro mecanismo de recomeço balanceado.
- **Não assumir** que compilação equivale a jogo funcional: abrir e exercer o ciclo completo faz parte da tarefa.
- **Não manter** referências fundamentais a serviços externos; o jogo deve continuar jogável offline após carregar localmente.

## Critério central de sucesso

Imagine o teste final:

> Eu abro o jogo no celular, vejo um pequeno comandante 3D estilizado com seus soldados ao redor, ando em um mapa isométrico, encontro prisioneiros, contrato mais guerreiros, ataco uma patrulha, vejo meus arqueiros atirarem e meu guardião segurar a frente, perco um soldado, outro fica ferido, ganho XP e promovo meu espadachim. Reorganizo a tropa, escolho uma vantagem, venço ou perco contra um chefe, volto ao quartel, examino os veteranos sobreviventes, cuido do ferido, vejo o nome do falecido no memorial, compro uma melhoria e parto novamente com os sobreviventes — agora mais experientes. O segundo mapa tem encontros diferentes e meu progresso permanece salvo.

**Seu trabalho só está concluído quando essa experiência estiver implementada, conectada, utilizável e verificada. Comece agora analisando o workspace e executando a Fase A.**
