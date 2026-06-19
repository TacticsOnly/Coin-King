
import { GAME_DATA } from '../data.js';

const $ = (id) => document.getElementById(id);
let state;

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)] }
function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }

function newRun(){
  state = {
    round:1, target:12, score:0, bank:0, throws:0, lastThrow:0,
    coins: structuredClone(GAME_DATA.startingCoins),
    charms: [], shop: [], shieldUsed:false, bonusStart:0
  };
  rollShop();
  render("Neuer Run. Wirf acht Münzen bis zu dreimal.");
}

function hasCharm(type){ return state.charms.find(c => c.type === type); }
function charmValue(type){ return state.charms.filter(c => c.type===type).reduce((a,c)=>a+c.value,0); }

function coinTailChance(coin, index){
  let p = 50;
  p += coin.effectType === "tailBias" ? coin.effectValue : 0;
  p += coin.effectType === "charmBias" ? coin.effectValue * state.charms.length : 0;
  p += charmValue("globalTailBias");
  if (hasCharm("pendulum")) p += state.throws % 2 ? -5 : 10;
  if (hasCharm("radioBias") && index === state.radioIndex) p += charmValue("radioBias");
  return clamp(p, 5, 95);
}

function throwCoins(){
  if(state.throws >= 3) return;
  if(state.throws === 0) {
    state.score += state.bonusStart + charmValue("roundStart");
    state.radioIndex = Math.floor(Math.random()*state.coins.length);
  }
  state.throws++;
  let throwScore = 0, tails = 0, heads = 0;
  const outcomes = [];

  state.coins.forEach((coin, i) => {
    let chance = coinTailChance(coin, i);
    let isTail = Math.random()*100 < chance;
    let rerolled = false;
    if(!isTail && coin.effectType === "rerollHeadsChance"){
      const boost = charmValue("rerollBoost");
      if(Math.random()*100 < coin.effectValue + boost){ isTail = Math.random()*100 < chance; rerolled = true; }
    }
    let val = 0;
    if(isTail){
      tails++;
      val = coin.value + charmValue("globalTailBonus");
      if(coin.effectType === "tailsBonus") val += coin.effectValue;
      if(coin.effectType === "tailMultiplier") val = Math.ceil(val * coin.effectValue);
      if(coin.effectType === "neighborTailBonus"){
        if(state.coins[i-1]) throwScore += coin.effectValue;
        if(state.coins[i+1]) throwScore += coin.effectValue;
      }
      if(hasCharm("tailStreak") && outcomes[i-1]?.isTail) val += charmValue("tailStreak");
    } else {
      heads++;
      val = charmValue("globalHeadsValue");
      if(coin.effectType === "headsValue") val += coin.effectValue + charmValue("headsBuff");
    }
    if(coin.effectType === "flatPerThrow") val += coin.effectValue;
    outcomes.push({isTail,val,rerolled});
    throwScore += val;
  });

  state.coins.forEach((coin, i) => {
    if(coin.effectType === "comboTails" && tails >= 5) throwScore += coin.effectValue;
    if(coin.effectType === "comboHeads" && heads >= 5) throwScore += coin.effectValue;
    if(coin.effectType === "tripleTailBonus"){
      coin.tailMemory = (coin.tailMemory || 0) + (outcomes[i].isTail ? 1 : 0);
      if(coin.tailMemory >= 3){ throwScore += coin.effectValue; coin.tailMemory = 0; }
    }
    if(coin.effectType === "echoPercent") throwScore += Math.ceil(state.lastThrow * coin.effectValue / 100);
    if(coin.effectType === "jackpotMultiplier" && state.throws === 3 && outcomes[i].isTail){
      coin.jackpotTicks = (coin.jackpotTicks || 0) + 1;
      if(coin.jackpotTicks >= 3) throwScore += Math.ceil(outcomes[i].val * coin.effectValue);
    }
  });

  if(hasCharm("manyTailsBonus") && tails >= 6) throwScore += charmValue("manyTailsBonus");
  if(hasCharm("manyHeadsBonus") && heads >= 6) throwScore += charmValue("manyHeadsBonus");
  if(hasCharm("exactFourTailsMult") && tails === 4) throwScore = Math.ceil(throwScore * hasCharm("exactFourTailsMult").value);
  if(hasCharm("thirdThrowMult") && state.throws === 3) throwScore = Math.ceil(throwScore * hasCharm("thirdThrowMult").value);
  if(hasCharm("echoLastThrow")) throwScore += Math.ceil(state.lastThrow * charmValue("echoLastThrow") / 100);
  if(hasCharm("minFirstThrow") && state.throws === 1) throwScore = Math.max(throwScore, charmValue("minFirstThrow"));

  state.lastThrow = throwScore;
  state.score += throwScore;
  state.lastOutcomes = outcomes;
  render(`Wurf ${state.throws}: ${tails}× Zahl, ${heads}× Kopf → +${throwScore} Punkte.`);
}

