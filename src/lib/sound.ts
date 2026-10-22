import {getState} from './store';
let ctx:AudioContext|undefined,sfxBus:GainNode|undefined,musicBus:GainNode|undefined;
const ac=()=>{if(!ctx){ctx=new AudioContext();sfxBus=ctx.createGain();sfxBus.gain.value=.5;sfxBus.connect(ctx.destination);musicBus=ctx.createGain();musicBus.gain.value=.55;musicBus.connect(ctx.destination)}
  if(ctx.state==='suspended')void ctx.resume();return ctx};
/** One chiptune note with a short fade so it never clicks. */
function note(c:AudioContext,dest:AudioNode,f:number,t:number,d:number,type:OscillatorType,vol:number,to?:number){
  const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.setValueAtTime(vol,t+Math.max(.011,d-.04));g.gain.linearRampToValueAtTime(0,t+d);
  o.connect(g);g.connect(dest);o.start(t);o.stop(t+d+.02)}

type N=[f:number,at:number,d:number,to?:number];
const FX={
  tap:{w:'square',v:.07,n:[[520,0,.05]]},
  good:{w:'square',v:.08,n:[[660,0,.07],[880,.07,.12]]},
  bad:{w:'sawtooth',v:.08,n:[[240,0,.14,150],[150,.13,.26,90]]},
  win:{w:'square',v:.08,n:[[523,0,.1],[659,.1,.1],[784,.2,.1],[1047,.3,.14],[784,.46,.08],[1047,.54,.4]]},
  coin:{w:'square',v:.08,n:[[988,0,.07],[1319,.07,.32]]},
  start:{w:'square',v:.08,n:[[392,0,.08],[523,.08,.08],[659,.16,.08],[784,.24,.2]]},
  boom:{w:'sawtooth',v:.1,n:[[170,0,.28,40]]},
  hit:{w:'square',v:.09,n:[[300,0,.08,1000],[120,.02,.12,60]]},
  shoot:{w:'square',v:.035,n:[[880,0,.06,440]]},
  whoosh:{w:'sawtooth',v:.04,n:[[900,0,.18,200]]},
  tick:{w:'square',v:.06,n:[[700,0,.06]]},
  lose:{w:'sawtooth',v:.07,n:[[392,0,.15],[311,.15,.15],[247,.3,.4]]},
  cheer:{w:'square',v:.06,n:[[523,0,.08],[659,.08,.08],[784,.16,.08],[1047,.24,.08],[784,.32,.08],[1047,.4,.3]]},
  life:{w:'triangle',v:.1,n:[[330,0,.1,110],[200,.1,.2,70]]},
  go:{w:'square',v:.07,n:[[523,0,.08],[784,.08,.08],[1047,.16,.3]]}
} satisfies Record<string,{w:OscillatorType;v:number;n:N[]}>;
export type Sfx=keyof typeof FX;export const hasSfx=(k:string):k is Sfx=>k in FX;
export function sfx(k:keyof typeof FX,pitch=0){if(!getState().sound)return;
  try{const c=ac(),fx=FX[k],t=c.currentTime+.005;for(const [f,at,d,to] of fx.n as N[])note(c,sfxBus!,f+pitch,t+at,d,fx.w,fx.v,to?to+pitch:undefined);
    navigator.vibrate?.(({tap:8,bad:40,boom:45,hit:25,life:60,lose:90} as Record<string,number>)[k]??(k==='tick'||k==='shoot'||k==='whoosh'?0:20))}catch{/* audio blocked */}}

/* ---------- looping background tune (bass + arpeggio), scheduled a little ahead of time ---------- */
const mf=(n:number)=>440*2**((n-69)/12);
const PROG=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]; // Am F C G
const LEAD=[0,2,1,2,0,2,1,2,0,2,1,2,2,1,0,1];
let timer:number|undefined,nextT=0,step=0,armed=false;
function tick(){const c=ctx;if(!c||!musicBus)return;
  while(nextT<c.currentTime+.4){const ch=PROG[Math.floor(step/16)%4],s=step%16;
    if(s%4===0)note(c,musicBus,mf(ch[0]-12),nextT,.22,'triangle',.5);
    note(c,musicBus,mf(ch[LEAD[s]]+12),nextT,.11,'square',.07);
    if(s%8===4)note(c,musicBus,mf(ch[0]+24),nextT,.09,'square',.04);
    nextT+=.15;step++}}
export function setMusic(on:boolean){
  if(!on){if(timer!==undefined){clearInterval(timer);timer=undefined}return}
  if(timer!==undefined)return;
  try{const c=ac();nextT=c.currentTime+.05;step=0;timer=window.setInterval(tick,100);
    if(!armed){armed=true;window.addEventListener('pointerdown',()=>{void ctx?.resume()},{capture:true})} // browsers need one tap before sound can start
  }catch{/* audio blocked */}}
