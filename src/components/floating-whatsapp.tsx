function whatsappUrl(number:string,message:string){
  const digits=number.replace(/\D/g,"");
  return digits?`https://wa.me/${digits}?text=${encodeURIComponent(message)}`:"#";
}
function WhatsAppMark(){
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 5.2a10.5 10.5 0 0 0-9 15.9L5.5 26.5l5.5-1.4A10.5 10.5 0 1 0 16 5.2Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/><path d="M12 10.8c-.3-.7-.6-.7-.9-.7h-.8c-.3 0-.8.1-1.2.6-.4.5-1.5 1.5-1.5 3.6s1.5 4.2 1.7 4.5c.2.3 3 4.8 7.4 6.5 3.7 1.4 4.4 1.1 5.2 1 .8-.1 2.6-1.1 3-2.1.4-1 .4-1.9.3-2.1-.1-.2-.4-.3-.8-.5l-2.9-1.4c-.4-.2-.7-.3-1 .3-.3.5-1.2 1.4-1.5 1.7-.3.3-.5.4-1 .1-.5-.2-2-.8-3.8-2.5-1.4-1.2-2.3-2.8-2.6-3.3-.3-.5 0-.7.2-1l.7-.8c.2-.3.3-.5.5-.8.2-.3.1-.6 0-.8L12 10.8Z" fill="currentColor"/></svg>;
}
export function FloatingWhatsApp({number,message}:{number:string;message:string}){
  if(!number)return null;
  return <a className="floating-whatsapp" href={whatsappUrl(number,message)} target="_blank" rel="noreferrer" aria-label="Falar agora com a Super Cell pelo WhatsApp"><span className="floating-wa-label"><strong>Falar agora</strong><small>WhatsApp Super Cell</small></span><span className="floating-wa-orbit" aria-hidden="true"/><span className="floating-wa-icon"><WhatsAppMark/></span></a>;
}
