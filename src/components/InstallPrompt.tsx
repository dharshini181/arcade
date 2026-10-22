import {AnimatePresence,motion} from 'framer-motion';import {useEffect,useState} from 'react';import {sfx} from '../lib/sound';
type BIP=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
const KEY='hype-install-dismissed-v3';
// Catch the browser's install event as early as possible (it can fire before the lobby mounts).
let deferred:BIP|null=null;const subs=new Set<()=>void>();
if(typeof window!=='undefined')window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e as BIP;subs.forEach(f=>f())});
const standalone=()=>matchMedia('(display-mode: standalone)').matches||(navigator as unknown as {standalone?:boolean}).standalone===true;
const isIos=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
const recentlyDismissed=()=>{try{return sessionStorage.getItem(KEY)==='1'}catch{return false}};
const remember=()=>{try{sessionStorage.setItem(KEY,'1')}catch{/* storage blocked */}};
export const openInstall=()=>window.dispatchEvent(new Event('hype-install-open'));
/** Small "install as app" pop-up. Shows a real Install button when the browser allows it, otherwise a short how-to. */
export function InstallPrompt(){
const [show,setShow]=useState(false),[,tick]=useState(0);
useEffect(()=>{const open=()=>setShow(true);window.addEventListener('hype-install-open',open);
if(standalone()||recentlyDismissed())return()=>window.removeEventListener('hype-install-open',open);
const f=()=>tick(n=>n+1);subs.add(f);
const onInstalled=()=>{setShow(false);remember()};window.addEventListener('appinstalled',onInstalled);
const t=window.setTimeout(()=>setShow(true),1500);
return()=>{window.removeEventListener('hype-install-open',open);subs.delete(f);window.removeEventListener('appinstalled',onInstalled);clearTimeout(t)}},[]);
const close=()=>{setShow(false);remember()};
const install=async()=>{if(!deferred)return;sfx('coin');const e=deferred;deferred=null;await e.prompt();const c=await e.userChoice;setShow(false);if(c.outcome==='accepted')remember()};
const can=!!deferred;
return <AnimatePresence>{show&&<motion.div role="dialog" aria-label="Install HYPE app" initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} exit={{y:80,opacity:0}} transition={{type:'spring',stiffness:260,damping:22}}
className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-[60] mx-auto flex max-w-sm items-center gap-3 rounded-2xl border-2 border-gold bg-panel p-2.5 shadow-[0_0_20px_rgba(255,215,0,.45),0_5px_0_rgba(0,0,0,.55)]">
<img src="/icon.svg" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl"/>
<div className="min-w-0 flex-1"><p className="font-display text-sm leading-tight text-gold">Install HYPE app</p>
<p className="text-[.7rem] leading-tight text-snow/80">{can?'Play full screen, right from your home screen.':isIos()?'Tap Share, then "Add to Home Screen".':'Open the browser menu (⋮), then tap "Install app" or "Add to Home screen".'}</p></div>
{can&&<button onClick={install} className="cab-btn !min-h-9 shrink-0 bg-gold !px-3 text-sm">Install</button>}
<button onClick={close} aria-label="Dismiss" className="shrink-0 px-1.5 font-pixel text-xs text-snow/70">✕</button></motion.div>}</AnimatePresence>}
