// Integration tests against a throwaway database on the local MongoDB.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-only-for-tests';
process.env.MONGO_URL = process.env.TEST_MONGO_URL || 'mongodb://127.0.0.1:27017/redecor_ai_test';
process.env.AI_DEMO_MODE = 'true';
process.env.VISUAL_DEMO_MODE = 'true';
process.env.AI_RATE_LIMIT = '1000';
process.env.AUTH_RATE_LIMIT = '1000';
process.env.GUEST_RATE_LIMIT = '1000';
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';
process.env.CLIENT_URL = 'http://localhost:3000';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const sharp = require('sharp');

const app = require('../server');
const { connectDB, disconnectDB } = require('../Models/db');
const designModel = require('../Models/Designs');
const usageModel = require('../Models/Usage');
const mediaModel = require('../Models/Media');
const userModel = require('../Models/Users');
const { setDevMailHook } = require('../utils/mailer');

// Captures what would have been emailed.
const inbox = [];
const lastCode = (to) => [...inbox].reverse().find((mail) => mail.to === to && mail.code)?.code;

const EMAIL = 'ayesha@example.com';
const NEW_EMAIL = 'ayesha.new@example.com';
let password = 'first-password-1';
let token;
let userId;
let profileImageName;

// Images live in MongoDB (Media collection), not on disk.
const storedBuffer = async (name) => (await mediaModel.findOne({ name }).select('+data'))?.data;
const storedExists = async (name) => Boolean(await mediaModel.exists({ name }));
const fileFromUrl = (url) => new URL(url).pathname.split('/').pop();
// Supertest uses a relative path, so strip the random host:port from signed URLs.
const pathOf = (url) => { const u = new URL(url); return `${u.pathname}${u.search}`; };

const roomJpeg = () => sharp({
    create: { width: 2400, height: 1600, channels: 3, background: { r: 180, g: 170, b: 150 } },
}).jpeg().toBuffer();

const tinyPng = () => sharp({
    create: { width: 32, height: 24, channels: 3, background: { r: 200, g: 120, b: 90 } },
}).png().toBuffer();

const auth = () => ({ Authorization: `Bearer ${token}` });

before(async () => {
    setDevMailHook((mail) => inbox.push(mail));
    await connectDB(process.env.MONGO_URL);
    await mongoose.connection.dropDatabase();
});

after(async () => {
    await mongoose.connection.dropDatabase();
    await disconnectDB();
    setDevMailHook(null);
});

// Signs up and verifies a second user, returns their token.
const createVerifiedUser = async (email, pass = 'second-password-1') => {
    await request(app).post('/auth/signup').send({ username: 'Second User', email, password: pass });
    await request(app).post('/auth/verify-otp').send({ email, otp: lastCode(email) });
    const login = await request(app).post('/auth/login').send({ email, password: pass });
    return login.body.data.accessToken;
};

test('signup sends a code and can be repeated while unverified', async () => {
    const first = await request(app).post('/auth/signup').send({ username: 'Ayesha', email: EMAIL, password });
    assert.equal(first.status, 201);
    assert.equal(first.body.success, true);
    const firstCode = lastCode(EMAIL);
    assert.match(firstCode, /^\d{6}$/);

    const again = await request(app).post('/auth/signup').send({ username: 'Ayesha K', email: EMAIL.toUpperCase(), password });
    assert.equal(again.status, 201);
    const secondCode = lastCode(EMAIL);
    assert.notEqual(secondCode, undefined);

    const bad = await request(app).post('/auth/signup').send({ username: 'A', email: 'nope', password: 'short' });
    assert.equal(bad.status, 400);
    assert.equal(bad.body.code, 'VALIDATION_ERROR');
});

test('login is blocked until the email is verified', async () => {
    const res = await request(app).post('/auth/login').send({ email: EMAIL, password });
    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'EMAIL_NOT_VERIFIED');
});

test('verify-otp rejects a wrong code and accepts the latest one', async () => {
    const code = lastCode(EMAIL);
    const wrong = code === '000000' ? '111111' : '000000';

    const bad = await request(app).post('/auth/verify-otp').send({ email: EMAIL, otp: wrong });
    assert.equal(bad.status, 400);
    assert.equal(bad.body.code, 'INVALID_OTP');

    const ok = await request(app).post('/auth/verify-otp').send({ email: EMAIL, otp: code });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.success, true);

    const reused = await request(app).post('/auth/verify-otp').send({ email: EMAIL, otp: code });
    assert.equal(reused.status, 400, 'a code only works once');
});

