import { describe, expect, it } from "vitest";
import { automaticPixPrice, cardTotal, configuredAutomaticPrice, fixedMarkup, roundAccessoryPrice, unitResult } from "./pricing";
import { calculateNextRoute } from "./logistics";
import type { Schedule } from "./types";

describe("precificação Super Cell", () => {
  it.each([[500,77],[500.01,97],[1000,97],[1000.01,127],[1500,127],[1500.01,147],[2500,147],[2500.01,197]])("aplica os limites sem ambiguidade em %s",(cost,markup)=>expect(fixedMarkup(cost)).toBe(markup));
  it("valida o caso POCO F8 Pro",()=>{expect(automaticPixPrice(3400)).toBe(3597);expect(unitResult(3597,3400)).toBe(145.03)});
  it("usa fator efetivo de parcelamento",()=>expect(cardTotal(1000,1.17275)).toBe(1172.75));
  it("arredonda acessórios para final comercial 4,90",()=>expect(roundAccessoryPrice(46.2)).toBe(49.9));
  it("usa faixas configuradas em vez de repetir valores no painel",()=>expect(configuredAutomaticPrice(50,"accessory",[],[{min_cost:20.01,max_cost:50,multiplier:1.65}])).toBe(84.9));
});

const schedules:Schedule[]=[1,2,3,4,5].flatMap((weekday)=>['10:00:00','15:00:00','18:00:00'].map((departure_time,index)=>({id:`${weekday}-${index}`,weekday,departure_time,cutoff_minutes:60,active:true}))).concat([{id:'6-0',weekday:6,departure_time:'10:00:00',cutoff_minutes:60,active:true},{id:'6-1',weekday:6,departure_time:'14:00:00',cutoff_minutes:60,active:true}]);
describe("logística America/Fortaleza",()=>{
  it("seleciona 15h numa terça às 13h20",()=>{const r=calculateNextRoute(new Date('2026-09-29T16:20:00Z'),schedules,[]);expect(r?.departureLabel).toBe('15:00');expect(r?.label).toBe('hoje')});
  it("troca para 18h após o corte das 15h",()=>expect(calculateNextRoute(new Date('2026-09-29T17:10:00Z'),schedules,[])?.departureLabel).toBe('18:00'));
  it("sábado após o último corte aponta segunda",()=>{const r=calculateNextRoute(new Date('2026-10-03T16:10:00Z'),schedules,[]);expect(r?.departureLabel).toBe('10:00');expect(r?.label).not.toBe('hoje')});
  it("domingo aponta segunda às 10h",()=>expect(calculateNextRoute(new Date('2026-10-04T15:00:00Z'),schedules,[])?.departureLabel).toBe('10:00'));
  it("respeita exceção sem rotas",()=>expect(calculateNextRoute(new Date('2026-10-12T10:00:00Z'),schedules,[{exception_date:'2026-10-12',no_routes:true,custom_routes:[],note:null}])?.label).not.toBe('hoje'));
});
