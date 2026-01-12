// lib/memory.js
const fs = require("fs");
const path = require("path");
const MEM_DIR = path.join(__dirname, "..", "memory");

if (!fs.existsSync(MEM_DIR)) fs.mkdirSync(MEM_DIR);

const MAX_ITEMS = 20;

function _fileFor(userId) {
  return path.join(MEM_DIR, `${userId}.json`);
}

function loadMemory(userId) {
  const f = _fileFor(userId);
  if (!fs.existsSync(f)) return [];
  try {
    const arr = JSON.parse(fs.readFileSync(f, "utf8"));
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function pushMemory(userId, msg) {
  const mem = loadMemory(userId);
  mem.push(msg);
  if (mem.length > MAX_ITEMS) mem.splice(0, mem.length - MAX_ITEMS);
  fs.writeFileSync(_fileFor(userId), JSON.stringify(mem, null, 2));
}


module.exports = { loadMemory, pushMemory };