test('signup with a verified email is rejected', async () => {
    const res = await request(app).post('/auth/signup').send({ username: 'Someone', email: EMAIL, password: 'another-pass-1' });
    assert.equal(res.status, 409);
    assert.equal(res.body.code, 'EMAIL_TAKEN');
});

test('login works and returns the public user shape', async () => {
    const wrong = await request(app).post('/auth/login').send({ email: EMAIL, password: 'wrong-password' });
    assert.equal(wrong.status, 401);
    assert.equal(wrong.body.code, 'INVALID_CREDENTIALS');

    const unknown = await request(app).post('/auth/login').send({ email: 'ghost@example.com', password: 'whatever-1' });
    assert.equal(unknown.status, 401);
    assert.equal(unknown.body.code, 'INVALID_CREDENTIALS');

    const res = await request(app).post('/auth/login').send({ email: EMAIL, password });
    assert.equal(res.status, 200);
    const data = res.body.data;
    assert.deepEqual(
        Object.keys(data).sort(),
        ['accessToken', 'createdAt', 'email', 'emailVerified', 'guestExpiresAt', 'id', 'isGuest', 'profileImage', 'username'],
    );
    assert.equal(data.isGuest, false);
    assert.equal(data.guestExpiresAt, null);
    assert.equal(data.username, 'Ayesha K');
    assert.equal(data.email, EMAIL);
    assert.equal(data.emailVerified, true);
    assert.equal(data.profileImage, '');
    token = data.accessToken;
    userId = data.id;
});

test('/auth/me needs a valid token', async () => {
    const none = await request(app).get('/auth/me');
    assert.equal(none.status, 401);
    assert.equal(none.body.code, 'UNAUTHORIZED');

    const bad = await request(app).get('/auth/me').set('Authorization', 'Bearer not-a-token');
    assert.equal(bad.status, 401);

    const res = await request(app).get('/auth/me').set(auth());
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, userId);
    assert.equal(res.body.data.password, undefined);
    assert.equal(res.body.data.otpHash, undefined);
});

test('verify-email gives the same answer for unknown emails', async () => {
    const before = inbox.length;
    const res = await request(app).post('/auth/verify-email').send({ email: 'ghost@example.com' });
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'If that email is registered, a code has been sent');
    assert.equal(inbox.length, before, 'no email for unknown address');
});

test('reset-password locks after 5 wrong codes, then works with a fresh code', async () => {
    await request(app).post('/auth/verify-email').send({ email: EMAIL });
    const code = lastCode(EMAIL);
    const wrong = code === '000000' ? '111111' : '000000';

    for (let i = 0; i < 5; i += 1) {
        const res = await request(app).post('/auth/reset-password').send({ email: EMAIL, otp: wrong, newPassword: 'reset-password-1' });
        assert.equal(res.status, 400);
        assert.equal(res.body.code, 'INVALID_OTP');
    }
    const locked = await request(app).post('/auth/reset-password').send({ email: EMAIL, otp: code, newPassword: 'reset-password-1' });
    assert.equal(locked.status, 429);
    assert.equal(locked.body.code, 'TOO_MANY_ATTEMPTS');

    await request(app).post('/auth/verify-email').send({ email: EMAIL });
    const fresh = lastCode(EMAIL);
    const ok = await request(app).post('/auth/reset-password').send({ email: EMAIL, otp: fresh, newPassword: 'reset-password-1' });
    assert.equal(ok.status, 200);
    password = 'reset-password-1';

    const login = await request(app).post('/auth/login').send({ email: EMAIL, password });
    assert.equal(login.status, 200);
    token = login.body.data.accessToken;
});

let designId;
let originalUrl;

test('old style routes are gone', async () => {
    const styles = await request(app).get('/ai/styles').set(auth());
    assert.equal(styles.status, 404);
    const suggest = await request(app).post('/ai/suggest').set(auth());
    assert.equal(suggest.status, 404);
});

