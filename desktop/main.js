// SkillQuest for Windows: the game from skillquestmmo.com in its own window.
// It always loads the live site, so game updates arrive by themselves. With no internet it falls back to the copy
// bundled with the app (offline play, saved on this PC). Google won't sign in inside app windows, so signing in opens
// your normal browser, which hands the sign-in back to the game on this PC.
const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const http = require('http');
const path = require('path');
const crypto = require('crypto');

const SITE = 'https://skillquestmmo.com/';
const HOST = 'skillquestmmo.com';
let win = null;

if (!app.requestSingleInstanceLock()) { app.quit(); }
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

function create() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 640, minHeight: 400,
    title: 'SkillQuest', backgroundColor: '#1a2a1a', icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, backgroundThrottling: false }
  });
  win.loadURL(SITE + '?app=win');
  // no internet: play the bundled copy
  win.webContents.on('did-fail-load', (e, code, desc, url, isMain) => {
    if (isMain && code !== -3 && !String(url).startsWith('file:')) win.loadFile(path.join(__dirname, 'offline', 'index.html'), { query: { app: 'win', offline: '1' } });
  });
  // links to other sites open in your browser
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => {
    try { const u = new URL(url); if (u.protocol === 'file:' || u.hostname === HOST) return; } catch (_) {}
    e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url);
  });
  win.webContents.on('page-title-updated', e => e.preventDefault());
  // no page scrollbar on the game window
  win.webContents.on('did-finish-load', () => { win.webContents.insertCSS('html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}html,body{overscroll-behavior:none}'); });
  // F11 full screen, Ctrl+R / F5 reload, Ctrl+Shift+I developer tools
  win.webContents.on('before-input-event', (e, i) => {
    if (i.type !== 'keyDown') return;
    if (i.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    else if (i.key === 'F5' || (i.control && i.key.toLowerCase() === 'r')) { win.reload(); e.preventDefault(); }
    else if (i.control && i.shift && i.key.toLowerCase() === 'i') { win.webContents.toggleDevTools(); e.preventDefault(); }
  });
}

// ---- Google sign-in through your browser ----
// We listen on this PC only (127.0.0.1) on a random port, open skillquestmmo.com/?desktop=PORT&st=CODE in your browser,
// the site signs you in with Google there, then sends your browser to http://127.0.0.1:PORT/cb with the sign-in.
let pending = null;
ipcMain.handle('sq-signin', async () => {
  if (pending) { try { pending.cancel(); } catch (_) {} }
  const st = crypto.randomBytes(16).toString('hex');
  const page = require('fs').readFileSync(path.join(__dirname, 'signin.html'), 'utf8');
  return await new Promise((resolve) => {
    let done = false;
    const finish = (r) => { if (done) return; done = true; clearTimeout(timer); setTimeout(() => server.close(), 1500); pending = null; if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } resolve(r); };
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, 'http://127.0.0.1');
      if (req.method === 'GET' && u.pathname === '/cb') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(page); return; }
      if (req.method === 'POST' && u.pathname === '/token') {
        let body = ''; req.on('data', c => { body += c; if (body.length > 20000) req.destroy(); });
        req.on('end', () => {
          let d = {}; try { d = JSON.parse(body); } catch (_) {}
          const ok = d && d.st === st && typeof d.idToken === 'string' && d.idToken.split('.').length === 3;
          res.writeHead(ok ? 200 : 400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok }));
          if (ok) finish({ idToken: d.idToken });
          else if (d && d.st === st && d.error) finish({ error: String(d.error).slice(0, 80) });
        });
        return;
      }
      res.writeHead(404); res.end();
    });
    const timer = setTimeout(() => finish({ error: 'timed out' }), 5 * 60 * 1000);
    pending = { cancel: () => finish({ error: 'cancelled' }) };
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      shell.openExternal(SITE + '?desktop=' + port + '&st=' + st);
    });
  });
});

app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
