import {useEffect,useRef,useState} from 'react';
import type {Api} from '../../types';import {IArrowDown,IArrowUp,IBack,IHeart} from '../../components/Icons';import {A} from './arcade';
const SC=2;
/** Hosts one canvas game inside the app shell. The shell owns start, countdown, pause, timer, score board; the game only draws and plays. */
export function CanvasGame({id,api}:{id:string;api:Api}){
const G=A.games.find((x:any)=>x.id===id);const cv=useRef<HTMLCanvasElement>(null),apiRef=useRef(api),pausedRef=useRef(api.paused),dir=useRef<(d:string)=>void>(()=>{});
apiRef.current=api;pausedRef.current=api.paused;
const [hud,setHud]=useState<{lives:number|null;info:string}>({lives:null,info:''});
useEffect(()=>{const c=cv.current!,g=c.getContext('2d')!,fx=new A.Fx(),keys=new Set<string>();
let state:'playing'|'over'='playing',banner:any=null,raf=0,last=performance.now(),started=false,endT=0,hudKey='',lastScore=-1,wasPaused=false;
const a:any={W:G.W,H:G.H,score:0,lives:null,maxLives:3,info:'',keys,fx,sfx:A.sfx,
 add(n:number){if(state!=='playing')return;this.score=Math.max(0,this.score+n)}, // nothing scores once the run has ended
 end(title:string,detail:string,win:boolean){if(state!=='playing')return;state='over';keys.clear();release();
  endT=window.setTimeout(()=>apiRef.current.finish({score:a.score,win,detail:detail?`${title} ${detail}`:title}),700)},
 banner(text:string,secs?:number,color?:string){banner={text,t:secs||1.4,color:color||A.C.gold}},isPlaying:()=>state==='playing'};
const release=()=>{if(G.pointer&&G.pointer.up)G.pointer.up(null,a)};
const live=()=>state==='playing'&&!pausedRef.current;
const touch=()=>{if(!started){started=true;apiRef.current.touch()}};
const pt=(e:PointerEvent)=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*G.W/r.width,y:(e.clientY-r.top)*G.H/r.height,id:e.pointerId}};
const P=()=>G.pointer||{};
const down=(e:PointerEvent)=>{if(!live())return;e.preventDefault();touch();try{c.setPointerCapture(e.pointerId)}catch{/* not supported */}P().down?.(pt(e),a)};
const move=(e:PointerEvent)=>{if(!live())return;e.preventDefault();P().move?.(pt(e),a)};
const up=(e:PointerEvent)=>{if(!live())return;P().up?.(pt(e),a)};
const kd=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if((e.target as HTMLElement)?.tagName==='INPUT')return;if(k.startsWith('arrow')||k===' ')e.preventDefault();if(live()){touch();keys.add(k);G.onKey?.(k,a)}};
const ku=(e:KeyboardEvent)=>{keys.delete(e.key.toLowerCase())};
const noCtx=(e:Event)=>e.preventDefault();
c.addEventListener('pointerdown',down);c.addEventListener('pointermove',move);c.addEventListener('pointerup',up);c.addEventListener('pointercancel',release);c.addEventListener('contextmenu',noCtx);
window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
dir.current=(d:string)=>{if(live()){touch();G.onDir?.(d,a)}};
G.reset(a);
const frame=(t:number)=>{raf=requestAnimationFrame(frame);const dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;
 const paused=pausedRef.current;if(paused&&!wasPaused){release();keys.clear()}wasPaused=paused;
 if(!paused){if(state==='playing'){G.update(dt,a);fx.update(dt);if(banner){banner.t-=dt;if(banner.t<=0)banner=null}}else fx.update(dt)}
 g.setTransform(SC,0,0,SC,0,0);G.draw(g,a);fx.draw(g);
 if(banner){g.globalAlpha=Math.min(1,banner.t*3);g.font='900 30px Impact,"Arial Black",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=7;g.lineJoin='round';g.strokeStyle=A.C.ink;g.strokeText(banner.text,G.W/2,G.H*.38);g.fillStyle=banner.color;g.fillText(banner.text,G.W/2,G.H*.38);g.globalAlpha=1}
 if(a.score!==lastScore){lastScore=a.score;apiRef.current.setScore(a.score)}
 const k=a.lives+'|'+a.info;if(k!==hudKey){hudKey=k;setHud({lives:a.lives,info:a.info})}};
raf=requestAnimationFrame(frame);
return()=>{cancelAnimationFrame(raf);clearTimeout(endT);release();G.destroy?.();
 c.removeEventListener('pointerdown',down);c.removeEventListener('pointermove',move);c.removeEventListener('pointerup',up);c.removeEventListener('pointercancel',release);c.removeEventListener('contextmenu',noCtx);
 window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku)}},[id]); // eslint-disable-line react-hooks/exhaustive-deps
const arrow=(d:string,cls:string,ic:React.ReactNode)=><button key={d} aria-label={d} className={`arc-btn sm no-pan ${cls}`} style={{'--c':'#FF69B4'} as React.CSSProperties} onPointerDown={e=>{e.preventDefault();dir.current(d)}}>{ic}</button>;
return <div className="mx-auto w-full">
{(hud.lives!==null||hud.info)&&<div className="mb-2 flex flex-wrap items-center justify-center gap-2 font-display">
 {hud.lives!==null&&<span className="chip text-deep" aria-label={`${hud.lives} lives`}>{hud.lives>0?Array.from({length:hud.lives},(_,k)=><IHeart key={k} className="h-4 w-4"/>):'—'}</span>}
 {hud.info&&<span className="chip text-hot">{hud.info}</span>}</div>}
<canvas ref={cv} width={G.W*SC} height={G.H*SC} role="img" aria-label={G.title} className="no-pan mx-auto block rounded-2xl bg-night" style={{aspectRatio:`${G.W} / ${G.H}`,width:'100%',maxWidth:`min(100%, calc((100dvh - 300px) * ${G.W/G.H}))`}}/>
{G.dpad&&<div className="mx-auto mt-3 grid w-fit grid-cols-3 place-items-center gap-1" aria-label="Direction pad"><span/>{arrow('up','',<IArrowUp className="h-6 w-6"/>)}<span/>{arrow('left','',<IBack className="h-6 w-6"/>)}<span/>{arrow('right','',<IBack className="h-6 w-6 rotate-180"/>)}<span/>{arrow('down','',<IArrowDown className="h-6 w-6"/>)}<span/></div>}
</div>}
