const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const index = arg.indexOf('=');
  return index >= 0 ? [arg.slice(0, index), arg.slice(index + 1)] : [arg, true];
}));

function base64Url(value) {
  return Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function keyFingerprint(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function readSigningPrivateKey() {
  const publicPath = path.join(__dirname, 'public-key.pem');
  if (!fs.existsSync(publicPath)) throw new Error('Missing license/public-key.pem.');

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

  if (sawMismatch) throw new Error('Signing private key does not match license/public-key.pem.');
  throw new Error('Missing signing private key.');
}

const email = String(args.email || '').trim().toLowerCase();
const app = String(args.app || 'mapit-pro').trim();
const edition = String(args.edition || 'standard').trim();
const expires = args.expires ? String(args.expires).trim() : '';

if (!email) {
  console.error('Usage: node license/generate-license.js email=user@example.com [app=mapit-pro] [edition=standard] [expires=2027-12-31]');
  process.exit(1);
}

const payload = {
  app,
  email,
  edition,
  issued: new Date().toISOString().slice(0, 10),
  expires,
  serial: crypto.randomBytes(8).toString('hex').toUpperCase()
};
const payload64 = base64Url(JSON.stringify(payload));
let signature;
try {
  signature = crypto.sign(null, Buffer.from(payload64), readSigningPrivateKey());
} catch (error) {
  console.error(error.message || 'Could not read signing private key.');
  process.exit(1);
}
const code = `${payload64}.${base64Url(signature)}`;

console.log(`Email: ${email}`);
console.log(`App: ${app}`);
console.log(`Edition: ${edition}`);
if (expires) console.log(`Expires: ${expires}`);
console.log('');
console.log(code);

