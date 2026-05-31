const { app, BrowserWindow, clipboard, ipcMain } = require('electron');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function base64Url(value) {
  return Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function keyFingerprint(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function readSigningPrivateKey() {
  const publicPath = path.join(__dirname, 'public-key.pem');
  if (!fs.existsSync(publicPath)) throw new Error('Missing public-key.pem.');

  const publicFingerprint = keyFingerprint(fs.readFileSync(publicPath));
  const candidates = [
    process.env.MAPIT_LICENSE_PRIVATE_KEY ? path.resolve(process.env.MAPIT_LICENSE_PRIVATE_KEY) : '',
    path.resolve(__dirname, '..', '..', 'emboss-lab', 'license', 'private-key.pem'),
    path.join(__dirname, 'private-key.pem')
  ].filter(Boolean);

  let sawMismatch = false;
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    const privateKey = fs.readFileSync(candidate);
    const derivedPublic = crypto.createPublicKey(privateKey).export({ type: 'spki', format: 'pem' });
    if (keyFingerprint(derivedPublic) === publicFingerprint) return privateKey;
    sawMismatch = true;
  }

  if (sawMismatch) throw new Error('Signing private key does not match public-key.pem.');
  throw new Error('Missing signing private key.');
}

function generateLicense(input) {
  const email = String(input.email || '').trim().toLowerCase();
  const appId = String(input.app || 'mapit-pro').trim();
  const edition = String(input.edition || 'standard').trim();
  const expires = String(input.expires || '').trim();
  if (!email) throw new Error('Email is required.');

  const payload = {
    app: appId,
    email,
    edition,
    issued: new Date().toISOString().slice(0, 10),
    expires,
    serial: crypto.randomBytes(8).toString('hex').toUpperCase()
  };
  const payload64 = base64Url(JSON.stringify(payload));
  const signature = crypto.sign(null, Buffer.from(payload64), readSigningPrivateKey());
  return { payload, code: `${payload64}.${base64Url(signature)}` };
}

function createWindow() {
  const win = new BrowserWindow({
    width: 760,
    height: 720,
    minWidth: 680,
    minHeight: 620,
    title: 'License Admin',
    backgroundColor: '#f5f5f5',
    webPreferences: {
      preload: path.join(__dirname, 'admin-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.removeMenu();
  win.loadFile(path.join(__dirname, 'admin.html'));
}

ipcMain.handle('admin:generate', (event, input) => generateLicense(input || {}));
ipcMain.handle('admin:copy', (event, value) => {
  clipboard.writeText(String(value || ''));
  return true;
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

