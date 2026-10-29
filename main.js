const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  dialog,
  screen,
  Tray,
  Menu,
  nativeImage
} = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;

// Estado central do Teleprompter no Main Process
const appState = {
  isLocked: true,           // true = Modo Apresentação (Focus-Safe + Click-Through); false = Modo Edição/Mover
  isHidden: false,          // true = Janela oculta temporariamente (Alt+H)
  contentProtection: true,  // true = Invisível em capturas de tela / Zoom / Meet / OBS
  numpadEnabled: true       // true = Atalhos do Numpad ativos; false = Pausados para digitar números em outros apps
};

/**
 * Gera um ícone em DataURL (SVG -> PNG via nativeImage ou bitmap 16x16) para a bandeja do sistema (System Tray)
 */
function createTrayIcon() {
  const icoFile = path.join(__dirname, 'teleprompter.ico');
  if (fs.existsSync(icoFile)) {
    return nativeImage.createFromPath(icoFile);
  }
  // Fallback PNG 16x16 em base64
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAaklEQVQ4T2NkoBAwUqifYdQABgYGBgZ0/f//f3R1dAwMDPgM+P//P7o6XAbgM4CugZGBgYGRkZGB4f///8T4AC8g2gC8BtA1MDIyMjD8//+fGB/gBfj4ADE+IGwAXgOIGkB0cAAAt64dEd8d264AAAAASUVORK5CYII=';
  return nativeImage.createFromDataURL(`data:image/png;base64,${pngBase64}`);
}

/**
 * Posiciona a janela centralizada no topo do monitor principal (logo abaixo da webcam)
 */
function positionNearWebcam(win) {
  if (!win || win.isDestroyed()) return;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;
  const { x: workAreaX, y: workAreaY } = primaryDisplay.workArea;
  const [winWidth] = win.getSize();

  const targetX = Math.round(workAreaX + (screenWidth - winWidth) / 2);
  const targetY = workAreaY + 12;
  win.setPosition(targetX, targetY);
}

/**
 * Aplica rigorosamente as propriedades Focus-Safe e Click-Through na janela
 */
function applyWindowMode() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  if (appState.isLocked) {
    // Se a janela estava focada no modo edição, devolve o foco ao sistema operacional antes de travar
    if (mainWindow.isFocused()) {
      mainWindow.blur();
    }
    mainWindow.setFocusable(false);
    // forward: true permite que o movimento do mouse também passe para a janela de trás
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    // 'screen-saver' garante sobreposição mesmo sobre PowerPoint / Google Slides em Tela Cheia
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  } else {
    // Modo Edição / Posicionamento: permite clicar, arrastar, redimensionar e digitar o roteiro
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.setFocusable(true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.focus();
  }

  mainWindow.setContentProtection(appState.contentProtection);
  broadcastState();
  updateTrayMenu();
}

/**
 * Envia o estado atualizado para o Renderer Process
 */
function broadcastState() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('tp:state-change', { ...appState });
  }
}

/**
 * Envia um comando de controle (scroll, velocidade, fonte, etc.) ao Renderer Process
 */
function sendCommand(action, value = null) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('tp:command', { action, value });
  }
}

/**
 * Registra (ou atualiza) todos os atalhos globais de teclado
 */