test('POST /ai/analyze needs a login', async () => {
    const res = await request(app).post('/ai/analyze')
        .attach('image', await roomJpeg(), { filename: 'room.jpg', contentType: 'image/jpeg' });
    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'UNAUTHORIZED');
});

test('POST /ai/analyze returns and saves a demo analysis', async () => {
    const res = await request(app).post('/ai/analyze').set(auth())
        .field('notes', 'I have a cat and a small budget')
        .attach('image', await roomJpeg(), { filename: 'room.jpg', contentType: 'image/jpeg' });
    assert.equal(res.status, 201, JSON.stringify(res.body));

    const design = res.body.data;
    assert.deepEqual(Object.keys(design).sort(), ['analysis', 'createdAt', 'demo', 'id', 'notes', 'original', 'visual']);
    assert.deepEqual(design.demo, { analysis: true, visual: false });
    assert.equal(design.notes, 'I have a cat and a small budget');
    assert.deepEqual(design.visual, { status: 'pending' });
    assert.equal(design.imagePrompt, undefined, 'image prompt is internal');
    assert.equal(JSON.stringify(design).includes('imagePrompt'), false);

    const { analysis } = design;
    assert.deepEqual(
        Object.keys(analysis).sort(),
        ['changes', 'direction', 'keep', 'overview', 'palette', 'spaceType', 'summary', 'title'],
    );
    assert.ok(analysis.overview.length >= 2 && analysis.overview.length <= 3);
    assert.match(analysis.overview[0], /^Demo mode/);
    assert.deepEqual(Object.keys(analysis.direction).sort(), ['description', 'name']);
    assert.ok(analysis.changes.length >= 4 && analysis.changes.length <= 8);
    for (const change of analysis.changes) {
        assert.deepEqual(Object.keys(change).sort(), ['area', 'budget', 'priority', 'steps', 'title', 'why']);
        assert.ok(['high', 'medium', 'low'].includes(change.priority));
        assert.ok(['high', 'medium', 'low'].includes(change.budget));
        assert.ok(change.steps.length >= 2 && change.steps.length <= 4);
    }
    assert.equal(analysis.palette.length, 5);
    analysis.palette.forEach((colour) => assert.match(colour.hex, /^#[0-9A-F]{6}$/));

    // The original is stored resized (max 1568px) and only reachable through a signed URL.
    assert.match(design.original.url, /^http:\/\/127\.0\.0\.1:\d+\/media\/[a-f0-9-]{36}\.jpg\?exp=\d+&sig=[a-f0-9]{64}$/);
    const stored = await sharp(await storedBuffer(fileFromUrl(design.original.url))).metadata();
    assert.equal(stored.width, 1568);
    assert.equal(stored.format, 'jpeg');

    designId = design.id;
    originalUrl = design.original.url;

    const saved = await designModel.findById(designId).select('+imagePrompt');
    assert.ok(saved.imagePrompt.length > 50);
});

test('POST /ai/analyze validates input', async () => {
    const noImage = await request(app).post('/ai/analyze').set(auth()).field('notes', 'hi');
    assert.equal(noImage.status, 400);
    assert.equal(noImage.body.code, 'IMAGE_REQUIRED');

    const notImage = await request(app).post('/ai/analyze').set(auth())
        .attach('image', Buffer.from('hello'), { filename: 'notes.txt', contentType: 'text/plain' });
    assert.equal(notImage.status, 400);
    assert.equal(notImage.body.code, 'INVALID_IMAGE');

    const fakePng = await request(app).post('/ai/analyze').set(auth())
        .attach('image', Buffer.from('not really a png'), { filename: 'room.png', contentType: 'image/png' });
    assert.equal(fakePng.status, 400);
    assert.equal(fakePng.body.code, 'INVALID_IMAGE');

    const longNotes = await request(app).post('/ai/analyze').set(auth())
        .field('notes', 'x'.repeat(501))
        .attach('image', await tinyPng(), { filename: 'room.png', contentType: 'image/png' });
    assert.equal(longNotes.status, 400);
    assert.equal(longNotes.body.code, 'VALIDATION_ERROR');
});

test('designs can be listed and read one by one', async () => {
    const list = await request(app).get('/ai/designs').set(auth());
    assert.equal(list.status, 200);
    assert.equal(list.body.data.length, 1);
    assert.equal(list.body.data[0].id, designId);
    assert.equal(JSON.stringify(list.body.data).includes('imagePrompt'), false);

    const one = await request(app).get(`/ai/designs/${designId}`).set(auth());
    assert.equal(one.status, 200);
    assert.equal(one.body.data.id, designId);

    const missing = await request(app).get(`/ai/designs/${new mongoose.Types.ObjectId()}`).set(auth());
    assert.equal(missing.status, 404);
    const garbage = await request(app).get('/ai/designs/not-an-id').set(auth());
    assert.equal(garbage.status, 404);
    assert.equal(garbage.body.code, 'NOT_FOUND');
});

test('media URLs work only with a valid, unexpired signature', async () => {
    const ok = await request(app).get(pathOf(originalUrl));
    assert.equal(ok.status, 200);
    assert.equal(ok.headers['content-type'], 'image/jpeg');
    assert.equal(ok.headers['cache-control'], 'private, max-age=3600');
    assert.equal(ok.headers['cross-origin-resource-policy'], 'cross-origin');
    assert.equal(Number(ok.headers['content-length']), ok.body.length);
    assert.ok(ok.body.length > 1000);

    const url = new URL(originalUrl);
    const file = url.pathname.split('/').pop();
    const exp = url.searchParams.get('exp');
    const sig = url.searchParams.get('sig');
    const flipped = (sig[0] === 'a' ? 'b' : 'a') + sig.slice(1);

    const cases = [
        `/media/${file}?exp=${exp}&sig=${flipped}`, // tampered signature
        `/media/${file}?exp=${Number(exp) + 3600}&sig=${sig}`, // tampered expiry
        `/media/${file}?exp=${exp}`, // no signature
        `/media/${file}`,
        `/media/..%2F..%2Fpackage.json?exp=${exp}&sig=${sig}`, // path traversal
        `/media/not-a-uuid.jpg?exp=${exp}&sig=${sig}`,
    ];
    for (const path of cases) {
        const res = await request(app).get(path);
        assert.equal(res.status, 403, path);
        assert.equal(res.body.code, 'FORBIDDEN', path);
    }

    // A correctly signed but expired link is refused too.
    const { verifySignature } = require('../utils/storage');
    const crypto = require('crypto');
    const past = String(Math.floor(Date.now() / 1000) - 10);
    const pastSig = crypto.createHmac('sha256', process.env.JWT_SECRET).update(`${file}:${past}`).digest('hex');
    assert.equal(verifySignature(file, past, pastSig), false);
    const expired = await request(app).get(`/media/${file}?exp=${past}&sig=${pastSig}`);
    assert.equal(expired.status, 403);
});

test('POST /ai/designs/:id/visualize creates a demo visual', async () => {
    const res = await request(app).post(`/ai/designs/${designId}/visualize`).set(auth());
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const { visual, demo } = res.body.data;
    assert.equal(visual.status, 'ready');
    assert.equal(visual.demo, true);
    assert.deepEqual(demo, { analysis: true, visual: true });
    assert.match(visual.url, /\/media\/[a-f0-9-]{36}\.webp\?exp=\d+&sig=[a-f0-9]{64}$/);

    const image = await request(app).get(pathOf(visual.url));
    assert.equal(image.status, 200);
    assert.equal(image.headers['content-type'], 'image/webp');
    const meta = await sharp(await storedBuffer(fileFromUrl(visual.url))).metadata();
    assert.equal(meta.width, 1568);

    // Regenerating replaces the old file.
    const again = await request(app).post(`/ai/designs/${designId}/visualize`).set(auth());
    assert.equal(again.status, 200);
    assert.notEqual(fileFromUrl(again.body.data.visual.url), fileFromUrl(visual.url));
    assert.ok(!(await storedExists(fileFromUrl(visual.url))), 'old visual removed');
});

test('visualize refuses while a visual is already processing', async () => {
    await designModel.updateOne({ _id: designId }, { $set: { 'visual.status': 'processing', 'visual.startedAt': new Date() } });
    const busy = await request(app).post(`/ai/designs/${designId}/visualize`).set(auth());
    assert.equal(busy.status, 409);
    assert.equal(busy.body.code, 'VISUAL_IN_PROGRESS');

    // A visual stuck for more than 3 minutes can be retried.
    await designModel.updateOne({ _id: designId }, { $set: { 'visual.startedAt': new Date(Date.now() - 4 * 60 * 1000) } });
    const retry = await request(app).post(`/ai/designs/${designId}/visualize`).set(auth());
    assert.equal(retry.status, 200);
    assert.equal(retry.body.data.visual.status, 'ready');
});

test('another account cannot read, visualize or delete my design', async () => {
    const otherToken = await createVerifiedUser('bilal@example.com');
    const other = { Authorization: `Bearer ${otherToken}` };

    assert.equal((await request(app).get(`/ai/designs/${designId}`).set(other)).status, 404);
    assert.equal((await request(app).post(`/ai/designs/${designId}/visualize`).set(other)).status, 404);
    assert.equal((await request(app).delete(`/ai/designs/${designId}`).set(other)).status, 404);
    const list = await request(app).get('/ai/designs').set(other);
    assert.equal(list.body.data.length, 0);

    assert.equal(await designModel.countDocuments({ _id: designId }), 1);
});

test('the daily limits are enforced and survive deleting designs', async () => {
    const since = new Date();
    await usageModel.insertMany(Array.from({ length: 20 }, () => ({ user: userId, kind: 'analysis' })));
    const analyse = await request(app).post('/ai/analyze').set(auth())
        .attach('image', await tinyPng(), { filename: 'room.png', contentType: 'image/png' });
    assert.equal(analyse.status, 429);
    assert.equal(analyse.body.code, 'DAILY_LIMIT');

    await usageModel.insertMany(Array.from({ length: 10 }, () => ({ user: userId, kind: 'visual' })));
    const visual = await request(app).post(`/ai/designs/${designId}/visualize`).set(auth());
    assert.equal(visual.status, 429);
    assert.equal(visual.body.code, 'VISUAL_DAILY_LIMIT');

    await usageModel.deleteMany({ user: userId, createdAt: { $gte: since } });
});

test('deleting a design removes it and its files', async () => {
    const res = await request(app).post('/ai/analyze').set(auth())
        .attach('image', await tinyPng(), { filename: 'room.png', contentType: 'image/png' });
    assert.equal(res.status, 201);
    const id = res.body.data.id;
    const visual = await request(app).post(`/ai/designs/${id}/visualize`).set(auth());
    assert.equal(visual.status, 200, JSON.stringify(visual.body));
    const files = [fileFromUrl(res.body.data.original.url), fileFromUrl(visual.body.data.visual.url)];
    for (const file of files) assert.ok(await storedExists(file), file);

    const del = await request(app).delete(`/ai/designs/${id}`).set(auth());
    assert.equal(del.status, 200);
    for (const file of files) assert.ok(!(await storedExists(file)), file);
    assert.equal((await request(app).get(`/ai/designs/${id}`).set(auth())).status, 404);
});

test('update-profile saves a re-encoded photo and username', async () => {
    const res = await request(app).put('/auth/update-profile').set(auth())
        .field('username', 'Ayesha Khan')
        .attach('profileImage', await tinyPng(), { filename: 'me.png', contentType: 'image/png' });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.data.username, 'Ayesha Khan');
    // Profile photos are stored like room photos: in MongoDB, behind a signed URL.
    assert.match(res.body.data.profileImage, /^http:\/\/127\.0\.0\.1:\d+\/media\/[a-f0-9-]{36}\.webp\?exp=\d+&sig=[a-f0-9]{64}$/);
    profileImageName = fileFromUrl(res.body.data.profileImage);
    const media = await mediaModel.findOne({ name: profileImageName });
    assert.equal(media.owner.toString(), userId);

    const served = await request(app).get(pathOf(res.body.data.profileImage));
    assert.equal(served.status, 200);
    assert.equal(served.headers['content-type'], 'image/webp');
    assert.equal(served.headers['cross-origin-resource-policy'], 'cross-origin');
    const meta = await sharp(served.body).metadata();
    assert.equal(meta.width, 512);

    // A new photo replaces (and deletes) the old one.
    const again = await request(app).put('/auth/update-profile').set(auth())
        .attach('profileImage', await tinyPng(), { filename: 'me2.png', contentType: 'image/png' });
    assert.equal(again.status, 200);
    assert.ok(!(await storedExists(profileImageName)), 'old profile photo removed');
    profileImageName = fileFromUrl(again.body.data.profileImage);
    assert.ok(await storedExists(profileImageName));

    const me = await request(app).get('/auth/me').set(auth());
    assert.equal(fileFromUrl(me.body.data.profileImage), profileImageName);

    const empty = await request(app).put('/auth/update-profile').set(auth()).send({});
    assert.equal(empty.status, 400);
});

test('email change needs the code sent to the new address', async () => {
    const taken = await request(app).patch('/auth/update-email').set(auth()).send({ email: EMAIL });
    assert.equal(taken.status, 400, 'same email');

    const start = await request(app).patch('/auth/update-email').set(auth()).send({ email: NEW_EMAIL });
    assert.equal(start.status, 200);
    const code = lastCode(NEW_EMAIL);
    assert.match(code, /^\d{6}$/);

    const wrong = await request(app).post('/auth/confirm-email').set(auth()).send({ otp: code === '000000' ? '111111' : '000000' });
    assert.equal(wrong.status, 400);
    assert.equal(wrong.body.code, 'INVALID_OTP');

    const ok = await request(app).post('/auth/confirm-email').set(auth()).send({ otp: code });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.data.email, NEW_EMAIL);

    const login = await request(app).post('/auth/login').send({ email: NEW_EMAIL, password });
    assert.equal(login.status, 200);
});

