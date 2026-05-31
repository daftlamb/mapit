const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const privatePath = path.join(dir, 'private-key.pem');
const publicPath = path.join(dir, 'public-key.pem');

if (fs.existsSync(privatePath) || fs.existsSync(publicPath)) {
  console.error('Key files already exist. Move them first if you really want to rotate licenses.');
  process.exit(1);
}

const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

fs.writeFileSync(privatePath, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
fs.writeFileSync(publicPath, publicKey.export({ type: 'spki', format: 'pem' }));

console.log('Created license/private-key.pem and license/public-key.pem');
console.log('Keep private-key.pem secret. Only public-key.pem is packaged with the app.');
