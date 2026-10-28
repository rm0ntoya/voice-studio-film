# Voice Studio — Filme de Motion Design (Production Bible)

> Remotion 4 · 1920×1080 · 60 fps · ~57 s · áudio-guia: `Minha Voz Proficional` (ElevenLabs, 53,24 s)
> Documento único de direção criativa, sistemas e arquitetura.

---

## 1. Creative Direction

### Conceito — **"A prova é a própria voz"**

O roteiro guarda um *twist*: aos 38 s o narrador revela que **o áudio que você está ouvindo foi 100 % gerado por IA**. O filme inteiro é construído para essa virada. Até ali, a linguagem é a de um produto confiável e humano (loja, equipe, cliente); no clímax, o filme se volta sobre si mesmo: mostra a própria forma de onda, o próprio timecode, e inverte a cor do mundo. A voz deixa de ser trilha e vira **protagonista visível**.

- **Objetivo:** apresentar o Voice Studio (assistente de IA para comércio que atende por mensagem, WhatsApp, voz e telefone, com a voz de uma atendente real) e provar a qualidade da voz pelo próprio filme.
- **Público:** donos de comércio / lojistas brasileiros, gestores de atendimento, e — como showcase — quem avalia domínio de motion design.
- **Tom:** híbrido `polished` + `cinematic`. Elegante e contido no desenvolvimento, um único momento trailer-scale no clímax.
- **Fio condutor visual:** a **Linha de Voz** — uma fita de forma de onda real (envelope da narração), em Ember, que reaparece como motivo: nasce de um ponto no gancho, vira a logo, vira a nota de voz no chat, vira a ligação, glitcha no "voz travada", vira o herói do clímax, e se condensa de novo na logo final.

### Linguagem visual
Editorial-tecnológica, quente. Fundo tinta profunda, tipografia grande e precisa, uma única cor de sinal (Ember) usada com parcimônia, e serif itálica para as palavras humanas/emocionais. Nada de neon, nada de glow gratuito: luz vem de *pools* suaves que se movem como iluminação de cena.

---

## 2. Visual System

### Paleta (narrativa)
| Token | Hex | Papel |
|---|---|---|
| `ink` | `#0C0B0E` | fundo — o "palco" |
| `ink2` | `#16141A` | superfícies (cards, telefone) |
| `line` | `#2B2830` | bordas, grids, hairlines |
| `bone` | `#F4EFE6` | texto principal (contraste 17.9:1 sobre ink) |
| `muted` | `#8C867E` | texto secundário, labels (5.6:1) |
| `ember` | `#FF5A36` | **primária** — voz, marca, ênfase, o clímax inteiro |
| `emberSoft` | `#FF8A5C` | gradientes e luz da ember |
| `iris` | `#B7A6FF` | **secundária** — sistema/IA, usada só em detalhes |
| `leaf` | `#7BE0A6` | **accent** — confirmação (venda, chamada atendida) |

**Cor como narrativa:** o filme vive em `ink`. No clímax ("100 %"), o mundo inunda de `ember` com tipografia em `ink` (inversão = revelação). Depois volta ao `ink` pelo colapso da cor numa linha.

### Tipografia
| Papel | Família | Uso |
|---|---|---|
| Display / corpo | **Geist** 400–800 | todas as falas, títulos |
| Ênfase humana | **Instrument Serif** itálico | palavras emocionais: *mudar, voz, de verdade, natural, perfeito* |
| Sistema / dados | **Geist Mono** 400–500 | labels, timecodes, contadores, UI |
| Robô | **Geist Pixel** | apenas "robô" / "voz travada" (contraste semântico) |

Escala (px @1080p): `mega 340` · `xl 168` · `l 120` · `m 88` · `title 64` · `bodyL 44` · `body 32` · `label 20`.
Display: line-height 0.94, tracking −0.035em. Labels: mono, caixa-alta, tracking +0.14em. Falas em *sentence case* (soa como voz); caixa-alta só para sistema.