test('change-password checks the current password', async () => {
    const wrong = await request(app).post('/auth/change-password').set(auth())
        .send({ currentPassword: 'not-it-123', newPassword: 'changed-password-1' });
    assert.equal(wrong.status, 400);
    assert.equal(wrong.body.code, 'WRONG_PASSWORD');

    const ok = await request(app).post('/auth/change-password').set(auth())
        .send({ currentPassword: password, newPassword: 'changed-password-1' });
    assert.equal(ok.status, 200);
    password = 'changed-password-1';

    const login = await request(app).post('/auth/login').send({ email: NEW_EMAIL, password });
    assert.equal(login.status, 200);
});

test('contact form emails the site owner with reply-to set', async () => {
    const res = await request(app).post('/auth/send-message')
        .send({ firstName: 'Sara', lastName: 'Ali', emailAddress: 'sara@example.com', message: 'Love it!' });
    assert.equal(res.status, 200);
    const mail = inbox[inbox.length - 1];
    assert.equal(mail.replyTo, 'sara@example.com');
    assert.match(mail.subject, /Sara Ali/);
});

test('delete-user removes the account, designs, stored photos and profile photo', async () => {
    const designs = await designModel.find({ user: userId });
    assert.ok(designs.length >= 1);
    const files = designs.flatMap((design) => [design.originalFile, design.visual?.file].filter(Boolean));
    for (const file of files) assert.ok(await storedExists(file), file);

    const missing = await request(app).delete('/auth/delete-user').set(auth()).send({});
    assert.equal(missing.status, 400);
    assert.equal(missing.body.code, 'VALIDATION_ERROR');

    const wrong = await request(app).delete('/auth/delete-user').set(auth()).send({ password: 'nope-nope-1' });
    assert.equal(wrong.status, 400);
    assert.equal(wrong.body.code, 'WRONG_PASSWORD');

    const ok = await request(app).delete('/auth/delete-user').set(auth()).send({ password });
    assert.equal(ok.status, 200);

    const me = await request(app).get('/auth/me').set(auth());
    assert.equal(me.status, 401);
    assert.equal(await designModel.countDocuments({ user: userId }), 0);
    assert.equal(await usageModel.countDocuments({ user: userId }), 0);
    for (const file of files) assert.ok(!(await storedExists(file)), `${file} removed`);
    assert.ok(!(await storedExists(profileImageName)), 'profile photo removed');
    assert.equal(await mediaModel.countDocuments({ owner: userId }), 0);
});

