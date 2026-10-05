"use client";
import { useEffect, useMemo, useState } from "react";
import { Clock3, Route } from "lucide-react";
import type { LogisticsException, Schedule } from "@/lib/types";
import { calculateNextRoute } from "@/lib/logistics";
const clock = (ms:number) => { const total=Math.max(0,Math.floor(ms/1000)), h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60; return [h,m,s].map((n)=>String(n).padStart(2,"0")).join(":"); };
export function LogisticsCard({ schedules, exceptions }: { schedules: Schedule[]; exceptions: LogisticsException[] }) {
  const [now,setNow]=useState<Date|null>(null); useEffect(()=>{const initial=window.setTimeout(()=>setNow(new Date()),0); const timer=window.setInterval(()=>setNow(new Date()),1000); return()=>{window.clearTimeout(initial);window.clearInterval(timer);};},[]);
  const route=useMemo(()=>now?calculateNextRoute(now,schedules,exceptions):null,[now,schedules,exceptions]);
  if(!now)return <div className="logistics-card"><Clock3/><div><strong>Calculando a próxima rota de envio</strong><p>Consultando os horários de rota da Super Cell.</p></div></div>;
  if(!route)return <div className="logistics-card"><Route/><div><strong>Rotas temporariamente indisponíveis</strong><p>Fale com um vendedor para confirmar a entrega.</p></div></div>;
  const cutoffLabel=new Intl.DateTimeFormat("pt-BR",{hour:"2-digit",minute:"2-digit",timeZone:"America/Fortaleza"}).format(route.cutoff);
  return <div className={`logistics-card ${route.urgent?"urgent":""}`}><Route/><div className="logistics-content"><span className="small-label">Próxima rota de envio</span><strong>{route.label} às {route.departureLabel}</strong><p>Faça seu pedido até {cutoffLabel} para entrar nesta rota.</p><div className="countdown"><Clock3 size={17}/><span>Fechamento em</span><b>{clock(route.cutoff.getTime()-now.getTime())}</b></div>{route.nextSameDay&&<small>Outra rota no mesmo dia: {route.nextSameDay}</small>}</div></div>;
}
