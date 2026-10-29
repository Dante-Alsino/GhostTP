# Manual de Testes Práticos — Teleprompter Overlay (Focus-Safe)

Antes de iniciar os testes, caso o aplicativo já esteja aberto com a versão anterior, feche-o (`Ctrl + Shift + Q`) e inicie novamente no terminal:

```bash
npm start
```

---

## Checklist Passo a Passo

### Teste 1: Verificação do Modo Foco-Seguro e Click-Through (Sem roubar foco)
1. Com o Teleprompter aberto no topo da tela, abra o **PowerPoint**, **Google Slides** ou um **Bloco de Notas** atrás da janela do Teleprompter.
2. Observe no canto superior esquerdo do Teleprompter a etiqueta verde: `🔒 FOCO-SEGURO (CLICK-THROUGH)`.
3. **Ação:** Clique com o mouse exatamente **em cima das letras do Teleprompter** onde há um botão ou texto do programa de trás.
4. **Resultado esperado:** O clique atravessa o Teleprompter ("vaza") e interage diretamente com a janela que está atrás dele, sem tirar o foco da sua apresentação.

---

### Teste 2: Rolagem Manual Global sem Interferir nos Slides
1. Mantenha o foco clicado no seu PowerPoint / Google Slides / Bloco de Notas.
2. **Ação (Com Numpad — verifique se o `NumLock` está ligado):**
   - Toque em `Numpad 2` várias vezes (ou segure).
   - Toque em `Numpad 8` ou `Numpad 6`.
3. **Ação (Sem Numpad / Notebook):**
   - Pressione `Alt + Seta para Baixo` e `Alt + Seta para Cima`.
4. **Ação de Prova Real dos Slides:**
   - Pressione as **Setas normais do teclado** (`Seta Direita`, `Seta Esquerda`, `Seta Baixo`) ou a `Barra de Espaço`.
5. **Resultado esperado:**
   - O `Numpad 2` / `Numpad 8` (ou `Alt + Setas`) rola o Teleprompter suavemente e atualiza a barra de progresso no topo.
   - As setas normais do teclado continuam passando os slides normalmente na janela de trás!

---

### Teste 3: Aumentar e Diminuir o Tamanho das Letras (5 Formas)
Testaremos tanto durante a apresentação (Modo Travado) quanto no Modo Edição:

1. **Via Atalho Global no Numpad (com a janela travada):**
   - Pressione `Numpad 9` três vezes → As letras devem crescer de `4px` em `4px` (`32px` → `36px` → `40px` → `44px`), a faixa guia de leitura acompanha a altura da letra e o indicador `🔤 44px` no topo é atualizado.
   - Pressione `Numpad 7` três vezes → As letras diminuem de volta para `32px`.
2. **Via Atalho Global Universal (Teclado ABNT2 / Notebook sem Numpad):**
   - Pressione `Alt + .` (Alt + Ponto `>`) → Aumenta a letra.
   - Pressione `Alt + ,` (Alt + Vírgula `<`) → Diminui a letra.
   - *(Alternativa adicional: `Alt + PageUp` para aumentar e `Alt + PageDown` para diminuir).*
3. **Via Botões `A-` / `A+` e Barra Deslizante (no Modo Edição):**
   - Pressione `Numpad 0` ou `Alt + L` para destravar a janela (a borda ficará azul e o topo mostrará `✏️ MODO EDIÇÃO`).
   - Clique nos botões **`A+`** e **`A-`** na barra superior ou arraste a **barra deslizante (slider)** entre eles → O texto redimensiona instantaneamente sem perder a linha atual de leitura.
4. **Via `Ctrl + Roda do Mouse` (no Modo Edição):**
   - Segure a tecla `Ctrl` e gire a roda do mouse (scroll) para cima e para baixo sobre o texto → Faz zoom suave nas letras.

---

### Teste 4: Rolagem Automática Contínua (Auto-Scroll) e Velocidade
1. Pressione `Numpad 5` (ou `Alt + P`).
2. **Resultado esperado:** O indicador muda para `▶ AUTO (45px/s)` em azul e o texto começa a subir sozinho continuamente.
3. Com o Auto-Scroll ativo, pressione `Numpad +` (ou `Alt + Seta Direita`) para acelerar, e `Numpad -` (ou `Alt + Seta Esquerda`) para desacelerar.
4. Pressione `Numpad 1` (ou `Alt + Home`) → O Auto-Scroll pausa e o texto volta imediatamente ao início (`Progresso: 0%`).

---

### Teste 5: Modo Edição, Importação de `.TXT` e Movimentação da Janela
1. Pressione `Numpad 0` ou `Alt + L` para entrar no **Modo Edição** (caso ainda não esteja).
2. **Mover a Janela:** Clique e segure no ícone `⠿` ou nas etiquetas do canto superior esquerdo e arraste a janela para qualquer ponto da tela. Depois clique no botão `🎯 Topo` para centralizá-la automaticamente perto da webcam.
3. **Editar Roteiro:** Clique em `📝 Editar Texto`, digite uma linha contendo `[SLIDE TESTE]` e uma frase com `*palavra destacada*`, e clique em `✓ Salvar e Visualizar`.
4. **Importar Arquivo `.TXT`:** Clique em `📂 Abrir .TXT` e selecione o arquivo `roteiro-exemplo.txt` na pasta do projeto (ou arraste o arquivo `.txt` direto para dentro da janela).
5. **Voltar para Apresentação:** Clique no botão verde `🔒 Apresentar (Num 0)` (ou pressione `Numpad 0` / `Alt + L`).

---

### Teste 6: Proteção de Captura (Invisível no Zoom / Meet / Print Screen)
1. Certifique-se de que a etiqueta `🛡️ OCULTO NA CAPTURA` está ativa no topo.
2. Pressione a tecla `Print Screen` (`Win + Shift + S`) do Windows ou compartilhe a **Tela Inteira** no Google Meet / Zoom / OBS.
3. **Resultado esperado:** Na captura de tela gerada, a janela do Teleprompter **não aparece**, exibindo apenas o que está atrás dela.
