const { createCanvas, loadImage } = require("canvas");
const path = require("path");

const canvasWidth = 2222;
const canvasHeight = 1000;

const positions = [
  // Top row
  { x: 373 - 20,  y: 180 },
  { x: 681 - 20,  y: 180 },
  { x: 989 - 20,  y: 180 },
  { x: 1297 - 20, y: 180 },
  { x: 1605 - 20, y: 180 },

  // Bottom row
  { x: 373 - 20,  y: 488 },
  { x: 681 - 20,  y: 488 },
  { x: 989 - 20,  y: 488 },
  { x: 1297 - 20, y: 488 },
  { x: 1605 - 20, y: 488 }
];

async function renderGachaResult(results) {
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // Draw background
  const bg = await loadImage(path.join(__dirname, "./assets/pull_bg.png"));
  ctx.drawImage(bg, 0, 0, canvasWidth, canvasHeight);

  // Sort results by rarity (highest first)
  const sorted = [...results].sort((a, b) => {
    if (a.rarity !== b.rarity) return b.rarity - a.rarity;
    return 0;
  });

  // If single pull → center item
  if (sorted.length === 1) {
    const { rarity, name } = sorted[0];
    const x = (canvasWidth / 2) - (274 / 2);  // 274 is image width
    const y = (canvasHeight / 2) - (287 / 2); // 287 is image height

    try {
      const iconPath = path.join(__dirname, "./assets", `${name}.png`);
      const icon = await loadImage(iconPath);
      ctx.drawImage(icon, x, y, 274, 287);
    } catch (err) {
      console.warn(`⚠️ Missing icon for: ${name} → fallback ${rarity}★`);
      const fallback = await loadImage(path.join(__dirname, `./assets/${rarity}star.png`));
      ctx.drawImage(fallback, x, y, 274, 287);
    }

    //console.log(`Single pull: ${name} (${rarity}★)`);
  } 
  else {
    // Normal 10-pull layout
    for (let i = 0; i < sorted.length && i < positions.length; i++) {
      const { rarity, name } = sorted[i];
      const { x, y } = positions[i];

      try {
        const iconPath = path.join(__dirname, "./assets", `${name}.png`);
        const icon = await loadImage(iconPath);
        ctx.drawImage(icon, x, y, 274, 287);
      } catch (err) {
        console.warn(`⚠️ Missing icon for: ${name} → fallback ${rarity}★`);
        const fallback = await loadImage(path.join(__dirname, `./assets/${rarity}star.png`));
        ctx.drawImage(fallback, x, y, 274, 287);
      }

      //console.log(`Slot ${i + 1}: ${name} (${rarity}★)`);
    }
  }

    return canvas.toBuffer("image/jpeg", { quality: 0.7 });

}

module.exports = { renderGachaResult };




