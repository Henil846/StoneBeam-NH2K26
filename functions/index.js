/* eslint-disable require-jsdoc, max-len */
const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

setGlobalOptions({maxInstances: 10});

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {v4: uuidv4} = require("uuid");

require("dotenv").config();

admin.initializeApp();
const db = admin.firestore();

async function getJwtSecret() {
  // For free deployment, using a fixed secret (not secure for production)
  return "fixed_secret_for_free_deployment_demo";
}

const app = express();
app.use(cors({origin: true}));
app.use(bodyParser.json());

async function createAccessToken(payload) {
  const JWT_SECRET = await getJwtSecret();
  return jwt.sign(payload, JWT_SECRET, {expiresIn: "15m"});
}

async function createRefreshToken(payload, jti) {
  const JWT_SECRET = await getJwtSecret();
  return jwt.sign({...payload, jti}, JWT_SECRET, {expiresIn: "30d"});
}

async function saveRefreshToken(jti, uid) {
  await db.collection("refreshTokens").doc(jti).set({uid, createdAt: admin.firestore.FieldValue.serverTimestamp()});
}

async function revokeRefreshToken(jti) {
  await db.collection("refreshTokens").doc(jti).delete();
}

async function checkRefreshToken(jti) {
  const doc = await db.collection("refreshTokens").doc(jti).get();
  return doc.exists ? doc.data() : null;
}

async function findUserByEmail(email) {
  const q = await db.collection("users").where("email", "==", email).limit(1).get();
  if (q.empty) return null;
  const doc = q.docs[0];
  return {id: doc.id, ...doc.data()};
}

function authMiddleware(req, res, next) {
  return (async () => {
    const auth = req.headers.authorization || "";
    const m = auth.match(/^Bearer (.+)$/);
    if (!m) return res.status(401).json({error: "Missing or invalid Authorization header"});
    const token = m[1];
    try {
      const JWT_SECRET = await getJwtSecret();
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      return next();
    } catch (err) {
      return res.status(401).json({error: "Invalid or expired token"});
    }
  })();
}

app.get("/health", (req, res) => res.json({ok: true}));