const createGuest = async () => {
    const res = await request(app).post('/auth/guest');
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.data;
};

test('POST /auth/guest creates a 24-hour guest account', async () => {
    const before = inbox.length;
    const guest = await createGuest();
    assert.deepEqual(
        Object.keys(guest).sort(),
        ['accessToken', 'createdAt', 'email', 'emailVerified', 'guestExpiresAt', 'id', 'isGuest', 'profileImage', 'username'],
    );
    assert.equal(guest.isGuest, true);
    assert.equal(guest.username, 'Guest');
    assert.equal(guest.emailVerified, true);
    assert.match(guest.email, /^guest-[a-f0-9]{12}@guest\.redecor\.ai$/);
    const hours = (new Date(guest.guestExpiresAt) - Date.now()) / 3600000;
    assert.ok(hours > 23.9 && hours <= 24, `expires in ${hours}h`);
    assert.equal(inbox.length, before, 'no email is sent to a guest');

    const me = await request(app).get('/auth/me').set('Authorization', `Bearer ${guest.accessToken}`);
    assert.equal(me.status, 200);
    assert.equal(me.body.data.isGuest, true);

    // Two guests never share an account.
    const other = await createGuest();
    assert.notEqual(other.id, guest.id);
});

test('a guest can analyse, visualise and edit their profile', async () => {
    const guest = await createGuest();
    const g = { Authorization: `Bearer ${guest.accessToken}` };

    const analysis = await request(app).post('/ai/analyze').set(g)
        .attach('image', await tinyPng(), { filename: 'room.png', contentType: 'image/png' });
    assert.equal(analysis.status, 201, JSON.stringify(analysis.body));
    const original = await request(app).get(pathOf(analysis.body.data.original.url));
    assert.equal(original.status, 200);
    assert.equal(original.headers['content-type'], 'image/jpeg');

    const visual = await request(app).post(`/ai/designs/${analysis.body.data.id}/visualize`).set(g);
    assert.equal(visual.status, 200, JSON.stringify(visual.body));
    assert.equal(visual.body.data.visual.status, 'ready');

    const profile = await request(app).put('/auth/update-profile').set(g).field('username', 'Recruiter');
    assert.equal(profile.status, 200);
    assert.equal(profile.body.data.username, 'Recruiter');
});