### Grid e composição
12 colunas, margens laterais 120 px, gutter 24 px, safe-area vertical 96 px. Texto falado ancorado à esquerda (colunas 1–6) e visual/UI à direita (colunas 7–12) nas cenas de produto; cenas de impacto quebram o grid de propósito (centro, escala mega). Cada cena usa uma região diferente da tela.

### Formas, luz e textura
Raios 28 px (cards) / 999 px (pílulas). Bordas 1 px `line`. Sombras longas e suaves (0 40px 80px rgba(0,0,0,.45)). Luz: um *light pool* radial ember de baixa opacidade que muda de posição por cena e respira com o grave da música (áudio-reativo). Textura: grão de filme determinístico (8 tiles gerados com seed, alternados por frame) + vinheta.

### Logo
**Marca "V-bars":** 5 barras arredondadas de alturas `[1, .62, .3, .62, 1]` — um "V" desenhado por forma de onda (Voice + onda sonora). Funciona em 16 px, anima de forma natural (as barras *são* a voz). Wordmark: **Voice** (Geist 600) + *Studio* (Instrument Serif itálico).

---

## 3. Motion System

| Token | Curva | Uso |
|---|---|---|
| `enter` | `bezier(0.16, 1, 0.3, 1)` | entradas de texto/UI |
| `exit` | `bezier(0.7, 0, 0.84, 0)` | saídas (aceleram para fora) |
| `inOut` | `bezier(0.65, 0, 0.35, 1)` | movimentos de câmera, morphs |
| `snap` | `bezier(0.85, 0, 0.15, 1)` | whips, cortes rápidos |

Springs: `settle {damping 200}` (UI sem overshoot) · `pop {damping 13, stiffness 170, mass .8}` (ênfase, logo) · `heavy {damping 22, stiffness 110, mass 2.2}` (tipografia mega, peso).

**Regras de palavra (sync):** cada palavra entra **2 frames antes** do seu onset medido (antecipação perceptiva), em máscara de baixo para cima (clip) + blur 8→0 px + y 40%→0, duração 16 f. Palavras de ênfase usam spring `pop` e/ou troca de família. Frases saem juntas, com stagger de 1 f por palavra, acelerando (`exit`).

**Princípios aplicados:** antecipação (o ponto pulsa antes de virar linha; a câmera "respira" antes do clímax), follow-through (cards param em tempos diferentes), overshoot só em ênfases, contraste rápido/lento (o "na hora" entra **sem animação**, de propósito), peso (o "100 %" usa spring pesada).

**Transições (TransitionSeries + apresentações próprias):** `lift` (S1→S2), corte em continuidade de objeto (S2→S3, S3→S4, S10→S12), `whip` com motion-blur direcional (S4→S5), corte seco no beat (S5→S6), `plusWipe` — o "+" de "E tem mais" vira máscara (S6→S7), `dip` para a escuridão (S7→S8), `iris` ember a partir do playhead (S8→S9), `collapse` da cor numa linha (S9→S10).

---

## 4. Audio System

- **Voz:** cópia em 48 kHz com high-pass 70 Hz; original intocado. Prioridade absoluta.
- **Música:** *Happy Beats / Business Moves vol. 12* (C maior, 109.96 BPM), reeditada por `scripts/build_audio.py`:
  - offset +2,558 s → o primeiro downbeat do groove cai **exatamente em "Voice"** (11,300 s).
  - "E para te provar" → **low-pass sweep** 18 kHz → 700 Hz (−4 dB): a música "afunda".
  - "verdade, ‖ esse áudio" → **suck-out** para silêncio total na respiração de 0,58 s.
  - silêncio + drone em Dó + riser tonal (Sol→Sol, dominante) + batidas de coração no tempo da música.
  - "**100 %**" → o drop do próprio track (downbeat 43,654) volta junto com sub-boom e air-burst.
  - 7 compassos depois (53,928 s) → **button ending** emendado no hit final do próprio track + sino FM em Dó + pad Cadd9.