// Auth: signup
app.post("/auth/signup", async (req, res) => {
  try {
    const {email, password, displayName} = req.body;
    if (!email || !password) return res.status(400).json({error: "email and password required"});
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({error: "Email already in use"});

    const passwordHash = await bcrypt.hash(password, 10);
    const userRef = db.collection("users").doc();
    const uid = userRef.id;
    await userRef.set({email, displayName: displayName || null, passwordHash, createdAt: admin.firestore.FieldValue.serverTimestamp()});

    const accessToken = await createAccessToken({uid, email});
    const jti = uuidv4();
    const refreshToken = await createRefreshToken({uid, email}, jti);
    await saveRefreshToken(jti, uid);

    return res.json({accessToken, refreshToken, user: {uid, email, displayName}});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

// Auth: login
app.post("/auth/login", async (req, res) => {
  try {
    const {email, password} = req.body;
    if (!email || !password) return res.status(400).json({error: "email and password required"});
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({error: "Invalid credentials"});
    const ok = await bcrypt.compare(password, user.passwordHash || "");
    if (!ok) return res.status(400).json({error: "Invalid credentials"});

    const uid = user.id;
    const accessToken = await createAccessToken({uid, email});
    const jti = uuidv4();
    const refreshToken = await createRefreshToken({uid, email}, jti);
    await saveRefreshToken(jti, uid);

    return res.json({accessToken, refreshToken, user: {uid, email, displayName: user.displayName || null}});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

// Auth: refresh
app.post("/auth/refresh", async (req, res) => {
  try {
    const {refreshToken} = req.body;
    if (!refreshToken) return res.status(400).json({error: "refreshToken required"});
    let payload;
    try {
      const JWT_SECRET = await getJwtSecret();
      payload = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({error: "Invalid refresh token"});
    }
    const {jti, uid, email} = payload;
    const stored = await checkRefreshToken(jti);
    if (!stored) return res.status(401).json({error: "Refresh token revoked or not found"});

    const accessToken = await createAccessToken({uid, email});
    return res.json({accessToken});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

// Auth: logout (revoke refresh token)
app.post("/auth/logout", async (req, res) => {
  try {
    const {refreshToken} = req.body;
    if (!refreshToken) return res.status(400).json({error: "refreshToken required"});
    let payload;
    try {
      const JWT_SECRET = await getJwtSecret();
      payload = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      return res.status(200).json({ok: true});
    }
    const {jti} = payload;
    await revokeRefreshToken(jti);
    return res.json({ok: true});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

// Get current user profile
app.get("/users/me", authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) return res.status(404).json({error: "User not found"});
    const data = doc.data();
    delete data.passwordHash;
    return res.json({uid: doc.id, ...data});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

// Posts CRUD
app.get("/posts", async (req, res) => {
  try {
    const q = await db.collection("posts").orderBy("createdAt", "desc").get();
    const posts = q.docs.map((d) => ({id: d.id, ...d.data()}));
    return res.json(posts);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

app.get("/posts/:id", async (req, res) => {
  try {
    const doc = await db.collection("posts").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({error: "Post not found"});
    return res.json({id: doc.id, ...doc.data()});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

app.post("/posts", authMiddleware, async (req, res) => {
  try {
    const {title, content} = req.body;
    if (!title) return res.status(400).json({error: "title required"});
    const docRef = db.collection("posts").doc();
    await docRef.set({title, content: content || null, authorUid: req.user.uid, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp()});
    return res.json({id: docRef.id});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

app.put("/posts/:id", authMiddleware, async (req, res) => {
  try {
    const docRef = db.collection("posts").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({error: "Post not found"});
    const post = doc.data();
    if (post.authorUid !== req.user.uid) return res.status(403).json({error: "Not allowed"});
    const {title, content} = req.body;
    await docRef.update({title: title || post.title, content: content || post.content, updatedAt: admin.firestore.FieldValue.serverTimestamp()});
    return res.json({ok: true});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

app.delete("/posts/:id", authMiddleware, async (req, res) => {
  try {
    const docRef = db.collection("posts").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({error: "Post not found"});
    const post = doc.data();
    if (post.authorUid !== req.user.uid) return res.status(403).json({error: "Not allowed"});
    await docRef.delete();
    return res.json({ok: true});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

// Guides CRUD (similar to posts)
app.get("/guides", async (req, res) => {
  try {
    const q = await db.collection("guides").orderBy("createdAt", "desc").get();
    const guides = q.docs.map((d) => ({id: d.id, ...d.data()}));
    return res.json(guides);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

app.get("/guides/:id", async (req, res) => {
  try {
    const doc = await db.collection("guides").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({error: "Guide not found"});
    return res.json({id: doc.id, ...doc.data()});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

app.post("/guides", authMiddleware, async (req, res) => {
  try {
    const {title, content} = req.body;
    if (!title) return res.status(400).json({error: "title required"});
    const docRef = db.collection("guides").doc();
    await docRef.set({title, content: content || null, authorUid: req.user.uid, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp()});
    return res.json({id: docRef.id});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

app.put("/guides/:id", authMiddleware, async (req, res) => {
  try {
    const docRef = db.collection("guides").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({error: "Guide not found"});
    const guide = doc.data();
    if (guide.authorUid !== req.user.uid) return res.status(403).json({error: "Not allowed"});
    const {title, content} = req.body;
    await docRef.update({title: title || guide.title, content: content || guide.content, updatedAt: admin.firestore.FieldValue.serverTimestamp()});
    return res.json({ok: true});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

app.delete("/guides/:id", authMiddleware, async (req, res) => {
  try {
    const docRef = db.collection("guides").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({error: "Guide not found"});
    const guide = doc.data();
    if (guide.authorUid !== req.user.uid) return res.status(403).json({error: "Not allowed"});
    await docRef.delete();
    return res.json({ok: true});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

// Premium CRUD (similar to posts, but perhaps with premium flag)
app.get("/premium", async (req, res) => {
  try {
    const q = await db.collection("premium").orderBy("createdAt", "desc").get();
    const premium = q.docs.map((d) => ({id: d.id, ...d.data()}));
    return res.json(premium);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

app.get("/premium/:id", async (req, res) => {
  try {
    const doc = await db.collection("premium").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({error: "Premium content not found"});
    return res.json({id: doc.id, ...doc.data()});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

app.post("/premium", authMiddleware, async (req, res) => {
  try {
    const {title, content} = req.body;
    if (!title) return res.status(400).json({error: "title required"});
    const docRef = db.collection("premium").doc();
    await docRef.set({title, content: content || null, authorUid: req.user.uid, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp()});
    return res.json({id: docRef.id});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

app.put("/premium/:id", authMiddleware, async (req, res) => {
  try {
    const docRef = db.collection("premium").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({error: "Premium content not found"});
    const premium = doc.data();
    if (premium.authorUid !== req.user.uid) return res.status(403).json({error: "Not allowed"});
    const {title, content} = req.body;
    await docRef.update({title: title || premium.title, content: content || premium.content, updatedAt: admin.firestore.FieldValue.serverTimestamp()});
    return res.json({ok: true});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

app.delete("/premium/:id", authMiddleware, async (req, res) => {
  try {
    const docRef = db.collection("premium").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({error: "Premium content not found"});
    const premium = doc.data();
    if (premium.authorUid !== req.user.uid) return res.status(403).json({error: "Not allowed"});
    await docRef.delete();
    return res.json({ok: true});
  } catch (err) {
    logger.error(err);
    return res.status(500).json({error: "Internal error"});
  }
});

// Additional endpoints for guides/premium can be added similarly under /guides and /premium

exports.api = onRequest(app);