test('guests have smaller daily limits (5 analyses, 5 visuals)', async () => {
    const guest = await createGuest();
    const g = { Authorization: `Bearer ${guest.accessToken}` };
    const first = await request(app).post('/ai/analyze').set(g)
        .attach('image', await tinyPng(), { filename: 'room.png', contentType: 'image/png' });
    assert.equal(first.status, 201);

    await usageModel.insertMany(Array.from({ length: 4 }, () => ({ user: guest.id, kind: 'analysis' })));
    const analyse = await request(app).post('/ai/analyze').set(g)
        .attach('image', await tinyPng(), { filename: 'room.png', contentType: 'image/png' });
    assert.equal(analyse.status, 429);
    assert.equal(analyse.body.code, 'DAILY_LIMIT');
    assert.match(analyse.body.message, /5 photos/);

    await usageModel.insertMany(Array.from({ length: 5 }, () => ({ user: guest.id, kind: 'visual' })));
    const visual = await request(app).post(`/ai/designs/${first.body.data.id}/visualize`).set(g);
    assert.equal(visual.status, 429);
    assert.equal(visual.body.code, 'VISUAL_DAILY_LIMIT');
});

test('guests cannot change email or password', async () => {
    const guest = await createGuest();
    const g = { Authorization: `Bearer ${guest.accessToken}` };

    const email = await request(app).patch('/auth/update-email').set(g).send({ email: 'real@example.com' });
    assert.equal(email.status, 403);
    assert.equal(email.body.code, 'GUEST_NOT_ALLOWED');
    assert.equal(email.body.message, 'Create a free account to use this.');

    const confirm = await request(app).post('/auth/confirm-email').set(g).send({ otp: '123456' });
    assert.equal(confirm.status, 403);
    assert.equal(confirm.body.code, 'GUEST_NOT_ALLOWED');

    const pass = await request(app).post('/auth/change-password').set(g)
        .send({ currentPassword: 'whatever-123', newPassword: 'new-password-1' });
    assert.equal(pass.status, 403);
    assert.equal(pass.body.code, 'GUEST_NOT_ALLOWED');
});