- **Ducking:** side-chain real (env-follower 20 ms / 320 ms) −6 dB + *voiceover carve* −3,5 dB em 0,9–4,2 kHz enquanto a voz fala. Música estacionada 9 LU abaixo da voz antes do ducking.
- **SFX:** sintetizados no tom (Dó maior) para tudo que é tonal; Kenney CC0 (escolhidos pela análise de risco de agudos) para cliques, drops, teclas, glitches e impactos. Regra: SFX no *início* do gesto; poucos e bem colocados.
- **Master:** loudnorm EBU R128 → −14 LUFS integrado, true-peak −1 dBTP (passo final do pipeline).

---

## 5. Transcrição + Timeline Semântica (word-level)

Transcrição: Whisper large-v3-turbo (whisper.cpp + DTW). Alinhamento: wav2vec2 **MMS_FA** (CTC por caractere) + refinamento de onset por envelope de energia → precisão ≈ ±10 ms (< 1 frame @60 fps). Dados em `src/data/words.json` (168 palavras).

| # | Tempo | Fala | Palavra-chave / intenção | Visual · animação | Transição | SFX |
|---|---|---|---|---|---|---|
| S1 | 0,10–4,30 | Deixa eu te contar uma coisa que vai **mudar** o jeito que a sua loja atende os clientes. | segredo, mudança | Ponto ember pulsa → estica na Linha de Voz; texto à esquerda, palavra a palavra; *mudar* troca de família (sans→serif) num flip — a palavra muda | `lift` | intro-air, sub suave |
| S2 | 4,32–10,50 | **Imagina** ter um atendente que nunca **dorme**, nunca perde uma **venda** e fala exatamente como a sua **equipe**. | promessa ×3 | *Imagina* em serif; lista 01/02/03 à esquerda; à direita, pilha de cards em profundidade: relógio 03:47 + lua · venda confirmada · equipe/bolha | cards colapsam no ponto | drop ×3, success |
| S3 | 10,56–12,42 | Esse é o **Voice Studio**. | revelação da marca | O ponto explode em 5 barras (a voz ao vivo) que assentam em "V"; wordmark revela; luz ember por trás | logo voa para o header (shared element) | groove entra no downbeat, sub-boom, impactSoft, shimmer |
| S4 | 12,43–16,03 | Com ele, você **cria** um assistente de **inteligência artificial** para o seu comércio | criação | Painel "Novo assistente" se monta: orb, nome digitado, toggle "IA ativa", campo comércio | `whip` → | switch, clicks |
| S5 | 16,27–21,23 | que atende os seus clientes **de verdade**, por mensagem, no **WhatsApp** e agora **com voz**. | canais | Telefone em perspectiva: bolha do cliente → digitando → resposta → **nota de voz** (a Linha de Voz vira o waveform da nota) | corte seco | whoosh, pops |
| S6 | 21,61–26,15 | **Isso mesmo**, a IA conversa falando, usando a voz de uma das suas **atendentes**. | confirmação + identidade | "Isso mesmo." punch central; 4 retratos de atendentes, cursor de seleção percorre e escolhe; voz dela flui para a IA | `plusWipe` | impactSoft, select ticks |
| S7 | 26,47–33,77 | E tem **mais**, quando o cliente **liga** para a sua loja, quem atende é **ela**, *natural*, **na hora**, sem **robô**, sem aquela voz **travada**. | telefone, naturalidade | Chamada recebida (ondas) → atendida (timer corre) → *natural* · NA HORA (sem animação) → "robô" em pixel font glitcha, onda quadriculada trava e é riscada | `dip` | ring, connect, glitch, stutter |
| S8 | 34,07–38,60 | E para te provar que isso é **de verdade**, esse **áudio** que você está escutando **agora** foi… | tensão, meta | Mundo esvazia; a Linha de Voz vira herói com playhead e timecode **real** do filme; câmera avança lentamente | `iris` ember do playhead | LPF sweep, suck-out, drone, riser, heartbeat |
| S9 | 38,65–41,05 | **100 %** gerado por **inteligência artificial**. | **CLÍMAX** | Inundação ember; contador 0→100 no tempo exato de "cem por cento"; slam pesado; a forma de onda do filme inteiro desenha atrás com o playhead | `collapse` | drop, sub-boom, air-burst |
| S10 | 41,33–47,24 | Eu não gravei **nada**. Eu pedi para uma IA **escrever** esse texto, **joguei** aqui no Voice Studio e mandei **gerar** com a minha voz. | o processo | Microfone riscado; câmera pan em 3 painéis: prompt digitado (teclas) → card arremessado no app → botão Gerar → onda materializa | contínuo | keypress, card-slide, click |
| S11 | 47,60–48,72 | E ficou **perfeito**, né? | satisfação | check desenha; *perfeito* serif; "né?" inclina com charme | onda condensa na logo | success |
| S12 | 49,18–57,1 | **Voice Studio**, a sua voz atendendo por você **o dia inteiro**. | assinatura | Lockup final; anel de 24 h fecha em "o dia inteiro"; desaceleração, respiração final | fade | final-bell, pad, hit final do track |

