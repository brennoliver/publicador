#!/usr/bin/env node
/**
 * Instagram Publisher — Extended
 * Supports: single image, carousel, reels, stories
 *
 * Usage:
 *   node publish-extended.js --type image   --images "file.jpg"         --caption "..." --token "EAA..." --user-id "178..."
 *   node publish-extended.js --type carousel --images "f1.jpg,f2.jpg"  --caption "..." --token "EAA..." --user-id "178..."
 *   node publish-extended.js --type reels   --images "video.mp4"        --caption "..." --token "EAA..." --user-id "178..."
 *   node publish-extended.js --type stories --images "file.jpg"         --token "EAA..." --user-id "178..."
 *   Add --dry-run to test without publishing
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const IG_BASE = 'https://graph.facebook.com/v21.0';

// ── Argument Parsing ─────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    type: 'carousel',
    images: [],
    caption: '',
    token: '',
    userId: '',
    imgbbKey: '',
    dryRun: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const flag = argv[i];
    const next = argv[i + 1];
    if (flag === '--type' && next)       { args.type = next; i++; }
    else if (flag === '--images' && next) { args.images = next.split(',').map(s => s.trim()); i++; }
    else if (flag === '--caption' && next){ args.caption = next; i++; }
    else if (flag === '--token' && next)  { args.token = next; i++; }
    else if (flag === '--user-id' && next){ args.userId = next; i++; }
    else if (flag === '--imgbb-key' && next){ args.imgbbKey = next; i++; }
    else if (flag === '--dry-run')        { args.dryRun = true; }
  }
  // Fallback to env vars if flags not provided
  args.token    = args.token    || process.env.INSTAGRAM_ACCESS_TOKEN || '';
  args.userId   = args.userId   || process.env.INSTAGRAM_USER_ID || '';
  args.imgbbKey = args.imgbbKey || process.env.IMGBB_API_KEY || '';
  return args;
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateArgs(args) {
  const VALID_TYPES = ['image', 'carousel', 'reels', 'stories'];
  if (!VALID_TYPES.includes(args.type)) {
    throw new Error(`Invalid --type "${args.type}". Must be one of: ${VALID_TYPES.join(', ')}`);
  }
  if (!args.images.length) throw new Error('--images is required');
  if (!args.token) throw new Error('--token (or INSTAGRAM_ACCESS_TOKEN env var) is required');
  if (!args.userId) throw new Error('--user-id (or INSTAGRAM_USER_ID env var) is required');

  // Validate files exist
  for (const file of args.images) {
    if (!existsSync(resolve(file))) {
      throw new Error(`File not found: ${file}`);
    }
  }

  if (args.type === 'carousel') {
    if (args.images.length < 2) throw new Error('Carousel requires at least 2 images');
    if (args.images.length > 10) throw new Error('Carousel supports max 10 images');
    if (!args.imgbbKey) throw new Error('--imgbb-key (or IMGBB_API_KEY) is required for carousel posts');
  }

  if (args.type === 'image' && args.images.length !== 1) {
    throw new Error('Image type requires exactly 1 file');
  }

  if ((args.type === 'reels' || args.type === 'stories') && args.images.length !== 1) {
    throw new Error(`${args.type} type requires exactly 1 file`);
  }

  if (args.caption.length > 2200) {
    throw new Error(`Caption exceeds 2200 characters (got ${args.caption.length})`);
  }
}

// ── imgBB Upload (for carousel) ───────────────────────────────────────────────

async function uploadToImgBB(imagePath, apiKey) {
  const buffer = readFileSync(resolve(imagePath));
  const base64 = buffer.toString('base64');
  const form = new FormData();
  form.append('key', apiKey);
  form.append('image', base64);
  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
  if (!res.ok) throw new Error(`imgBB upload failed [${res.status}]: ${await res.text()}`);
  const json = await res.json();
  if (!json.success) throw new Error(`imgBB error: ${JSON.stringify(json)}`);
  return json.data.url;
}

// ── Container Status Polling ───────────────────────────────────────────────────

async function waitForContainer(containerId, token, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const params = new URLSearchParams({ fields: 'status_code', access_token: token });
    const res = await fetch(`${IG_BASE}/${containerId}?${params}`);
    if (!res.ok) throw new Error(`Status check failed [${res.status}]: ${await res.text()}`);
    const { status_code } = await res.json();
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR') throw new Error(`Container ${containerId} entered ERROR state`);
    await new Promise(r => setTimeout(r, 4_000));
  }
  throw new Error(`Container ${containerId} timed out after ${timeoutMs / 1000}s`);
}

// ── Instagram API Calls ────────────────────────────────────────────────────────

async function createImageContainer(userId, imageUrl, caption, token) {
  const params = new URLSearchParams({ image_url: imageUrl, caption, access_token: token });
  const res = await fetch(`${IG_BASE}/${userId}/media?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`createImageContainer failed [${res.status}]: ${await res.text()}`);
  return (await res.json()).id;
}

async function createVideoContainer(userId, videoUrl, caption, mediaType, token) {
  const params = new URLSearchParams({
    video_url: videoUrl,
    media_type: mediaType.toUpperCase(), // REELS or STORIES
    caption,
    access_token: token,
  });
  const res = await fetch(`${IG_BASE}/${userId}/media?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`createVideoContainer failed [${res.status}]: ${await res.text()}`);
  return (await res.json()).id;
}

async function createCarouselChild(userId, imageUrl, token) {
  const params = new URLSearchParams({ image_url: imageUrl, is_carousel_item: 'true', access_token: token });
  const res = await fetch(`${IG_BASE}/${userId}/media?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`createCarouselChild failed [${res.status}]: ${await res.text()}`);
  return (await res.json()).id;
}

async function createCarouselContainer(userId, childIds, caption, token) {
  const params = new URLSearchParams({
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption,
    access_token: token,
  });
  const res = await fetch(`${IG_BASE}/${userId}/media?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`createCarouselContainer failed [${res.status}]: ${await res.text()}`);
  return (await res.json()).id;
}

async function publishContainer(userId, containerId, token) {
  const params = new URLSearchParams({ creation_id: containerId, access_token: token });
  const res = await fetch(`${IG_BASE}/${userId}/media_publish?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`publishContainer failed [${res.status}]: ${await res.text()}`);
  return (await res.json()).id;
}

async function getPermalink(mediaId, token) {
  const params = new URLSearchParams({ fields: 'permalink', access_token: token });
  const res = await fetch(`${IG_BASE}/${mediaId}?${params}`);
  if (!res.ok) return null;
  return (await res.json()).permalink ?? null;
}

// ── Publish Flows ──────────────────────────────────────────────────────────────

async function publishImage({ images, caption, token, userId, imgbbKey, dryRun }) {
  console.log('📸 Uploading image to imgBB...');
  const imageUrl = await uploadToImgBB(images[0], imgbbKey);
  console.log(`   URL: ${imageUrl}`);

  console.log('\n📦 Creating image container...');
  const containerId = await createImageContainer(userId, imageUrl, caption, token);
  console.log(`   Container ID: ${containerId}`);

  console.log('\n⏳ Waiting for processing...');
  await waitForContainer(containerId, token);

  if (dryRun) {
    console.log('\n✅ DRY RUN — container ready, skipping publish.');
    return;
  }

  console.log('\n🚀 Publishing...');
  const postId = await publishContainer(userId, containerId, token);
  const permalink = await getPermalink(postId, token);
  console.log(`\n✅ Published!`);
  console.log(`   Post ID: ${postId}`);
  if (permalink) console.log(`   URL: ${permalink}`);
  return { postId, permalink };
}

async function publishCarousel({ images, caption, token, userId, imgbbKey, dryRun }) {
  console.log(`📸 Uploading ${images.length} images to imgBB...`);
  const imageUrls = await Promise.all(images.map(p => uploadToImgBB(p, imgbbKey)));
  imageUrls.forEach((url, i) => console.log(`   [${i + 1}] ${url}`));

  console.log('\n📦 Creating carousel child containers...');
  const childIds = await Promise.all(imageUrls.map(url => createCarouselChild(userId, url, token)));
  console.log(`   Child IDs: ${childIds.join(', ')}`);

  console.log('\n⏳ Waiting for children to process...');
  await Promise.all(childIds.map(id => waitForContainer(id, token)));

  console.log('\n🎠 Creating carousel container...');
  const carouselId = await createCarouselContainer(userId, childIds, caption, token);
  await waitForContainer(carouselId, token);
  console.log(`   Carousel ID: ${carouselId}`);

  if (dryRun) {
    console.log('\n✅ DRY RUN — carousel ready, skipping publish.');
    return;
  }

  console.log('\n🚀 Publishing...');
  const postId = await publishContainer(userId, carouselId, token);
  const permalink = await getPermalink(postId, token);
  console.log(`\n✅ Published!`);
  console.log(`   Post ID: ${postId}`);
  if (permalink) console.log(`   URL: ${permalink}`);
  return { postId, permalink };
}

async function publishVideo({ images, caption, token, userId, type, dryRun }) {
  // For video/reels/stories, the file needs to be publicly accessible.
  // The file path provided should be a public URL or the user must host it.
  const filePath = images[0];
  const isUrl = filePath.startsWith('http://') || filePath.startsWith('https://');

  if (!isUrl) {
    console.warn(`⚠️  Video publishing via API requires a public URL.`);
    console.warn(`   The file "${filePath}" is a local path.`);
    console.warn(`   Please upload the video to a public host and provide the URL.`);
    console.warn(`   Alternative: publish Reels manually via Meta Business Suite.`);
    throw new Error('Video files must be accessible via public URL for the Graph API');
  }

  const mediaType = type === 'reels' ? 'REELS' : 'STORIES';
  console.log(`\n📦 Creating ${mediaType} container...`);
  const containerId = await createVideoContainer(userId, filePath, caption, mediaType, token);
  console.log(`   Container ID: ${containerId}`);

  console.log('\n⏳ Waiting for video processing (may take up to 2 minutes)...');
  await waitForContainer(containerId, token, 180_000);

  if (dryRun) {
    console.log(`\n✅ DRY RUN — ${mediaType} container ready, skipping publish.`);
    return;
  }

  console.log('\n🚀 Publishing...');
  const postId = await publishContainer(userId, containerId, token);
  const permalink = await getPermalink(postId, token);
  console.log(`\n✅ Published!`);
  console.log(`   Post ID: ${postId}`);
  if (permalink) console.log(`   URL: ${permalink}`);
  return { postId, permalink };
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);
  validateArgs(args);

  console.log(`\n📤 Instagram Publisher — ${args.type.toUpperCase()}`);
  console.log(`   Client User ID: ${args.userId}`);
  console.log(`   File(s): ${args.images.join(', ')}`);
  console.log(`   Caption: ${args.caption.substring(0, 60)}${args.caption.length > 60 ? '...' : ''}`);
  if (args.dryRun) console.log(`   Mode: DRY RUN\n`);

  let result;
  switch (args.type) {
    case 'image':
      result = await publishImage(args);
      break;
    case 'carousel':
      result = await publishCarousel(args);
      break;
    case 'reels':
    case 'stories':
      result = await publishVideo(args);
      break;
  }

  if (result) {
    // Output JSON for pipeline integration
    console.log('\n📋 Result JSON:');
    console.log(JSON.stringify({ success: true, ...result }, null, 2));
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch(err => {
    console.error(`\n❌ ${err.message}`);
    process.exit(1);
  });
}
