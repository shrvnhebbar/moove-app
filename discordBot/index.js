// server.js
require('dotenv').config();
const PORT = process.env.PORT;

const express = require('express');
const app = express();
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.CRYPTO_KEY, 'hex');// take it from the env file.
console.log(key);
const iv = crypto.randomBytes(16);  // initialization vector

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const msg = encrypt('Hello World!');
app.get('/hi', (req, res) => {
  console.log(key);
  console.log('Encrypted:', msg);
  console.log('Decrypted:', decrypt(msg));
  res.send(decrypt(msg));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
