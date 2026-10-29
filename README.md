# GhostTP — Teleprompter Overlay (Focus-Safe)

Aplicativo desktop de **Teleprompter Overlay** construído em **Electron**, projetado especificamente para apresentações ao vivo (**PowerPoint**, **Google Slides**, **Keynote**, **Canva**) e reuniões online (**Zoom**, **Google Meet**, **Microsoft Teams**, **OBS**).

## Principais Recursos Implementados

1. **100% Focus-Safe & Click-Through (`Modo Apresentação`):**
   - A janela utiliza `focusable: false`, `setIgnoreMouseEvents(true, { forward: true })` e `setAlwaysOnTop(true, 'screen-saver')`.
   - Permanece sobre apresentações em **Tela Cheia** sem nunca roubar o foco do teclado e permitindo que cliques do mouse passem direto para o slide atrás do teleprompter.
2. **Controle Global via Teclado Numérico (Numpad) + Alternativas `Alt`:**
   - As setas normais do teclado e a barra de espaço ficam **100% livres** para o PowerPoint/Google Slides.
3. **Motor de Rolagem Híbrido em 60fps:**
   - **Rolagem Manual Suave por Blocos** (`Numpad 2` desce / `Numpad 8` ou `Numpad 6` sobe) com interpolação contínua que não engasga ao segurar a tecla.
   - **Auto-Scroll Contínuo** (`Numpad 5` Play/Pause) com velocidade ajustável em tempo real (`Numpad +` e `Numpad -`).
4. **Modo Edição & Posicionamento (`Numpad 0` ou `Alt + L`):**
   - Destrava temporariamente a janela para que você possa arrastá-la até a webcam, redimensioná-la, colar/editar o texto diretamente na tela ou importar arquivos `.txt` / `.md` (por botão ou Drag & Drop).
5. **Proteção Nativa contra Captura de Tela (`setContentProtection`):**
   - Invisível para a audiência ao compartilhar a tela inteira no Zoom, Meet, Teams ou OBS Studio (ativado por padrão, podendo ser alternado no cabeçalho ou no ícone da Bandeja do Sistema).
6. **Marcadores Visuais de Passagem de Slide:**
   - Linhas contendo `[SLIDE ...]` ou `---` são automaticamente convertidas em avisos visuais destacados (`⏭️ AVANÇAR SLIDE`), e palavras entre `*asteriscos*` ganham destaque de entonação.

---

## Tabela de Atalhos Globais

| Ação | Atalho Principal (Numpad) | Atalho Alternativo (Sem Numpad) |
| :--- | :--- | :--- |
| **Rolar para Baixo** | `Numpad 2` | `Alt + Seta Baixo` |
| **Rolar para Cima** | `Numpad 8` ou `Numpad 6` | `Alt + Seta Cima` |
| **Play / Pause Auto-Scroll** | `Numpad 5` | `Alt + P` |
| **Aumentar Velocidade / Passo** | `Numpad +` | `Alt + Seta Direita` |
| **Diminuir Velocidade / Passo** | `Numpad -` | `Alt + Seta Esquerda` |
| **Voltar ao Topo do Roteiro** | `Numpad 1` | `Alt + Home` |
| **Alternar Modo Apresentação / Edição** | `Numpad 0` | `Alt + L` |
| **Aumentar / Diminuir Fonte** | `Numpad 9` / `Numpad 7` | `Alt + =` / `Alt + -` |
| **Aumentar / Diminuir Opacidade** | `Numpad 3` / `Numpad 4` | *(Botões no Modo Edição)* |
| **Pausar/Ativar Captura do Numpad** | — | `Alt + K` |
| **Ocultar / Mostrar Teleprompter** | — | `Alt + H` |
| **Fechar o Aplicativo** | — | `Ctrl + Shift + Q` |

---

## Como Executar

```bash
npm start
```
