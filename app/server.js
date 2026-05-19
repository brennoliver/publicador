/**
 * BM Mídia — Instagram Publisher Server
 */

import path           from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

import express        from 'express';
import session        from 'express-session';
import bcrypt         from 'bcryptjs';
import multer         from 'multer';
import fs             from 'fs';
import { login, publishPost, getSessionStatus } from './instagram.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 3737;

// ── Directories ────────────────────────────────────────────────────
// In production (Railway) use /data; locally use sibling dirs relative to app/
const DATA_DIR     = process.env.DATA_DIR || path.join(__dirname, '..');
const CLIENTS_DIR  = path.join(DATA_DIR, 'clients');
const UPLOADS_DIR  = path.join(DATA_DIR, 'uploads');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');

for (const dir of [CLIENTS_DIR, UPLOADS_DIR, SESSIONS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ── Users (hashed at startup from env vars) ────────────────────────
// Set BRENNO_PASS and BIANCA_PASS in environment (.env or Railway vars)
const USERS = {
  brenno: process.env.BRENNO_PASS,
  bianca: process.env.BIANCA_PASS,
};

// ── Middleware ─────────────────────────────────────────────────────
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'bm-midia-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// ── Auth middleware ────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Não autenticado' });
  return res.redirect('/login');
}

// ── Static: login page (public) ───────────────────────────────────
app.get('/login', (req, res) => {
  if (req.session?.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'login.html'));
});

// ── Auth routes ────────────────────────────────────────────────────

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Campos obrigatórios' });

  const storedPass = USERS[username.toLowerCase()];
  if (!storedPass) return res.status(401).json({ ok: false });

  const match = await bcrypt.compare(password, storedPass);
  if (!match) return res.status(401).json({ ok: false });

  req.session.user = username.toLowerCase();
  res.json({ ok: true });
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// GET /api/me
app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.session.user });
});

// ── All other routes require auth ──────────────────────────────────
app.use(requireAuth);
app.use(express.static(__dirname));

// Multer for file uploads
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 500 }, // 500MB
});

// ── Helpers ────────────────────────────────────────────────────────
function clientPath(slug) {
  return path.join(CLIENTS_DIR, slug, 'config.json');
}

function loadClient(slug) {
  const p = clientPath(slug);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function listClients() {
  if (!fs.existsSync(CLIENTS_DIR)) return [];
  return fs.readdirSync(CLIENTS_DIR)
    .filter(d => fs.existsSync(path.join(CLIENTS_DIR, d, 'config.json')))
    .map(d => {
      const cfg = JSON.parse(fs.readFileSync(path.join(CLIENTS_DIR, d, 'config.json'), 'utf8'));
      const sessionFile = path.join(SESSIONS_DIR, `${cfg.slug}.json`);
      cfg.hasSession = fs.existsSync(sessionFile);
      return cfg;
    });
}

function slugify(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-');
}

// ── Routes: Clients ────────────────────────────────────────────────

app.get('/api/clients', (req, res) => {
  res.json(listClients());
});

app.post('/api/clients', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nome obrigatório' });

  let slug = slugify(name);
  const existing = listClients().map(c => c.slug);
  let i = 2;
  while (existing.includes(slug)) slug = slugify(name) + '-' + i++;

  const clientDir = path.join(CLIENTS_DIR, slug);
  fs.mkdirSync(clientDir, { recursive: true });

  const config = {
    name: name.trim(),
    slug,
    createdAt: new Date().toISOString().slice(0, 10),
    hasSession: false,
  };

  fs.writeFileSync(path.join(clientDir, 'config.json'), JSON.stringify(config, null, 2));
  res.json(config);
});

app.delete('/api/clients/:slug', (req, res) => {
  const { slug } = req.params;
  const clientDir = path.join(CLIENTS_DIR, slug);
  const sessionFile = path.join(SESSIONS_DIR, `${slug}.json`);

  if (!fs.existsSync(clientDir)) return res.status(404).json({ error: 'Cliente não encontrado' });

  fs.rmSync(clientDir, { recursive: true, force: true });
  if (fs.existsSync(sessionFile)) fs.unlinkSync(sessionFile);

  res.json({ ok: true });
});

// ── Routes: Session (Login) ────────────────────────────────────────

