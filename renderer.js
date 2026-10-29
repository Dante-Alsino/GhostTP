(() => {
  const DEFAULT_SCRIPT = `Bem-vindo ao *Teleprompter Overlay Focus-Safe*!
Este aplicativo permanece visível sobre o seu *PowerPoint* ou *Google Slides* sem roubar o foco do teclado nem bloquear os cliques do mouse.

[SLIDE 1 - CONTROLE DE ROLAGEM]

Pressione *Numpad 2* (ou *Alt + Seta Baixo*) para descer suavemente o roteiro.
Pressione *Numpad 8* ou *Numpad 6* (ou *Alt + Seta Cima*) para subir o texto.
Enquanto isso, as *Setas Normais* e a *Barra de Espaço* continuam livres para avançar os seus slides normalmente!

[SLIDE 2 - TAMANHO DAS LETRAS E VELOCIDADE]

Para aumentar ou diminuir o tamanho das letras a qualquer momento:
• No Numpad: pressione *Numpad 9* (Aumentar) e *Numpad 7* (Diminuir).
• Sem Numpad: pressione *Alt + .* (Aumentar) e *Alt + ,* (Diminuir), ou *Alt + PageUp / PageDown*.
• No Modo Edição: use os botões *A-* / *A+*, a *barra deslizante* ou *Ctrl + Roda do Mouse*.

Quer falar com as mãos livres? Pressione *Numpad 5* (ou *Alt + P*) para iniciar ou pausar o *Auto-Scroll contínuo*.
Use *Numpad +* e *Numpad -* para ajustar a velocidade em tempo real.

[SLIDE 3 - MODO EDIÇÃO E PERSONALIZAÇÃO]

Precisa colar o seu roteiro, importar um arquivo *.TXT* ou arrastar esta janela para perto da sua webcam?
Pressione *Numpad 0* (ou *Alt + L*) para alternar entre o *Modo Foco-Seguro* e o *Modo Edição*.

---

Dica extra: Esta janela possui *Proteção de Captura Ativa*, ficando invisível para a audiência caso você compartilhe a tela inteira no *Zoom, Google Meet, Teams ou OBS Studio*!
Boa apresentação!`;

  const STORAGE_KEY_SCRIPT = 'tp_overlay_script_v1';
  const STORAGE_KEY_SETTINGS = 'tp_overlay_settings_v1';

  const defaultSettings = {
    fontSize: 32,          // px (16 a 80)
    bgOpacity: 0.84,       // 0.20 a 0.98
    scrollStep: 100,       // Passo manual em px
    autoScrollSpeed: 45,   // Velocidade do Auto-Scroll em px/s
    mirrored: false
  };

  let settings = loadSettings();
  let currentScript = localStorage.getItem(STORAGE_KEY_SCRIPT) || DEFAULT_SCRIPT;

  // Estado de execução da rolagem
  let isAutoScrolling = false;
  let currentScrollPos = 0;
  let targetScrollPos = 0;
  let lastFrameTime = performance.now();
  let isEditorOpen = false;
  let windowState = {
    isLocked: true,
    isHidden: false,
    contentProtection: true,
    numpadEnabled: true
  };

  // Elementos do DOM
  const body = document.body;
  const root = document.documentElement;
  const viewport = document.getElementById('prompter-viewport');
  const contentEl = document.getElementById('prompter-content');
  const readingGuide = document.getElementById('reading-guide');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('scroll-progress-text');
  const wordCountText = document.getElementById('word-count-text');
  const toastEl = document.getElementById('last-command-toast');

  const modeBadge = document.getElementById('mode-badge');
  const autoscrollBadge = document.getElementById('autoscroll-badge');
  const fontBadge = document.getElementById('font-badge');
  const protectionBadge = document.getElementById('protection-badge');
  const numpadBadge = document.getElementById('numpad-badge');

  const fontSizeLabel = document.getElementById('font-size-label');
  const fontSizeSlider = document.getElementById('font-size-slider');
  const speedLabel = document.getElementById('speed-label');

  const editorPanel = document.getElementById('editor-panel');
  const scriptTextarea = document.getElementById('script-textarea');

  // Botões da barra de ferramentas (Modo Destravado)
  const btnLoadFile = document.getElementById('btn-load-file');
  const btnToggleEditor = document.getElementById('btn-toggle-editor');
  const btnResetScroll = document.getElementById('btn-reset-scroll');
  const btnAutoscroll = document.getElementById('btn-autoscroll');
  const btnFontDec = document.getElementById('btn-font-dec');
  const btnFontInc = document.getElementById('btn-font-inc');
  const btnSpeedDec = document.getElementById('btn-speed-dec');
  const btnSpeedInc = document.getElementById('btn-speed-inc');
  const btnOpacityDec = document.getElementById('btn-opacity-dec');
  const btnOpacityInc = document.getElementById('btn-opacity-inc');
  const btnMirror = document.getElementById('btn-mirror');
  const btnCenterTop = document.getElementById('btn-center-top');
  const btnLockNow = document.getElementById('btn-lock-now');
  const btnQuit = document.getElementById('btn-quit');

  const btnSampleScript = document.getElementById('btn-sample-script');
  const btnSaveEditor = document.getElementById('btn-save-editor');

  function sanitizeSettings(rawObj) {
    const merged = { ...defaultSettings, ...(rawObj || {}) };
    merged.fontSize = Math.max(16, Math.min(80, Math.round(Number(merged.fontSize) || 32)));
    merged.bgOpacity = Math.max(0.2, Math.min(0.98, Number(merged.bgOpacity) || 0.84));
    merged.scrollStep = Math.max(20, Math.min(350, Math.round(Number(merged.scrollStep) || 100)));
    merged.autoScrollSpeed = Math.max(10, Math.min(220, Math.round(Number(merged.autoScrollSpeed) || 45)));
    merged.mirrored = Boolean(merged.mirrored);
    return merged;
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!raw) return { ...defaultSettings };
      return sanitizeSettings(JSON.parse(raw));
    } catch {
      return { ...defaultSettings };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Não foi possível salvar configurações:', e);
    }
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
  }

  /**
   * Aplica imediatamente o tamanho da fonte, opacidade, guia de leitura e espelhamento no DOM
   */
  function applyVisualSettings() {
    const px = Math.max(16, Math.min(80, Math.round(Number(settings.fontSize) || 32)));
    settings.fontSize = px;

    // 1. Aplica na variável CSS global e diretamente no container e nos parágrafos
    root.style.setProperty('--font-size', `${px}px`);
    contentEl.style.fontSize = `${px}px`;

    const paragraphs = contentEl.querySelectorAll('.script-paragraph');
    paragraphs.forEach((p) => {
      p.style.fontSize = `${px}px`;
    });

    // 2. Ajusta também o tamanho da letra no Editor de Texto (caso esteja aberto)
    if (scriptTextarea) {
      const editorPx = Math.max(15, Math.min(48, Math.round(px * 0.68)));
      scriptTextarea.style.fontSize = `${editorPx}px`;
    }

    // 3. Ajusta a altura da faixa guia de leitura proporcionalmente à fonte
    if (readingGuide) {
      readingGuide.style.height = `${Math.max(36, Math.round(px * 1.65))}px`;
    }

    // 4. Atualiza labels, badge e slider da UI
    if (fontSizeLabel) {
      fontSizeLabel.textContent = `${px}px`;
    }
    if (fontBadge) {
      fontBadge.textContent = `🔤 ${px}px`;
    }
    if (fontSizeSlider && Number(fontSizeSlider.value) !== px) {
      fontSizeSlider.value = String(px);
    }

    // 5. Opacidade e Espelhamento
    root.style.setProperty('--bg-opacity', settings.bgOpacity.toFixed(2));
    contentEl.classList.toggle('mirrored', Boolean(settings.mirrored));

    if (speedLabel) {
      speedLabel.textContent = isAutoScrolling
        ? `${settings.autoScrollSpeed}px/s`
        : `${settings.scrollStep}px`;
    }
  }

  /**
   * Altera o tamanho da fonte preservando o ponto atual de leitura no roteiro
   */
  function setFontSize(newSize) {
    const oldMaxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    const scrollRatio = oldMaxScroll > 0 ? targetScrollPos / oldMaxScroll : 0;

    const clamped = Math.max(16, Math.min(80, Math.round(Number(newSize) || 32)));
    settings.fontSize = clamped;

    applyVisualSettings();
    saveSettings();

    // Mantém exatamente a mesma linha na altura dos olhos após redimensionar as letras
    const newMaxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    targetScrollPos = Math.max(0, Math.min(newMaxScroll, newMaxScroll * scrollRatio));
    currentScrollPos = targetScrollPos;
    viewport.scrollTop = currentScrollPos;

    updateProgressUI();
    showToast(`🔤 Tamanho da letra: ${clamped}px`);
  }

  function changeFontSize(delta) {
    setFontSize((Number(settings.fontSize) || 32) + delta);
  }

  /**
   * Escapa HTML com segurança e aplica formatação de destaques (*palavra*)
   */
  function formatInlineMarkup(text) {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped.replace(/\*+([^*]+)\*+/g, '<span class="script-highlight">$1</span>');
  }

  /**
   * Renderiza o roteiro no teleprompter com suporte a marcadores de [SLIDE] e contagem de tempo
   */
  function renderScript(rawText) {
    const lines = rawText.replace(/\r\n/g, '\n').split('\n');
    const htmlParts = [];
    const px = settings.fontSize;

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) {
        continue;
      }

      // Detecta marcadores de passagem de slide: [SLIDE ...], --- ou ===
      const slideMatch = trimmed.match(/^\[(.*?)\]$/) || trimmed.match(/^(-{3,}|={3,})$/);
      if (slideMatch) {
        const label =
          trimmed.startsWith('[') && trimmed.endsWith(']')
            ? trimmed.slice(1, -1)
            : 'AVANÇAR SLIDE';
        htmlParts.push(
          `<div class="slide-cue"><span>⏭️</span> <span>${formatInlineMarkup(label)}</span></div>`
        );
      } else {
        htmlParts.push(
          `<p class="script-paragraph" style="font-size: ${px}px">${formatInlineMarkup(trimmed)}</p>`
        );
      }
    }

    contentEl.innerHTML =
      htmlParts.join('') ||
      `<p class="script-paragraph" style="font-size: ${px}px">Roteiro vazio. Pressione <span class="script-highlight">Num 0</span> ou <span class="script-highlight">Alt+L</span> para editar.</p>`;

    // Calcula total de palavras e tempo estimado de fala (~130 palavras por minuto)
    const cleanWords = rawText
      .replace(/\[.*?\]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    const estMinutes = Math.max(1, Math.round(cleanWords / 130));
    wordCountText.textContent = `${cleanWords} palavras (~${estMinutes} min de fala)`;

    applyVisualSettings();
    updateProgressUI();
  }

  /**
   * Atualiza barra de progresso superior e percentual no rodapé
   */
  function updateProgressUI() {
    const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    const pct =
      maxScroll > 0
        ? Math.min(100, Math.max(0, Math.round((viewport.scrollTop / maxScroll) * 100)))
        : 0;
    progressBar.style.width = `${pct}%`;
    progressText.textContent = `Progresso: ${pct}%`;
  }

  /**
   * Motor de rolagem suave em 60fps+ (combina rolagem manual por blocos e Auto-Scroll contínuo)
   */
  function scrollLoop(now) {
    const dt = Math.min(0.1, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);

    if (isAutoScrolling && !isEditorOpen) {
      targetScrollPos = Math.min(maxScroll, targetScrollPos + settings.autoScrollSpeed * dt);
      if (targetScrollPos >= maxScroll && maxScroll > 0) {
        setAutoScroll(false);
        showToast('Fim do roteiro alcançado');
      }
    }

    // Garante que o alvo nunca ultrapasse os limites do documento
    targetScrollPos = Math.max(0, Math.min(maxScroll, targetScrollPos));

    // Interpolação suave
    const diff = targetScrollPos - currentScrollPos;
    if (Math.abs(diff) > 0.35) {
      currentScrollPos += diff * Math.min(1, dt * 14);
      viewport.scrollTop = currentScrollPos;
      updateProgressUI();
    } else if (Math.abs(diff) > 0) {
      currentScrollPos = targetScrollPos;
      viewport.scrollTop = currentScrollPos;
      updateProgressUI();
    }

    requestAnimationFrame(scrollLoop);
  }

  // Sincroniza rolagem com a roda do mouse no Modo Edição, ou Ctrl + Roda do Mouse para Zoom na Fonte
  window.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey || e.altKey) {
        e.preventDefault();
        changeFontSize(e.deltaY < 0 ? 2 : -2);
        return;
      }
      currentScrollPos = viewport.scrollTop;
      targetScrollPos = viewport.scrollTop;
      updateProgressUI();
    },
    { passive: false }
  );

  // Atalhos locais adicionais quando a janela está focada no Modo Edição (Ctrl + + / Ctrl + -)
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd')) {
      e.preventDefault();
      changeFontSize(4);
    } else if (e.ctrlKey && (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract')) {
      e.preventDefault();
      changeFontSize(-4);
    }
  });

  /**
   * Executa um passo de rolagem suave (Passo 4.5: ex. +100px para baixo ou -100px para cima)
   */
  function stepScroll(direction) {
    const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    const delta = direction * settings.scrollStep;
    targetScrollPos = Math.max(0, Math.min(maxScroll, targetScrollPos + delta));
    showToast(
      direction > 0 ? `▼ Descer (+${settings.scrollStep}px)` : `▲ Subir (-${settings.scrollStep}px)`
    );
  }

  function setAutoScroll(active) {
    isAutoScrolling = Boolean(active);
    autoscrollBadge.textContent = isAutoScrolling
      ? `▶ AUTO (${settings.autoScrollSpeed}px/s)`
      : '⏸ MANUAL';
    autoscrollBadge.className = isAutoScrolling ? 'badge badge-active' : 'badge badge-neutral';

    if (btnAutoscroll) {
      btnAutoscroll.textContent = isAutoScrolling ? '⏸ Pausar' : '▶ Auto';
    }
    applyVisualSettings();
  }

  function resetScrollToTop() {
    setAutoScroll(false);
    targetScrollPos = 0;
    showToast('⏮ Topo do roteiro');
  }

  /**
   * Abre ou fecha o editor de texto inline (disponível no Modo Edição)
   */
  function toggleEditor(forceState) {
    isEditorOpen = typeof forceState === 'boolean' ? forceState : !isEditorOpen;
    if (isEditorOpen) {
      setAutoScroll(false);
      scriptTextarea.value = currentScript;
      editorPanel.classList.remove('hidden');
      scriptTextarea.focus();
      btnToggleEditor.textContent = '👁 Ver Prompter';
    } else {
      editorPanel.classList.add('hidden');
      btnToggleEditor.textContent = '📝 Editar Texto';
    }
  }

  function saveEditorContent() {
    currentScript = scriptTextarea.value;
    localStorage.setItem(STORAGE_KEY_SCRIPT, currentScript);
    renderScript(currentScript);
    toggleEditor(false);
    resetScrollToTop();
    showToast('✓ Roteiro salvo');
  }

  /**
   * Atualiza a interface quando o estado da janela muda no Main Process
   */
  function applyWindowStateUI(state) {
    windowState = { ...windowState, ...state };

    if (windowState.isLocked) {
      body.classList.add('is-locked');
      body.classList.remove('is-unlocked');
      modeBadge.textContent = '🔒 FOCO-SEGURO (CLICK-THROUGH)';
      modeBadge.className = 'badge badge-locked';
      if (isEditorOpen) {
        saveEditorContent();
      }
      showToast('🔒 Modo Apresentação Ativo (Cliques vazam p/ o Slide)');
    } else {
      body.classList.remove('is-locked');
      body.classList.add('is-unlocked');
      modeBadge.textContent = '✏️ MODO EDIÇÃO & MOVER (DESTRAVADO)';
      modeBadge.className = 'badge badge-unlocked';
      showToast('✏️ Modo Edição: Use A-/A+ ou arraste pelo ícone ⠿ à esquerda');
    }

    if (windowState.contentProtection) {
      protectionBadge.textContent = '🛡️ OCULTO NA CAPTURA';
      protectionBadge.style.opacity = '1';
    } else {
      protectionBadge.textContent = '👁 VISÍVEL NA CAPTURA';
      protectionBadge.style.opacity = '0.65';
    }

    if (numpadBadge) {
      numpadBadge.classList.toggle('hidden', Boolean(windowState.numpadEnabled));
    }
  }

  /**
   * Trata comandos vindos dos atalhos globais registrados no main.js
   */
  function handleCommand({ action }) {
    switch (action) {
      case 'scroll-down':
        stepScroll(1);
        break;
      case 'scroll-up':
        stepScroll(-1);
        break;
      case 'toggle-autoscroll':
        setAutoScroll(!isAutoScrolling);
        showToast(isAutoScrolling ? '▶ Auto-Scroll Iniciado' : '⏸ Auto-Scroll Pausado');
        break;
      case 'speed-up':
        if (isAutoScrolling) {
          settings.autoScrollSpeed = Math.min(220, settings.autoScrollSpeed + 10);
          setAutoScroll(true);
          showToast(`Velocidade Auto: ${settings.autoScrollSpeed}px/s`);
        } else {
          settings.scrollStep = Math.min(350, settings.scrollStep + 20);
          applyVisualSettings();
          showToast(`Passo Manual: ${settings.scrollStep}px`);
        }
        saveSettings();
        break;
      case 'speed-down':
        if (isAutoScrolling) {
          settings.autoScrollSpeed = Math.max(10, settings.autoScrollSpeed - 10);
          setAutoScroll(true);
          showToast(`Velocidade Auto: ${settings.autoScrollSpeed}px/s`);
        } else {
          settings.scrollStep = Math.max(20, settings.scrollStep - 20);
          applyVisualSettings();
          showToast(`Passo Manual: ${settings.scrollStep}px`);
        }
        saveSettings();
        break;
      case 'reset-scroll':
        resetScrollToTop();
        break;
      case 'font-increase':
        changeFontSize(4);
        break;
      case 'font-decrease':
        changeFontSize(-4);
        break;
      case 'opacity-increase':
        settings.bgOpacity = Math.min(0.98, +(settings.bgOpacity + 0.08).toFixed(2));
        applyVisualSettings();
        saveSettings();
        showToast(`Opacidade: ${Math.round(settings.bgOpacity * 100)}%`);
        break;
      case 'opacity-decrease':
        settings.bgOpacity = Math.max(0.2, +(settings.bgOpacity - 0.08).toFixed(2));
        applyVisualSettings();
        saveSettings();
        showToast(`Opacidade: ${Math.round(settings.bgOpacity * 100)}%`);
        break;
      default:
        break;
    }
  }

  // --- EVENTOS DOS BOTÕES DO MODO EDIÇÃO ---
  btnLoadFile.addEventListener('click', async () => {
    await window.teleprompterAPI.openFileDialog();
  });

  btnToggleEditor.addEventListener('click', () => {
    if (isEditorOpen) {
      saveEditorContent();
    } else {
      toggleEditor(true);
    }
  });

  btnSaveEditor.addEventListener('click', () => {
    saveEditorContent();
  });

  btnSampleScript.addEventListener('click', () => {
    scriptTextarea.value = DEFAULT_SCRIPT;
  });

  btnResetScroll.addEventListener('click', () => resetScrollToTop());
  btnAutoscroll.addEventListener('click', () => handleCommand({ action: 'toggle-autoscroll' }));
  btnFontDec.addEventListener('click', () => changeFontSize(-4));
  btnFontInc.addEventListener('click', () => changeFontSize(4));

  if (fontSizeSlider) {
    fontSizeSlider.addEventListener('input', (e) => {
      setFontSize(Number(e.target.value));
    });
  }

  btnSpeedDec.addEventListener('click', () => handleCommand({ action: 'speed-down' }));
  btnSpeedInc.addEventListener('click', () => handleCommand({ action: 'speed-up' }));
  btnOpacityDec.addEventListener('click', () => handleCommand({ action: 'opacity-decrease' }));
  btnOpacityInc.addEventListener('click', () => handleCommand({ action: 'opacity-increase' }));

  btnMirror.addEventListener('click', () => {
    settings.mirrored = !settings.mirrored;
    applyVisualSettings();
    saveSettings();
    showToast(settings.mirrored ? '⇄ Texto Espelhado' : '⇄ Texto Normal');
  });

  btnCenterTop.addEventListener('click', () => {
    window.teleprompterAPI.resetPosition();
    showToast('🎯 Centralizado perto da Webcam');
  });

  btnLockNow.addEventListener('click', () => {
    window.teleprompterAPI.setLocked(true);
  });

  btnQuit.addEventListener('click', () => {
    window.teleprompterAPI.quitApp();
  });

  protectionBadge.addEventListener('click', () => {
    if (!windowState.isLocked) {
      window.teleprompterAPI.setContentProtection(!windowState.contentProtection);
    }
  });

  // Suporte a Arrastar e Soltar (Drag & Drop) de arquivos .txt / .md quando no Modo Edição
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (text) {
      currentScript = text;
      localStorage.setItem(STORAGE_KEY_SCRIPT, currentScript);
      renderScript(currentScript);
      if (isEditorOpen) {
        scriptTextarea.value = currentScript;
      }
      resetScrollToTop();
      showToast(`📂 Carregado: ${file.name}`);
    }
  });

  // --- CONEXÃO COM A PONTE SEGURA DO PRELOAD.JS ---
  if (window.teleprompterAPI) {
    window.teleprompterAPI.onCommand((payload) => {
      handleCommand(payload);
    });

    window.teleprompterAPI.onStateChange((state) => {
      applyWindowStateUI(state);
    });

    window.teleprompterAPI.onFileLoaded((fileData) => {
      if (fileData && typeof fileData.content === 'string') {
        currentScript = fileData.content;
        localStorage.setItem(STORAGE_KEY_SCRIPT, currentScript);
        renderScript(currentScript);
        if (isEditorOpen) {
          scriptTextarea.value = currentScript;
        }
        resetScrollToTop();
        showToast(`📂 Roteiro: ${fileData.fileName}`);
      }
    });

    window.teleprompterAPI.getState().then((initialState) => {
      if (initialState) {
        applyWindowStateUI(initialState);
      }
    });
  }

  // Inicialização
  applyVisualSettings();
  renderScript(currentScript);
  requestAnimationFrame(scrollLoop);
})();