test('a guest can delete their account without a password', async () => {
    const guest = await createGuest();
    const g = { Authorization: `Bearer ${guest.accessToken}` };
    const design = await request(app).post('/ai/analyze').set(g)
        .attach('image', await tinyPng(), { filename: 'room.png', contentType: 'image/png' });
    assert.equal(design.status, 201);
    await request(app).post(`/ai/designs/${design.body.data.id}/visualize`).set(g);
    assert.ok(await mediaModel.countDocuments({ owner: guest.id }) >= 2);

    const del = await request(app).delete('/auth/delete-user').set(g).send({});
    assert.equal(del.status, 200, JSON.stringify(del.body));
    assert.equal(await userModel.countDocuments({ _id: guest.id }), 0);
    assert.equal(await designModel.countDocuments({ user: guest.id }), 0);
    assert.equal(await mediaModel.countDocuments({ owner: guest.id }), 0);
    assert.equal((await request(app).get('/auth/me').set(g)).status, 401);
});

test('expired guests are rejected and cleaned up with all their data', async () => {
    const guest = await createGuest();
    const g = { Authorization: `Bearer ${guest.accessToken}` };
    const design = await request(app).post('/ai/analyze').set(g)
        .attach('image', await tinyPng(), { filename: 'room.png', contentType: 'image/png' });
    assert.equal(design.status, 201);

    await userModel.updateOne({ _id: guest.id }, { $set: { guestExpiresAt: new Date(Date.now() - 1000) } });

    const me = await request(app).get('/auth/me').set(g);
    assert.equal(me.status, 401);
    assert.equal(me.body.code, 'UNAUTHORIZED');

    // The next guest sign-in sweeps expired guests away.
    await createGuest();
    assert.equal(await userModel.countDocuments({ _id: guest.id }), 0);
    assert.equal(await designModel.countDocuments({ user: guest.id }), 0);
    assert.equal(await usageModel.countDocuments({ user: guest.id }), 0);
    assert.equal(await mediaModel.countDocuments({ owner: guest.id }), 0);
});

