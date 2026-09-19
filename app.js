(() => {
  'use strict';

  const bootScreen = document.getElementById('bootScreen');
  const desktop = document.getElementById('desktop');
  const startBtn = document.getElementById('startBtn');
  const startMenu = document.getElementById('startMenu');
  const appSearch = document.getElementById('appSearch');
  const startApps = [...document.querySelectorAll('.start-app')];
  const windows = [...document.querySelectorAll('.os-window')];
  const taskbarButtons = [...document.querySelectorAll('.taskbar-button[data-open]')];
  const clockTime = document.getElementById('clockTime');
  const clockDate = document.getElementById('clockDate');
  const toast = document.getElementById('toast');

  let zCounter = 30;
  let toastTimer;

  const fileData = {
    home: {
      title: 'الرئيسية',
      items: [
        ['📄', 'مرحباً.txt'],
        ['📁', 'المستندات'],
        ['💻', 'المشاريع'],
        ['🖼️', 'الصور']
      ]
    },
    documents: {
      title: 'المستندات',
      items: [
        ['📄', 'أفكار Vertex.txt'],
        ['📄', 'خطة 2026.txt'],
        ['📄', 'ملاحظات.txt']
      ]
    },
    projects: {
      title: 'المشاريع',
      items: [
        ['🌐', 'Vertex Systems AI'],
        ['🤖', 'Vertex AI'],
        ['🎮', 'Vertex Games'],
        ['🕳️', 'Black Hole Simulator'],
        ['💻', 'Vertex OS']
      ]
    },
    pictures: {
      title: 'الصور',
      items: [
        ['🖼️', 'wallpaper-01'],
        ['🌌', 'space'],
        ['🎨', 'vertex-logo']
      ]
    }
  };

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function getWindow(name) {
    return document.querySelector('[data-window="' + name + '"]');
  }

  function syncTaskbar() {
    taskbarButtons.forEach(button => {
      const win = getWindow(button.dataset.open);
      button.classList.toggle('active', Boolean(win && win.classList.contains('open') && !win.classList.contains('minimized')));
    });
  }

  function focusWindow(win) {
    zCounter += 1;
    win.style.zIndex = String(zCounter);
    syncTaskbar();
  }

  function openWindow(name) {
    const win = getWindow(name);
    if (!win) return;

    win.classList.add('open');
    win.classList.remove('minimized');
    win.setAttribute('aria-hidden', 'false');
    focusWindow(win);
    closeStartMenu();

    if (name === 'terminal') {
      setTimeout(() => document.getElementById('terminalInput').focus(), 80);
    }
  }

  function closeWindow(win) {
    win.classList.remove('open', 'minimized');
    win.setAttribute('aria-hidden', 'true');
    syncTaskbar();
  }

  function minimizeWindow(win) {
    win.classList.add('minimized');
    syncTaskbar();
  }

  function toggleStartMenu() {
    const opening = !startMenu.classList.contains('open');
    startMenu.classList.toggle('open', opening);
    startMenu.setAttribute('aria-hidden', String(!opening));
    startBtn.classList.toggle('active', opening);
    if (opening) setTimeout(() => appSearch.focus(), 80);
  }

  function closeStartMenu() {
    startMenu.classList.remove('open');
    startMenu.setAttribute('aria-hidden', 'true');
    startBtn.classList.remove('active');
  }

  document.querySelectorAll('[data-open]').forEach(button => {
    button.addEventListener('click', () => openWindow(button.dataset.open));
  });

  windows.forEach(win => {
    win.querySelectorAll('[data-close]').forEach(button => {
      button.addEventListener('click', () => closeWindow(win));
    });

    win.querySelectorAll('[data-minimize]').forEach(button => {
      button.addEventListener('click', () => minimizeWindow(win));
    });

    win.addEventListener('pointerdown', () => focusWindow(win));

    const titlebar = win.querySelector('.window-titlebar');
    if (!titlebar) return;

    titlebar.addEventListener('pointerdown', event => {
      if (event.target.closest('button')) return;
      if (window.innerWidth <= 720) return;

      focusWindow(win);

      const rect = win.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      win.classList.add('free-position');
      win.style.left = rect.left + 'px';
      win.style.top = rect.top + 'px';

      titlebar.setPointerCapture(event.pointerId);

      const move = moveEvent => {
        const maxLeft = window.innerWidth - Math.min(220, rect.width);
        const maxTop = window.innerHeight - 100;
        const left = Math.max(-rect.width + 220, Math.min(maxLeft, moveEvent.clientX - offsetX));
        const top = Math.max(0, Math.min(maxTop, moveEvent.clientY - offsetY));

        win.style.left = left + 'px';
        win.style.top = top + 'px';
      };

      const up = upEvent => {
        titlebar.removeEventListener('pointermove', move);
        titlebar.removeEventListener('pointerup', up);
        titlebar.removeEventListener('pointercancel', up);
        if (titlebar.hasPointerCapture(upEvent.pointerId)) titlebar.releasePointerCapture(upEvent.pointerId);
      };

      titlebar.addEventListener('pointermove', move);
      titlebar.addEventListener('pointerup', up);
      titlebar.addEventListener('pointercancel', up);
    });
  });

  taskbarButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      const win = getWindow(button.dataset.open);
      if (!win) return;

      if (win.classList.contains('open') && !win.classList.contains('minimized')) {
        minimizeWindow(win);
      } else {
        openWindow(button.dataset.open);
      }
    });
  });

  startBtn.addEventListener('click', event => {
    event.stopPropagation();
    toggleStartMenu();
  });

  startMenu.addEventListener('click', event => event.stopPropagation());
  desktop.addEventListener('click', () => closeStartMenu());

  appSearch.addEventListener('input', () => {
    const q = appSearch.value.trim().toLowerCase();
    startApps.forEach(app => {
      app.hidden = !app.dataset.name.toLowerCase().includes(q);
    });
  });

  const fileGrid = document.getElementById('fileGrid');
  const folderTitle = document.getElementById('folderTitle');
  const folderCount = document.getElementById('folderCount');

  function renderFolder(folder) {
    const data = fileData[folder];
    if (!data) return;

    folderTitle.textContent = data.title;
    folderCount.textContent = data.items.length + ' عناصر';
    fileGrid.replaceChildren();

    data.items.forEach(([icon, name]) => {
      const item = document.createElement('button');
      item.className = 'file-item';
      item.type = 'button';

      const iconEl = document.createElement('span');
      iconEl.textContent = icon;
      const nameEl = document.createElement('strong');
      nameEl.textContent = name;

      item.append(iconEl, nameEl);
      item.addEventListener('dblclick', () => showToast('فتح ' + name));
      fileGrid.appendChild(item);
    });
  }

  document.querySelectorAll('.file-location').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.file-location').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      renderFolder(button.dataset.folder);
    });
  });

  renderFolder('home');

  const notesArea = document.getElementById('notesArea');
  const notesStatus = document.getElementById('notesStatus');
  notesArea.value = localStorage.getItem('vertexOSNotes') || '';

  let notesSaveTimer;
  notesArea.addEventListener('input', () => {
    notesStatus.textContent = 'جاري الحفظ...';
    clearTimeout(notesSaveTimer);
    notesSaveTimer = setTimeout(() => {
      localStorage.setItem('vertexOSNotes', notesArea.value);
      notesStatus.textContent = 'محفوظ تلقائياً';
    }, 350);
  });

  const calcExpression = document.getElementById('calcExpression');
  const calcResult = document.getElementById('calcResult');
  let calcValue = '';

  function tokenize(expression) {
    const tokens = expression.match(/\d*\.?\d+|[()+\-*/]/g) || [];
    return tokens.join('') === expression.replace(/\s+/g, '') ? tokens : null;
  }

  function calculateExpression(expression) {
    const tokens = tokenize(expression);
    if (!tokens) throw new Error('invalid');
    let index = 0;

    function parseExpression() {
      let value = parseTerm();
      while (tokens[index] === '+' || tokens[index] === '-') {
        const op = tokens[index++];
        const right = parseTerm();
        value = op === '+' ? value + right : value - right;
      }
      return value;
    }

    function parseTerm() {
      let value = parseFactor();
      while (tokens[index] === '*' || tokens[index] === '/') {
        const op = tokens[index++];
        const right = parseFactor();
        if (op === '/' && right === 0) throw new Error('zero');
        value = op === '*' ? value * right : value / right;
      }
      return value;
    }

    function parseFactor() {
      if (tokens[index] === '-') {
        index++;
        return -parseFactor();
      }
      if (tokens[index] === '(') {
        index++;
        const value = parseExpression();
        if (tokens[index] !== ')') throw new Error('paren');
        index++;
        return value;
      }
      const value = Number(tokens[index++]);
      if (!Number.isFinite(value)) throw new Error('number');
      return value;
    }

    const result = parseExpression();
    if (index !== tokens.length || !Number.isFinite(result)) throw new Error('invalid');
    return result;
  }

  document.querySelectorAll('[data-calc]').forEach(button => {
    button.addEventListener('click', () => {
      const value = button.dataset.calc;

      if (value === 'clear') {
        calcValue = '';
        calcExpression.textContent = '0';
        calcResult.textContent = '0';
        return;
      }

      if (value === 'equals') {
        if (!calcValue) return;
        try {
          const result = calculateExpression(calcValue);
          calcExpression.textContent = calcValue;
          calcResult.textContent = String(Number(result.toFixed(10)));
          calcValue = String(result);
        } catch {
          calcResult.textContent = 'خطأ';
        }
        return;
      }

      if (calcValue.length >= 40) return;
      calcValue += value;
      calcExpression.textContent = calcValue;
    });
  });

  const terminalOutput = document.getElementById('terminalOutput');
  const terminalForm = document.getElementById('terminalForm');
  const terminalInput = document.getElementById('terminalInput');

  function terminalLine(text, type) {
    const line = document.createElement('div');
    line.className = 'terminal-line' + (type ? ' ' + type : '');
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function terminalWelcome() {
    terminalLine('Vertex OS Terminal 1.0', 'info');
    terminalLine('Type "help" to see available commands.', 'muted');
    terminalLine('');
  }

  function runCommand(raw) {
    const command = raw.trim();
    const lower = command.toLowerCase();
    terminalLine('vertex@os:~$ ' + command);

    if (!command) return;
    if (lower === 'help') {
      terminalLine('help   clear   date   about   apps   echo [text]   open [app]', 'info');
    } else if (lower === 'clear') {
      terminalOutput.replaceChildren();
    } else if (lower === 'date') {
      terminalLine(new Date().toLocaleString('ar-SA'));
    } else if (lower === 'about') {
      terminalLine('Vertex OS 1.0 — Web operating system by Vertex Systems AI.');
    } else if (lower === 'apps') {
      terminalLine('files, calculator, notes, terminal, settings, about');
    } else if (lower.startsWith('echo ')) {
      terminalLine(command.slice(5));
    } else if (lower.startsWith('open ')) {
      const app = lower.slice(5).trim();
      const aliases = {
        files:'files',
        calculator:'calculator',
        calc:'calculator',
        notes:'notes',
        terminal:'terminal',
        settings:'settings',
        about:'about'
      };
      if (aliases[app]) {
        openWindow(aliases[app]);
        terminalLine('Opening ' + app + '...', 'info');
      } else {
        terminalLine('App not found: ' + app, 'error');
      }
    } else {
      terminalLine('Command not found: ' + command, 'error');
    }
  }

  terminalForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = terminalInput.value;
    terminalInput.value = '';
    runCommand(value);
  });

  terminalWelcome();

  document.querySelectorAll('[data-theme]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      document.body.classList.toggle('midnight', button.dataset.theme === 'midnight');
      localStorage.setItem('vertexOSTheme', button.dataset.theme);
    });
  });

  document.querySelectorAll('[data-wallpaper]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-wallpaper]').forEach(b => b.classList.remove('active'));
      button.classList.add('active');

      desktop.classList.remove('wallpaper-space', 'wallpaper-grid');
      if (button.dataset.wallpaper === 'space') desktop.classList.add('wallpaper-space');
      if (button.dataset.wallpaper === 'grid') desktop.classList.add('wallpaper-grid');

      localStorage.setItem('vertexOSWallpaper', button.dataset.wallpaper);
    });
  });

  function restoreAppearance() {
    const theme = localStorage.getItem('vertexOSTheme') || 'dark';
    const wallpaper = localStorage.getItem('vertexOSWallpaper') || 'aurora';

    document.body.classList.toggle('midnight', theme === 'midnight');
    document.querySelectorAll('[data-theme]').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));

    desktop.classList.remove('wallpaper-space', 'wallpaper-grid');
    if (wallpaper === 'space') desktop.classList.add('wallpaper-space');
    if (wallpaper === 'grid') desktop.classList.add('wallpaper-grid');
    document.querySelectorAll('[data-wallpaper]').forEach(b => b.classList.toggle('active', b.dataset.wallpaper === wallpaper));
  }

  document.getElementById('aboutBtn').addEventListener('click', () => openWindow('about'));

  document.getElementById('restartBtn').addEventListener('click', () => {
    closeStartMenu();
    windows.forEach(closeWindow);
    bootScreen.classList.remove('hidden');
    setTimeout(() => bootScreen.classList.add('hidden'), 1200);
  });

  function updateClock() {
    const now = new Date();
    clockTime.textContent = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    clockDate.textContent = now.toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  updateClock();
  setInterval(updateClock, 1000);
  restoreAppearance();

  setTimeout(() => {
    bootScreen.classList.add('hidden');
    showToast('مرحباً بك في Vertex OS');
  }, 1250);
})();