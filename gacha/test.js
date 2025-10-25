const { pullOnce } = require("./algorithm");

// --- Simulation Config ---
const TOTAL_PULLS = 1_000_000;
const pityDistribution = new Array(81).fill(0); // 1–80
const userState = {
  pity5: 0,
  pity4: 0,
  guaranteed5Star: false,
  guaranteed4Star: false
};

// --- Run Simulation ---
for (let i = 0; i < TOTAL_PULLS; i++) {
  const pityBeforePull = userState.pity5;
  const result = pullOnce(userState);

  if (result.rarity === 5) {
    pityDistribution[pityBeforePull + 1]++; // record actual pity
  }
}

// --- Compute Stats ---
const total5Stars = pityDistribution.reduce((a, b) => a + b, 0);
const probabilities = pityDistribution.map(count => (count / total5Stars) * 100);

// --- Output Table ---
console.log("5★ Pulls per Pity:");
console.log("Pity | Pulls | % Chance");
console.log("-------------------------");

pityDistribution.forEach((count, pity) => {
  if (pity > 0) {
    const percent = probabilities[pity].toFixed(2);
    console.log(`${String(pity).padStart(4)} | ${String(count).padStart(6)} | ${percent}%`);
  }
});

// --- Optional ASCII chart ---
console.log("\nDistribution (ASCII Graph)");
probabilities.forEach((p, pity) => {
  if (pity > 0) {
    const bar = "█".repeat(Math.round(p * 1.5));
    console.log(`${String(pity).padStart(2)}: ${bar}`);
  }
});


