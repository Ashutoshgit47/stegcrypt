import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

// Find IndexNow key file (32-char hex filename)
const keyFile = fs.readdirSync(publicDir).find(f => /^[a-f0-9]{32}\.txt$/i.test(f));
if (!keyFile) {
  console.error('No IndexNow key file found in public/');
  process.exit(1);
}

const key = fs.readFileSync(path.join(publicDir, keyFile), 'utf8').trim();
const host = 'stegcrypt.app';
const keyLocation = `https://${host}/${keyFile}`;

const urlList = [
  `https://${host}/`,
  `https://${host}/encode`,
  `https://${host}/decode`,
  `https://${host}/tools`,
  `https://${host}/help`,
  `https://${host}/security`,
  `https://${host}/about`
];

console.log(`Submitting ${urlList.length} URLs to IndexNow for host: ${host}...`);

const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation, urlList })
});

if (res.status === 200 || res.status === 202) {
  console.log(`✓ IndexNow accepted URLs (HTTP ${res.status})`);
} else {
  console.error(`✗ IndexNow responded with HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}
