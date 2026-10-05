export function fixedMarkup(cost: number) {
  if (cost <= 500) return 77;
  if (cost <= 1000) return 97;
  if (cost <= 1500) return 127;
  if (cost <= 2500) return 147;
  return 197;
}
export function automaticPixPrice(cost: number) { return cost + fixedMarkup(cost); }
export type StandardPricingTier = { min_cost: number | string; max_cost: number | string | null; fixed_markup: number | string; active?: boolean };
export type AccessoryPricingTier = { min_cost: number | string; max_cost: number | string; multiplier: number | string; active?: boolean };
export function roundAccessoryPrice(value:number){return Math.ceil(value/5)*5-.1}
export function configuredAutomaticPrice(cost:number,mode:"standard"|"accessory",standardTiers:StandardPricingTier[],accessoryTiers:AccessoryPricingTier[]){
  if(mode==="accessory"){
    const tier=accessoryTiers.find((item)=>item.active!==false&&cost>=Number(item.min_cost)&&cost<=Number(item.max_cost));
    if(tier)return roundAccessoryPrice(cost*Number(tier.multiplier));
  }
  const tier=standardTiers.find((item)=>item.active!==false&&cost>=Number(item.min_cost)&&(item.max_cost===null||cost<=Number(item.max_cost)));
  return tier?cost+Number(tier.fixed_markup):automaticPixPrice(cost);
}
export function cardTotal(pixPrice: number, factor: number) { return Math.round(pixPrice * factor * 100) / 100; }
export function unitResult(pixPrice: number, cost: number, commission = .01, delivery = 15, packaging = 1) { return Math.round((pixPrice - cost - pixPrice * commission - delivery - packaging) * 100) / 100; }
