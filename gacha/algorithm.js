const { banners, activeBanners } = require("./data");

// Utility
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Base drop rates
const baseRates = {
  fiveStar: 0.008, // 0.6%
  fourStar: 0.06, //6%
  threeStar: 0.932 // 93.2%
};

// Pity thresholds
const pityLimits = {
  fiveStar: 80,
  fourStar: 10
};

//5★ Rate Curve 
function getFiveStarRate(pityCount) {
  const base = 0.0105; // ~1.05% base rate up to 60
  const hardPity = 80;
  const softStart = 60;

  if (pityCount < softStart) {
    return base; // flat chance
  }

  const progress = pityCount - softStart;
  const exponent = 2.12; // controls curve steepness
  const maxProgress = hardPity - softStart;
  const rate = base + Math.pow(progress / maxProgress, exponent) * (1 - base);

  return Math.min(rate, 1.0);
}

// 4★ Rate Curve 
function getFourStarRate(pityCount) {
  if (pityCount < 8) return baseRates.fourStar;
  const increase = 0.12 * (pityCount - 8);
  return Math.min(baseRates.fourStar + increase, 1.0);
}

//Pull Logic
function pullOnce(userState, bannerOption) {
  const bannerName = activeBanners[bannerOption];
  const banner = banners[bannerName];

  if (!banner) throw new Error(`Unknown banner: ${bannerOption}`);

  const { featured5Star, featured4Stars, standard5Stars, standard4Stars, standard3Stars } = banner;

  let { pity5, pity4, guaranteed5Star, guaranteed4Star } = userState;

  const rate5 = getFiveStarRate(pity5);
  const rate4 = getFourStarRate(pity4);
  const roll = Math.random();
  let result;

  // 5★ Pull 

if (roll < rate5 || pity5 >= pityLimits.fiveStar - 1) {
  pity5 = 0;
  pity4 = 0;

  const win50 = Math.random() < 0.45; // rate: 45 - 55 eksdee
  let result;

  // If it's guaranteed featured or won 50/50
  if (guaranteed5Star || win50) {
    result = { rarity: 5, name: featured5Star };
    guaranteed5Star = false;
  } else {
    //Standard 5★ pull
    guaranteed5Star = true;

    /// increased standard 5*
    const boostedStandard5Star = "Lingyang"; 
    const boostedRateMultiplier = 1; // x1 more likely than others

    // Weighted selection
    const pool = standard5Stars.map(name => ({
      name,
      weight: name === boostedStandard5Star ? boostedRateMultiplier : 1
    }));

    const totalWeight = pool.reduce((sum, c) => sum + c.weight, 0);
    const r = Math.random() * totalWeight;

    let acc = 0;
    let chosen = pool[0].name;
    for (const c of pool) {
      acc += c.weight;
      if (r <= acc) {
        chosen = c.name;
        break;
      }
    }

    result = { rarity: 5, name: chosen, boosted: chosen === boostedStandard5Star };
  }

  userState.pity5 = pity5;
  userState.pity4 = pity4;
  userState.guaranteed5Star = guaranteed5Star;
  userState.guaranteed4Star = guaranteed4Star;
  return result;
}


  //4★ Pull 
  if (roll < rate5 + rate4 || pity4 >= pityLimits.fourStar - 1) {
  pity5++;
  pity4 = 0;

  const win50 = Math.random() < 0.5;
  const base4 = guaranteed4Star || win50
    ? { rarity: 4, name: getRandomElement(featured4Stars) }
    : { rarity: 4, name: getRandomElement(standard4Stars) };

  guaranteed4Star = !win50; // lose 50/50 = next one guaranteed
  
  result = base4;

  userState.pity5 = pity5;
  userState.pity4 = pity4;
  userState.guaranteed5Star = guaranteed5Star;
  userState.guaranteed4Star = guaranteed4Star;

  return result;

}

  // 3★ Pull
  pity5++;
  pity4++;
  result = { rarity: 3, name: getRandomElement(standard3Stars) };

  userState.pity5 = pity5;
  userState.pity4 = pity4;
  return result;
}

module.exports = { pullOnce };