function endRound(){
  if(state.score < state.target){
    const shield = hasCharm("shield");
    if(shield && !state.shieldUsed){ state.shieldUsed = true; log("Salzkreis rettet den Run einmalig."); }
    else { render(`Run verloren. ${state.score}/${state.target} Punkte.`); $("throwBtn").disabled = true; $("endBtn").disabled = true; return; }
  }
  let surplus = Math.max(0, state.score - state.target);
  surplus += Math.ceil(surplus * charmValue("surplusBonus") / 100);
  // coin-specific interest
  state.coins.forEach(c => { if(c.effectType === "interest") surplus += Math.ceil(surplus * c.effectValue / 100); });
  state.bank += surplus;
  state.round++;
  const slow = hasCharm("slowScaling") ? hasCharm("slowScaling").value : 1;
  state.target = Math.ceil((12 + state.round * 7 + state.round * state.round * 1.7) * slow);
  state.score = 0; state.throws = 0; state.lastThrow = 0;
  state.coins.forEach(c => { c.jackpotTicks = 0; });
  rollShop();
  render(`Runde geschafft. Überschuss: +${surplus} Bankpunkte. Shop geöffnet.`);
}

function rarityWeight(c){
  const weights = {common:55, uncommon:28, rare:13, epic:5, legendary:2};
  let w = weights[c.rarity] || 1;
  if(hasCharm("rareShop") && ["rare","epic","legendary"].includes(c.rarity)) w *= 2.2;
  return w;
}
function weightedCoin(){
  const pool = GAME_DATA.coins;
  const sum = pool.reduce((a,c)=>a+rarityWeight(c),0);
  let r = Math.random()*sum;
  for(const c of pool){ r -= rarityWeight(c); if(r <= 0) return structuredClone(c); }
  return structuredClone(pool[0]);
}
function rollShop(){
  const count = 3 + (hasCharm("extraShop") ? 1 : 0);
  state.shop = [];
  for(let i=0;i<count;i++){
    state.shop.push(Math.random()<.68 ? {...weightedCoin(), kind:"coin"} : {...rand(GAME_DATA.charms), kind:"charm"});
  }
}

function price(item){
  let cost = item.cost - charmValue("shopDiscount");
  if(hasCharm("darkDiscount") && (item.name.includes("Void") || item.name.includes("Glitch"))) cost = Math.ceil(cost * .7);
  return Math.max(1, cost);
}
window.buyItem = function(i){
  const item = state.shop[i], cost = price(item);
  if(state.bank < cost) return;
  state.bank -= cost;
  if(item.kind === "coin"){
    if(state.coins.length >= 8) state.coins.shift();
    state.coins.push(structuredClone(item));
  } else if(!state.charms.some(c=>c.id===item.id)){
    state.charms.push(structuredClone(item));
    if(hasCharm("buyCharge")) state.bonusStart += charmValue("buyCharge");
  }
  state.shop.splice(i,1);
  render(`Gekauft: ${item.name}.`);
}

function render(message=""){
  $("round").textContent = state.round; $("target").textContent = state.target; $("score").textContent = state.score;
  $("bank").textContent = state.bank; $("throws").textContent = `${state.throws} / 3`;
  $("throwBtn").disabled = state.throws >= 3;
  $("endBtn").disabled = false;
  $("log").textContent = message;
  $("coins").innerHTML = state.coins.map((c,i)=>{
    const o = state.lastOutcomes?.[i];
    const side = o ? (o.isTail ? "Z" : "K") : "?";
    return `<div class="coinCard" title="${c.text}">
      <div class="coin ${o?.isTail?'tail':'head'} flip">${side}</div>
      <div class="meta">${c.name}<br>Wert ${c.value} · ${Math.round(coinTailChance(c,i))}% Z</div>
      <div class="result">${o ? '+'+o.val : ''}</div>
    </div>`
  }).join("");
  $("shop").innerHTML = state.shop.map((it,i)=>`<div class="item rarity-${it.rarity||'charm'}">
    <small>${it.kind === 'coin' ? 'Münze' : 'Glücksbringer'} · Kosten ${price(it)}</small>
    <h3>${it.name}</h3>
    <p>${it.kind === 'coin' ? `Wert ${it.value}. ` : ''}${it.text}</p>
    <button onclick="buyItem(${i})">Kaufen</button>
  </div>`).join("");
  $("charms").innerHTML = state.charms.length ? state.charms.map(c=>`<span class="badge" title="${c.text}">${c.name}</span>`).join("") : "<p>Noch keine.</p>";
}
function log(t){ $("log").textContent = t; }

$("throwBtn").addEventListener("click", throwCoins);
$("endBtn").addEventListener("click", endRound);
$("newRun").addEventListener("click", newRun);
newRun();