test('the Vercel entry (api/index.js) passes requests to the app', async () => {
    const handler = require('../api');
    const ping = await request(handler).get('/ping');
    assert.equal(ping.status, 200);
    assert.equal(ping.text, 'Pong');

    const guest = await request(handler).post('/auth/guest');
    assert.equal(guest.status, 201);
});

test('requests get a readable 503 when the database is unreachable', async () => {
    const express = require('express');
    const { makeRequireDatabase } = require('../Models/db');
    const originalError = console.error;
    console.error = () => { };
    try {
        const broken = express();
        broken.use(makeRequireDatabase(() => Promise.reject(new Error('connect ECONNREFUSED'))));
        broken.get('/auth/me', (req, res) => res.send('should not get here'));
        const res = await request(broken).get('/auth/me');
        assert.equal(res.status, 503);
        assert.deepEqual(res.body, {
            success: false,
            message: 'The service is starting up or unavailable. Please try again.',
            code: 'SERVICE_UNAVAILABLE',
        });
    } finally {
        console.error = originalError;
    }
});

test('ensureConnected reports a missing database URL instead of crashing', async () => {
    const { ensureConnected } = require('../Models/db');
    await mongoose.disconnect();
    const saved = { MONGO_URL: process.env.MONGO_URL, MONGODB_URI: process.env.MONGODB_URI };
    delete process.env.MONGO_URL;
    delete process.env.MONGODB_URI;
    try {
        await assert.rejects(ensureConnected(), /MONGO_URL \(or MONGODB_URI\) is missing/);
    } finally {
        process.env.MONGO_URL = saved.MONGO_URL;
        if (saved.MONGODB_URI) process.env.MONGODB_URI = saved.MONGODB_URI;
    }
    // MONGODB_URI (Vercel's Atlas integration) works on its own.
    delete process.env.MONGO_URL;
    process.env.MONGODB_URI = saved.MONGO_URL;
    try {
        await ensureConnected();
        assert.equal(mongoose.connection.readyState, 1);
    } finally {
        process.env.MONGO_URL = saved.MONGO_URL;
        delete process.env.MONGODB_URI;
    }
});

test('unknown routes return JSON 404', async () => {
    const res = await request(app).get('/nope');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
});
