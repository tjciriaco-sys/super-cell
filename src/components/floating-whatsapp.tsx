"use client";
function whatsappUrl(number:string,message:string){
  const digits=number.replace(/\D/g,"");
  return digits?`https://wa.me/${digits}?text=${encodeURIComponent(message)}`:"#";
}
function WhatsAppMark(){
  return <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.003 2.667C8.65 2.667 2.667 8.65 2.663 16a13.26 13.26 0 0 0 1.775 6.641L2.553 29.55l7.069-1.854A13.31 13.31 0 0 0 16 29.333h.005c7.35 0 13.328-5.981 13.332-13.333a13.245 13.245 0 0 0-3.901-9.427 13.244 13.244 0 0 0-9.433-3.906Zm.002 24.415h-.005a11.06 11.06 0 0 1-5.639-1.543l-.406-.241-4.184 1.097 1.117-4.077-.266-.418a11.065 11.065 0 0 1-1.708-5.9c.003-6.117 4.978-11.092 11.095-11.092a11.02 11.02 0 0 1 7.845 3.253A11.02 11.02 0 0 1 27.1 16c-.003 6.117-4.981 11.082-11.095 11.082Zm6.086-8.308c-.334-.167-1.973-.974-2.278-1.085-.306-.111-.529-.167-.751.167-.222.334-.862 1.085-1.056 1.308-.194.222-.389.25-.723.083-.333-.166-1.406-.518-2.678-1.651-.99-.883-1.657-1.974-1.852-2.308-.194-.333-.02-.513.146-.68.15-.149.334-.389.5-.583.167-.195.222-.334.334-.556.11-.222.055-.417-.028-.584-.083-.167-.75-1.808-1.028-2.475-.271-.649-.546-.561-.75-.572-.195-.01-.417-.012-.639-.012s-.584.083-.889.417c-.306.334-1.167 1.14-1.167 2.78 0 1.64 1.195 3.224 1.362 3.447.167.222 2.352 3.59 5.698 5.034.795.343 1.416.548 1.9.701.798.253 1.523.217 2.096.132.639-.096 1.972-.807 2.25-1.585.278-.778.278-1.445.195-1.585-.084-.139-.306-.222-.64-.389Z"/></svg>;
}
export function FloatingWhatsApp({number,message}:{number:string;message:string}){
  if(!number)return null;
  return <a className="floating-whatsapp" onClick={()=>window.dispatchEvent(new Event("supercell:contact"))} href={whatsappUrl(number,message)} target="_blank" rel="noreferrer" aria-label="Falar agora com a Super Cell pelo WhatsApp"><span className="floating-wa-label"><strong>Falar agora</strong><small>WhatsApp Super Cell</small></span><span className="floating-wa-orbit" aria-hidden="true"/><span className="floating-wa-icon"><WhatsAppMark/></span></a>;
}