function registerShortcuts() {
  globalShortcut.unregisterAll();

  const safeRegister = (accelerator, handler) => {
    try {
      globalShortcut.register(accelerator, handler);
    } catch (err) {
      console.warn(`Não foi possível registrar o atalho ${accelerator}:`, err.message);
    }
  };

  // --- ATALHOS DO NUMPAD (quando habilitados) ---
  if (appState.numpadEnabled) {
    // Passo 4.3 do Plano: Numpad 2 para rolar para baixo; Numpad 8 ou Numpad 6 para rolar para cima
    safeRegister('num2', () => sendCommand('scroll-down'));
    safeRegister('num8', () => sendCommand('scroll-up'));
    safeRegister('num6', () => sendCommand('scroll-up'));

    // Controles extras no Numpad para fluidez durante a apresentação
    safeRegister('num5', () => sendCommand('toggle-autoscroll'));
    safeRegister('numadd', () => sendCommand('speed-up'));
    safeRegister('numsub', () => sendCommand('speed-down'));
    safeRegister('num1', () => sendCommand('reset-scroll'));
    safeRegister('num9', () => sendCommand('font-increase'));
    safeRegister('num7', () => sendCommand('font-decrease'));
    safeRegister('num3', () => sendCommand('opacity-increase'));
    safeRegister('num4', () => sendCommand('opacity-decrease'));
    safeRegister('num0', () => toggleLockMode());
  }

  // --- ATALHOS ALTERNATIVOS COM MODIFICADOR ALT (para teclados sem Numpad ou NumLock desligado) ---
  // Nota: NUNCA registramos as setas puras (Up/Down/Left/Right) para não interferir na passagem de slides!
  safeRegister('Alt+Down', () => sendCommand('scroll-down'));
  safeRegister('Alt+Up', () => sendCommand('scroll-up'));
  safeRegister('Alt+P', () => sendCommand('toggle-autoscroll'));
  safeRegister('Alt+Right', () => sendCommand('speed-up'));
  safeRegister('Alt+Left', () => sendCommand('speed-down'));
  safeRegister('Alt+Home', () => sendCommand('reset-scroll'));

  // Atalhos universais para Aumentar / Diminuir Fonte (compatíveis com teclado ABNT2 e US)
  safeRegister('Alt+.', () => sendCommand('font-increase'));
  safeRegister('Alt+,', () => sendCommand('font-decrease'));
  safeRegister('Alt+PageUp', () => sendCommand('font-increase'));
  safeRegister('Alt+PageDown', () => sendCommand('font-decrease'));
  safeRegister('CommandOrControl+Shift+Up', () => sendCommand('font-increase'));
  safeRegister('CommandOrControl+Shift+Down', () => sendCommand('font-decrease'));

  // Alternar entre Modo Apresentação (Foco-Seguro) e Modo Edição (Destravado)
  safeRegister('Alt+L', () => toggleLockMode());

  // Pausar/Retomar captura do Numpad (útil se precisar digitar números em outro app sem fechar o prompter)
  safeRegister('Alt+K', () => {
    appState.numpadEnabled = !appState.numpadEnabled;
    registerShortcuts();
    broadcastState();
    updateTrayMenu();
  });

  // Ocultar/Mostrar rapidamente a janela do Teleprompter
  safeRegister('Alt+H', () => toggleVisibility());

  // Fechar o aplicativo com segurança
  safeRegister('CommandOrControl+Shift+Q', () => {
    app.quit();
  });
}

function toggleLockMode() {
  appState.isLocked = !appState.isLocked;
  applyWindowMode();
}

function toggleVisibility() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (appState.isHidden) {
    mainWindow.showInactive();
    appState.isHidden = false;
    applyWindowMode();
  } else {
    mainWindow.hide();
    appState.isHidden = true;
    broadcastState();
    updateTrayMenu();
  }
}

/**
 * Abre diálogo nativo para importar arquivo .txt ou .md de roteiro
 */
