<div align="center">

# 👻 GhostTP

### Teleprompter Overlay *Focus-Safe* & Invisível em Capturas de Tela

**Leia o seu roteiro olhando diretamente para a webcam enquanto avança seus slides normalmente, sem nunca perder o foco do PowerPoint ou Google Slides e sem aparecer no compartilhamento de tela.**

[![Electron](https://img.shields.io/badge/Electron-41+-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/Plataforma-Windows%20%7C%20macOS%20%7C%20Linux-0078D6?style=for-the-badge)](https://github.com/Dante-Alsino/GhostTP)
[![License](https://img.shields.io/badge/Licen%C3%A7a-MIT-10b981?style=for-the-badge)](LICENSE)

[Por que o GhostTP?](#-por-que-o-ghosttp) •
[Principais Recursos](#-principais-recursos) •
[Instalação Rápida](#-instalação-e-execução) •
[Atalhos de Teclado](#️-atalhos-globais-de-teclado) •
[Como Escrever Roteiros](#-formatação-inteligente-de-roteiros)

</div>

---

## 🎯 Por que o GhostTP?

Apresentar slides ao vivo ou em chamadas de vídeo usando um bloco de notas ou teleprompter comum gera três problemas clássicos que o **GhostTP** resolve nativamente:

| Problema Comum | Como o **GhostTP** Resolve |
| :--- | :--- |
| ❌ **Roubo de Foco:** Clicar para rolar o texto tira o foco do PowerPoint e trava o passador de slides. | ✅ **100% Focus-Safe (`focusable: false`):** Você controla a rolagem em segundo plano enquanto o foco permanece nos seus slides. |
| ❌ **Bloqueio do Mouse:** A janela do roteiro fica na frente de botões e abas da apresentação. | ✅ **Click-Through (`setIgnoreMouseEvents`):** No Modo Apresentação, qualquer clique do mouse atravessa o teleprompter direto para a janela de trás. |
| ❌ **Vazamento na Tela:** Ao compartilhar a *Tela Inteira* no Zoom, Meet ou Teams, todo mundo vê seu roteiro. | ✅ **Stealth Capture (`setContentProtection`):** A janela é visível no seu monitor, mas **invisível** em gravações, prints e compartilhamentos de tela. |

---

## ✨ Principais Recursos

* 🔒 **Modo Apresentação (*Ghost Mode*):** Sobreposição de nível máximo (`screen-saver`) que permanece visível inclusive sobre apresentações em **Tela Cheia (F5 / F11)**.
* 🎬 **Motor de Rolagem Híbrido (60fps):**
  * **Manual Suave por Blocos:** Desça ou suba parágrafos com interpolação contínua que não engasga ao segurar a tecla.
  * **Auto-Scroll Contínuo:** Dê *Play* (<kbd>Num 5</kbd> ou <kbd>Alt</kbd> + <kbd>P</kbd>) para leitura com as mãos livres e ajuste a velocidade em tempo real.
* ✏️ **Modo Edição & Posicionamento Instantâneo:** Com um único atalho (<kbd>Num 0</kbd> ou <kbd>Alt</kbd> + <kbd>L</kbd>), destrave a janela para arrastá-la, colar seu texto, importar arquivos `.txt` / `.md` (ou *Drag & Drop*) e ajustar o visual.
* 👁️ **Faixa Guia de Leitura (*Eye-Line*):** Destaque horizontal posicionado no terço superior da janela para manter seus olhos alinhados logo abaixo da webcam.
* ⏭️ **Avisos Visuais de Passagem de Slide:** Transforma marcações `[SLIDE]` do seu texto em alertas destacados para você saber o momento exato de avançar a apresentação.

---

## 🚀 Instalação e Execução

### Pré-requisitos
* [Node.js](https://nodejs.org/) (versão 18 ou superior)

### Opção 1: Via Terminal (Qualquer Sistema Operacional)

```bash
# 1. Clone o repositório
git clone https://github.com/Dante-Alsino/GhostTP.git

# 2. Acesse a pasta do projeto
cd GhostTP

# 3. Instale as dependências
npm install

# 4. Inicie o GhostTP
npm start
```

### Opção 2: Inicialização em 1 Clique (Windows)

O projeto inclui utilitários prontos para uso rápido no Windows sem deixar janelas de terminal abertas:
1. **`Iniciar Teleprompter.bat`**: Inicia o aplicativo diretamente (e instala as dependências sozinho caso seja a primeira execução).
2. **`Criar Atalho Desktop.bat`**: Cria automaticamente um atalho na sua **Área de Trabalho** com o ícone personalizado do **GhostTP**.

---

## ⌨️ Atalhos Globais de Teclado

> [!IMPORTANT]
> O **GhostTP** jamais sequestra as setas normais (<kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd>) nem a <kbd>Barra de Espaço</kbd>, garantindo que o seu **PowerPoint / Google Slides / Passador Laser** funcione sem nenhuma interferência.

### 🎮 Controle de Leitura e Rolagem

| Ação | Teclado Numérico (*Numpad*) | Teclado Compacto / Notebook |
| :--- | :---: | :---: |
| **Rolar para Baixo** | <kbd>Num 2</kbd> | <kbd>Alt</kbd> + <kbd>↓</kbd> |
| **Rolar para Cima** | <kbd>Num 8</kbd> ou <kbd>Num 6</kbd> | <kbd>Alt</kbd> + <kbd>↑</kbd> |
| **Play / Pause Auto-Scroll** | <kbd>Num 5</kbd> | <kbd>Alt</kbd> + <kbd>P</kbd> |
| **Aumentar Velocidade / Passo** | <kbd>Num +</kbd> | <kbd>Alt</kbd> + <kbd>→</kbd> |
| **Diminuir Velocidade / Passo** | <kbd>Num -</kbd> | <kbd>Alt</kbd> + <kbd>←</kbd> |
| **Voltar ao Topo do Roteiro** | <kbd>Num 1</kbd> | <kbd>Alt</kbd> + <kbd>Home</kbd> |

### 🎨 Ajustes Visuais e Modo da Janela

| Ação | Teclado Numérico (*Numpad*) | Teclado Compacto / Notebook |
| :--- | :---: | :---: |
| **Alternar Modo Apresentação / Edição** | <kbd>Num 0</kbd> | <kbd>Alt</kbd> + <kbd>L</kbd> |
| **Aumentar Tamanho da Letra** | <kbd>Num 9</kbd> | <kbd>Alt</kbd> + <kbd>.</kbd> *(ou <kbd>Alt</kbd> + <kbd>PageUp</kbd>)* |
| **Diminuir Tamanho da Letra** | <kbd>Num 7</kbd> | <kbd>Alt</kbd> + <kbd>,</kbd> *(ou <kbd>Alt</kbd> + <kbd>PageDown</kbd>)* |
| **Aumentar / Diminuir Opacidade** | <kbd>Num 3</kbd> / <kbd>Num 4</kbd> | *Botões `◐+` / `◐-` no Modo Edição* |
| **Ocultar / Mostrar Teleprompter** | — | <kbd>Alt</kbd> + <kbd>H</kbd> |
| **Pausar / Retomar Captura do Numpad** | — | <kbd>Alt</kbd> + <kbd>K</kbd> |
| **Fechar o Aplicativo** | — | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Q</kbd> |

> [!TIP]
> Você também pode controlar todas as funções clicando no ícone do **GhostTP** na **Bandeja do Sistema** (próximo ao relógio do Windows). No Modo Edição, segure <kbd>Ctrl</kbd> e gire a **roda do mouse** para dar zoom instantâneo nas letras.

---

## 📝 Formatação Inteligente de Roteiros

Você pode digitar, colar ou importar arquivos `.txt` e `.md`. O **GhostTP** reconhece marcações simples para facilitar a leitura dinâmica:

* **Palavras em destaque (`*texto*`):** Envolva palavras importantes entre asteriscos para destacá-las em amarelo brilhante (ótimo para marcar a entonação da voz).
* **Deixas de Slide (`[SLIDE ...]` ou `---`):** Escreva `[SLIDE 1 - INTRODUÇÃO]` ou `---` em uma linha isolada para criar um marcador visual de transição de slide.

**Exemplo de roteiro:**
```text
Olá a todos, sejam bem-vindos à apresentação do *resultado trimestral*!

[SLIDE 1 - VISÃO GERAL]

Neste primeiro gráfico, destacamos o crescimento de *34% na retenção* ao longo do último semestre.

---

Agora vamos analisar os próximos passos da equipe.
```

---

## 🗂️ Estrutura do Projeto

```text
GhostTP/
├── main.js                    # Processo Principal (Janela Focus-Safe, Tray e Atalhos Globais)
├── preload.js                 # Ponte de Segurança IPC (contextBridge)
├── index.html                 # Estrutura do HUD e Editor Embutido
├── styles.css                 # Estilização Transparente, Guia de Leitura e Temas
├── renderer.js                # Motor de Rolagem 60fps, Parser de Roteiro e Persistência
├── roteiro-exemplo.txt        # Roteiro de demonstração para teste rápido
├── MANUAL_DE_TESTES.md        # Checklist completo de validação manual
├── Iniciar Teleprompter.bat   # Inicializador rápido sem janela de terminal (Windows)
└── Criar Atalho Desktop.bat   # Gerador de atalho com ícone na Área de Trabalho
```

---

<div align="center">

Desenvolvido com foco em fluidez e praticidade para apresentações ao vivo.

</div>