**Frase mais importante:** "esse áudio que você está escutando agora foi **100 % gerado por inteligência artificial**." → clímax S9.

---

## 6. Technical Architecture

```
scripts/
  align.py          forced alignment (MMS_FA) → src/data/words.json
  build_audio.py    music edit + ducking + SFX synth + envelopes
  master.sh         render → loudnorm master → poster frame → deliverables
src/
  Root.tsx                    composições: VoiceStudioFilm + stills de QA
  compositions/VoiceStudioFilm.tsx   camadas: Backdrop → TransitionSeries(cenas) → overlays → Soundtrack
  data/      words.json · anchors.json · voice-envelope.json · music-envelope.json · music-plan.json
             timeline.ts (cenas derivadas das palavras) · sfx.ts (cues ancorados em palavras)
  theme/     tokens.ts (cores, tipo, grid) · fonts.ts
  motion/    easing.ts · springs.ts · time.ts (wordFrame, progress, clamp helpers)
  typography/  KineticPhrase · Word · CountUp · Typewriter · StutterText
  components/  VoiceLine · LogoMark · Wordmark · PhoneFrame · ChatBubble · Card · Avatar · Icons
  backgrounds/ Backdrop (ink + light pool + grain + vinheta)
  transitions/ lift · whip · plusWipe · dip · iris · collapse  (TransitionPresentation)
  scenes/      S01Hook … S12Outro
  audio/       Soundtrack (voz, bed, cues de SFX)
public/  audio/ (voice, music-bed, sfx/) · textures/ (grain tiles)
```

- **Dados separados da apresentação:** cenas e SFX referenciam **índices de palavras** e âncoras nomeadas; retimar = mudar `words.json`/`anchors.json`, sem tocar componentes.
- **Determinismo:** tudo é função pura do frame; aleatoriedade via `random(seed)` do Remotion / `@remotion/noise`; grão pré-gerado com seed.
- **Performance:** envelopes de áudio pré-computados (zero análise em runtime); SVG leve; blur só em janelas curtas; sem CSS animations.
- **Render:** `npx remotion render VoiceStudioFilm` (H.264, CRF 16, 60 fps) → `scripts/master.sh` (loudnorm 2-pass −14 LUFS / −1 dBTP, poster no frame 0) → `out/voicestudio.mp4`, `out/poster.jpg`, `out/share-copy.txt`.

## 7. QA
Stills de cada cena e de meio-transição; checagem de safe-area/overflow; espectrograma e loudness do mix; checagem frame-a-frame do sync (onset da palavra vs primeiro frame visível); render final + inspeção; iterar.