async function handleOpenFileDialog() {
  if (!mainWindow || mainWindow.isDestroyed()) return null;

  const result = await dialog.showOpenDialog({
    title: 'Carregar Roteiro do Teleprompter',
    filters: [
      { name: 'Arquivos de Texto / Markdown', extensions: ['txt', 'md'] },
      { name: 'Todos os Arquivos', extensions: ['*'] }
    ],
    properties: ['openFile']
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const payload = {
      filePath,
      fileName: path.basename(filePath),
      content
    };
    mainWindow.webContents.send('tp:file-loaded', payload);
    return payload;
  } catch (err) {
    console.error('Erro ao ler arquivo de roteiro:', err);
    return null;
  }
}

/**
 * Cria menu na Bandeja do Sistema (System Tray) para controle garantido
 */
function setupTray() {
  try {
    tray = new Tray(createTrayIcon());
    tray.setToolTip('Teleprompter Overlay (Focus-Safe)');
    tray.on('click', () => {
      toggleLockMode();
    });
    updateTrayMenu();
  } catch (err) {
    console.warn('Tray não pôde ser inicializado:', err.message);
  }
}

function updateTrayMenu() {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: appState.isLocked
        ? '🔒 Modo Apresentação (Foco-Seguro Ativo)'
        : '✏️ Modo Edição (Clique & Foco Liberados)',
      enabled: false
    },
    { type: 'separator' },
    {
      label: appState.isLocked
        ? 'Destravar para Editar / Mover (Num 0 ou Alt+L)'
        : 'Travar para Apresentação Focus-Safe (Num 0 ou Alt+L)',
      click: () => toggleLockMode()
    },
    {
      label: 'Play / Pause Auto-Scroll (Num 5 ou Alt+P)',
      click: () => sendCommand('toggle-autoscroll')
    },
    {
      label: 'Voltar ao Início do Roteiro (Num 1 ou Alt+Home)',
      click: () => sendCommand('reset-scroll')
    },
    {
      label: 'Aumentar Letras / Fonte (Num 9 ou Alt+.)',
      click: () => sendCommand('font-increase')
    },
    {
      label: 'Diminuir Letras / Fonte (Num 7 ou Alt+,)',
      click: () => sendCommand('font-decrease')
    },
    {
      label: 'Importar Roteiro (.txt / .md)...',
      click: () => handleOpenFileDialog()
    },
    { type: 'separator' },
    {
      label: 'Atalhos do Numpad Ativos (Alt+K)',
      type: 'checkbox',
      checked: appState.numpadEnabled,
      click: (menuItem) => {
        appState.numpadEnabled = menuItem.checked;
        registerShortcuts();
        broadcastState();
      }
    },
    {
      label: 'Invisível no Zoom/Meet/OBS (Proteção de Captura)',
      type: 'checkbox',
      checked: appState.contentProtection,
      click: (menuItem) => {
        appState.contentProtection = menuItem.checked;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.setContentProtection(appState.contentProtection);
        }
        broadcastState();
      }
    },
    {
      label: appState.isHidden ? 'Mostrar Teleprompter (Alt+H)' : 'Ocultar Teleprompter (Alt+H)',
      click: () => toggleVisibility()
    },
    {
      label: 'Reposicionar no Topo (Perto da Webcam)',
      click: () => positionNearWebcam(mainWindow)
    },
    { type: 'separator' },
    {
      label: 'Sair do Teleprompter (Ctrl+Shift+Q)',
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(contextMenu);
}

/**
 * Cria a janela principal com as propriedades Focus-Safe do Passo 4.2
 */
function createWindow() {
  const icoFile = path.join(__dirname, 'teleprompter.ico');
  mainWindow = new BrowserWindow({
    width: 860,
    height: 310,
    minWidth: 420,
    minHeight: 160,
    icon: fs.existsSync(icoFile) ? icoFile : undefined,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    focusable: false, // Crítico: nasce sem roubar foco do sistema operacional
    hasShadow: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  positionNearWebcam(mainWindow);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    applyWindowMode();
  });

  // Garante que ao concluir o carregamento da página o estado inicial seja enviado ao front-end
  mainWindow.webContents.on('did-finish-load', () => {
    applyWindowMode();
    if (process.argv.includes('--smoke-test')) {
      console.log('SMOKE_TEST_OK: Janela Focus-Safe carregada e atalhos registrados com sucesso.');
      setTimeout(() => app.quit(), 400);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// --- HANDLERS IPC (Main <-> Renderer) ---
ipcMain.handle('tp:get-state', () => {
  return { ...appState };
});

ipcMain.handle('tp:set-locked', (_event, locked) => {
  appState.isLocked = Boolean(locked);
  applyWindowMode();
  return { ...appState };
});

ipcMain.handle('tp:toggle-lock', () => {
  toggleLockMode();
  return { ...appState };
});

ipcMain.handle('tp:set-content-protection', (_event, enabled) => {
  appState.contentProtection = Boolean(enabled);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setContentProtection(appState.contentProtection);
  }
  broadcastState();
  updateTrayMenu();
  return { ...appState };
});

ipcMain.handle('tp:open-file-dialog', async () => {
  return await handleOpenFileDialog();
});

ipcMain.handle('tp:reset-position', () => {
  positionNearWebcam(mainWindow);
  return true;
});

ipcMain.on('tp:quit', () => {
  app.quit();
});

// --- CICLO DE VIDA DO APP ---
app.whenReady().then(() => {
  createWindow();
  setupTray();
  registerShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Passo 5 (Edge Cases): Limpeza obrigatória de atalhos ao fechar para devolver o Numpad ao SO
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
