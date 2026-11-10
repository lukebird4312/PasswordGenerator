/*
 vault.js — encrypted password storage
 */

const Vault = (() => {
  const STORAGE_KEY = "p4vault";
  const ITERATIONS = 600000;          
  const CHECK_TEXT = "p4vault-check"; // encrypted at creation to verify the master password
  const AUTO_LOCK_MS = 5 * 60 * 1000; // lock after 5 minutes of inactivity

  let key = null;        // CryptoKey while unlocked, null while locked
  let lockTimer = null;
  let onLock = null;     // optional UI callback
  let store = (typeof localStorage !== "undefined") ? localStorage : null;

  const enc = new TextEncoder();
  const dec = new TextDecoder();

  // ---------- helpers ----------
  const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const randomBytes = (n) => crypto.getRandomValues(new Uint8Array(n)); // CSPRNG

  function load() {
    const raw = store.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  function save(data) {
    store.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async function deriveKey(master, salt, iterations) {
    const base = await crypto.subtle.importKey(
      "raw", enc.encode(master), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations },
      base,
      { name: "AES-GCM", length: 256 },
      false,                       // non-extractable: JS can't read the raw key bytes
      ["encrypt", "decrypt"]);
  }

  async function encrypt(obj) {
    const iv = randomBytes(12);    // NEVER reuse an IV with the same key in GCM
    const ct = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(obj)));
    return { iv: toB64(iv), ct: toB64(ct) };
  }

  async function decrypt(blob, k = key) {
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64(blob.iv) }, k, fromB64(blob.ct));
    return JSON.parse(dec.decode(pt));   // throws if tampered or wrong key
  }

  function requireUnlocked() {
    if (!key) throw new Error("Vault is locked");
    resetTimer();
  }

  function resetTimer() {
    clearTimeout(lockTimer);
    lockTimer = setTimeout(lock, AUTO_LOCK_MS);
  }

  // ---------- public API ----------
  function exists() { return load() !== null; }
  function isUnlocked() { return key !== null; }

  async function create(master) {
    if (exists()) throw new Error("A vault already exists");
    if (!master || master.length < 12) throw new Error("Master password must be at least 12 characters");
    const salt = randomBytes(16);
    key = await deriveKey(master, salt, ITERATIONS);
    save({
      version: 1,
      kdf: { name: "PBKDF2-SHA256", iterations: ITERATIONS, salt: toB64(salt) },
      check: await encrypt(CHECK_TEXT),
      entries: []
    });
    resetTimer();
  }

  async function unlock(master) {
    const data = load();
    if (!data) throw new Error("No vault found");
    const k = await deriveKey(master, fromB64(data.kdf.salt), data.kdf.iterations);
    try {
      if (await decrypt(data.check, k) !== CHECK_TEXT) throw new Error();
    } catch {
      throw new Error("Wrong master password");
    }
    key = k;
    resetTimer();
  }

  function lock() {
    key = null;
    clearTimeout(lockTimer);
    if (onLock) onLock();
  }

  async function addEntry(site, username, password) {
    requireUnlocked();
    const data = load();
    const id = toB64(randomBytes(9));
    data.entries.push({ id, ...(await encrypt({ site, username, password, created: Date.now() })) });
    save(data);
    return id;
  }

  async function listEntries() {
    requireUnlocked();
    const data = load();
    return Promise.all(data.entries.map(async (e) => ({ id: e.id, ...(await decrypt(e)) })));
  }

  async function updateEntry(id, site, username, password) {
    requireUnlocked();
    const data = load();
    const i = data.entries.findIndex((e) => e.id === id);
    if (i < 0) throw new Error("Entry not found");
    data.entries[i] = { id, ...(await encrypt({ site, username, password, created: Date.now() })) };
    save(data);
  }

  function deleteEntry(id) {
    requireUnlocked();
    const data = load();
    data.entries = data.entries.filter((e) => e.id !== id);
    save(data);
  }

  // Encrypted backup: safe to download, useless without the master password
  function exportVault() { return store.getItem(STORAGE_KEY); }
  function importVault(json) {
    const d = JSON.parse(json);
    if (!d.kdf || !d.check || !Array.isArray(d.entries)) throw new Error("Not a vault file");
    lock();
    save(d);
  }

  function destroy() { lock(); store.removeItem(STORAGE_KEY); }

  return {
    exists, isUnlocked, create, unlock, lock,
    addEntry, listEntries, updateEntry, deleteEntry,
    exportVault, importVault, destroy,
    set onLock(fn) { onLock = fn; },
    _setStorage(s) { store = s; }   // for testing outside a browser
  };
})();

if (typeof module !== "undefined") module.exports = Vault;