app.post('/api/clients/:slug/login', async (req, res) => {
  const { slug } = req.params;
  const client = loadClient(slug);
  if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });

  const sessionFile = path.join(SESSIONS_DIR, `${slug}.json`);

  res.json({ ok: true, message: 'Abrindo Instagram… faça login e feche a janela quando terminar.' });

  login(client, sessionFile).then(() => {
    const cfg = loadClient(slug);
    cfg.hasSession = true;
    cfg.sessionUpdatedAt = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(clientPath(slug), JSON.stringify(cfg, null, 2));
  }).catch(err => {
    console.error('[login error]', err.message);
  });
});

app.get('/api/clients/:slug/status', async (req, res) => {
  const { slug } = req.params;
  const sessionFile = path.join(SESSIONS_DIR, `${slug}.json`);
  const cfg = loadClient(slug);
  if (!cfg) return res.status(404).json({ error: 'Cliente não encontrado' });

  const hasSession = fs.existsSync(sessionFile);

  let sessionValid = false;
  if (hasSession) {
    try {
      sessionValid = await getSessionStatus(slug, sessionFile);
    } catch {
      sessionValid = false;
    }
  }

  res.json({ hasSession, sessionValid });
});

// ── Routes: Upload ─────────────────────────────────────────────────

app.post('/api/upload', upload.array('files', 10), (req, res) => {
  const paths = req.files.map(f => ({
    name: f.originalname,
    path: f.path,
    filename: f.filename,
    mimetype: f.mimetype,
    size: f.size,
  }));
  res.json({ files: paths });
});

app.delete('/api/upload/:filename', (req, res) => {
  const filepath = path.join(UPLOADS_DIR, req.params.filename);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  res.json({ ok: true });
});

// ── Routes: Publish ────────────────────────────────────────────────

app.post('/api/publish', async (req, res) => {
  const { slug, format, filenames, caption, scheduledAt } = req.body;

  if (!slug)             return res.status(400).json({ error: 'Cliente obrigatório' });
  if (!format)           return res.status(400).json({ error: 'Formato obrigatório' });
  if (!filenames?.length) return res.status(400).json({ error: 'Arquivos obrigatórios' });

  const client = loadClient(slug);
  if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });

  const sessionFile = path.join(SESSIONS_DIR, `${slug}.json`);
  if (!fs.existsSync(sessionFile)) {
    return res.status(401).json({ error: 'Nenhuma sessão ativa para este cliente. Faça login primeiro.' });
  }

  const filePaths = filenames.map(fn => path.join(UPLOADS_DIR, fn));
  for (const fp of filePaths) {
    if (!fs.existsSync(fp)) return res.status(400).json({ error: `Arquivo não encontrado: ${fp}` });
  }

  if (caption && caption.length > 2200) {
    return res.status(400).json({ error: 'Legenda ultrapassa 2200 caracteres' });
  }

  if (scheduledAt) {
    const queueFile = path.join(DATA_DIR, 'output', 'scheduled-queue.json');
    const queue = fs.existsSync(queueFile) ? JSON.parse(fs.readFileSync(queueFile, 'utf8')) : [];
    const id = `sch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    queue.push({ id, slug, clientName: client.name, format, filenames, caption, scheduledAt, status: 'pending', createdAt: new Date().toISOString() });
    fs.mkdirSync(path.dirname(queueFile), { recursive: true });
    fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2));
    return res.json({ ok: true, scheduled: true, id, scheduledAt });
  }

  try {
    const result = await publishPost({ client, sessionFile, format, filePaths, caption });
    const logFile = path.join(DATA_DIR, 'output', 'log.md');
    const logLine = `| ${new Date().toLocaleString('pt-BR')} | ${client.name} | ${format} | ${result.postUrl || '—'} | ✅ sucesso |\n`;
    fs.appendFileSync(logFile, logLine);
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[publish error]', err.message);
    const logFile = path.join(DATA_DIR, 'output', 'log.md');
    const logLine = `| ${new Date().toLocaleString('pt-BR')} | ${client.name} | ${format} | — | ❌ ${err.message} |\n`;
    fs.appendFileSync(logFile, logLine);
    res.status(500).json({ error: err.message });
  }
});

// ── Start ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📤  BM Mídia — Instagram Publisher');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Rodando em: http://localhost:${PORT}`);

  if (!process.env.BRENNO_PASS || !process.env.BIANCA_PASS) {
    console.log('\n  ⚠️  ATENÇÃO: BRENNO_PASS e/ou BIANCA_PASS não definidos.');
    console.log('  Execute: node scripts/hash-password.js <senha> para gerar os hashes.');
    console.log('  Defina as variáveis de ambiente antes de usar em produção.\n');
  }
});
