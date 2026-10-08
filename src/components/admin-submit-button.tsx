"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

export function AdminSubmitButton({
  children,
  pendingLabel="Salvando…",
  className,
  disabled=false,
}:{
  children:React.ReactNode;
  pendingLabel?:string;
  className?:string;
  disabled?:boolean;
}){
  const {pending}=useFormStatus();
  return <button
    type="submit"
    className={className}
    disabled={disabled||pending}
    aria-busy={pending}
  >
    {pending?<><LoaderCircle className="spin"/> {pendingLabel}</>:children}
  </button>;
}
