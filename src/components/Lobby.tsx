import {motion} from 'framer-motion';import {useState} from 'react';
import {actions,bestOf,boardOf,useStore} from '../lib/store';import {GAMES} from '../games';import {Btn,Marquee} from './ui';import {Dialog} from './Dialog';import {sfx} from '../lib/sound';
import {IFull,IInfo,IMedal,IMore,IMusic,IPad,ILock,ISound,IMute,IStar,ITrash,ITrophy} from './Icons';
type Tab='games'|'scores'|'more';
const TABS:[Tab,string,typeof IPad,string][]=[['games','GAMES',IPad,'#FF1493'],['scores','SCORES',ITrophy,'#FFD700'],['more','MORE',IMore,'#FF4500']];
const go=(id:string)=>{sfx('start');location.hash=`#/play/${id}`};
const fs=()=>{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.().catch(()=>{})};
const Head=({children}:{children:React.ReactNode})=><h2 className="glow mb-3 px-1 font-pixel text-xs leading-6 text-gold">{children}</h2>;
const col=(c:string)=>({'--c':c} as React.CSSProperties);

function GamesTab(){const {sessions}=useStore();return <section aria-label="All games"><Head>SELECT YOUR GAME</Head>
<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">{GAMES.map((g,i)=>{const best=bestOf(g.id,sessions);
return <motion.button key={g.id} onClick={()=>go(g.id)} aria-label={`Play ${g.title}`} initial={{opacity:0,y:40,scale:.8}} animate={{opacity:1,y:0,scale:1}} transition={{delay:i*.05,type:'spring',stiffness:260,damping:18}} whileHover={{y:-5}} whileTap={{scale:.94,y:4}}
className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border-4 bg-panel p-2 text-left" style={{borderColor:g.color,boxShadow:`0 0 22px ${g.color}66,0 7px 0 rgba(0,0,0,.55)`}}>
<span className="absolute right-2 top-2 z-10 rounded-full px-2 py-1 font-pixel text-[.5rem] text-ink" style={{background:g.color}}>{best?`HI ${best}`:'NEW'}</span>
<div className="crt relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-night" style={{boxShadow:`inset 0 0 30px ${g.color}55`}}>
<span className="absolute inset-0" style={{background:`radial-gradient(circle at 50% 55%,${g.color}40,transparent 65%)`}}/>
<motion.div animate={{y:[0,-6,0],rotate:[0,i%2?4:-4,0]}} transition={{repeat:Infinity,duration:3+(i%3)*.5,ease:'easeInOut'}} className="relative"><g.Icon className="h-20 w-20 sm:h-24 sm:w-24 drop-shadow-[0_0_10px_currentColor]"/></motion.div></div>
<div className="px-1 pb-1 pt-2"><p className="font-display text-lg leading-tight" style={{color:g.color}}>{g.title}</p><p className="truncate text-xs text-snow/75">{g.tag}</p>
<p className="blink mt-2 rounded-lg py-1.5 text-center font-pixel text-[.55rem] text-ink" style={{background:g.color}}>PRESS START</p></div></motion.button>})}</div></section>}

/** The lobby only shows who is on top. Full ranked boards live inside each game. */
function ScoresTab(){const {sessions}=useStore();
const players=new Set(sessions.map(s=>s.p.trim().toLowerCase())).size,wins=sessions.filter(s=>s.win).length,tot=sessions.reduce((a,s)=>a+s.score,0);
const ach:[string,boolean][]=[['First game',sessions.length>0],['First win',wins>0],['1,000 points',tot>=1000],['Played every game',GAMES.every(g=>sessions.some(s=>s.g===g.id))]];
const recent=[...sessions].reverse().slice(0,6);
return <section aria-label="Scores" className="space-y-5">
<div><Head>ARCADE STATS</Head><div className="grid grid-cols-3 gap-2 text-center">{([['Plays',sessions.length,'text-hot'],['Players',players,'text-gold'],['Wins',wins,'text-fire']] as const).map(([k,v,c])=><div key={k} className="lcd !p-3"><p className={`text-[.55rem] ${c}`}>{k.toUpperCase()}</p><p className="mt-2 text-lg">{v}</p></div>)}</div></div>
<div><Head>CURRENT CHAMPIONS</Head><ol className="space-y-2">{GAMES.map(g=>{const c=boardOf(sessions,g.id)[0];return <li key={g.id} className="flex items-center gap-3 rounded-2xl border-2 bg-panel p-2" style={{borderColor:`${g.color}99`}}>
<g.Icon className="h-11 w-11 shrink-0"/><div className="min-w-0 flex-1"><p className="truncate font-display" style={{color:g.color}}>{g.title}</p><p className="truncate font-pixel text-[.55rem] leading-5 text-snow/80">{c?c.p:'NO CHAMPION YET'}</p></div>
<span className="lcd !px-2 !py-2 text-xs">{c?c.score:'---'}</span></li>})}</ol>
<p className="mt-2 px-1 text-xs text-snow/70">Open a game to see its full leaderboard.</p></div>
<div><Head>BADGES</Head><div className="grid grid-cols-2 gap-2">{ach.map(([k,ok])=><div key={k} className={`flex items-center gap-2 rounded-2xl border-2 p-3 ${ok?'border-gold bg-gold/15 text-gold':'border-hot/30 text-snow/50'}`}>{ok?<IMedal className="h-6 w-6 shrink-0"/>:<ILock className="h-6 w-6 shrink-0"/>}<span className="text-sm font-bold">{k}</span></div>)}</div></div>
<div><Head>RECENT PLAYS</Head>{recent.length?<ul className="space-y-1.5">{recent.map((s,i)=>{const g=GAMES.find(x=>x.id===s.g);return <li key={`${s.at}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-panel px-3 py-2 text-sm"><span className="min-w-0 truncate"><b className="text-snow">{s.p}</b> <span style={{color:g?.color}}>{g?.title}</span></span><span className="flex items-center gap-1 font-bold text-gold"><IStar className="h-4 w-4"/>{s.score}</span></li>})}</ul>
:<p className="rounded-2xl border-2 border-dashed border-hot/40 p-4 text-center text-snow/70">No plays yet. Pick a game on the Games tab.</p>}</div></section>}

function MoreTab(){const [rs,setRs]=useState(false),[open,setOpen]=useState<string|null>(null);
return <section aria-label="More" className="space-y-5">
<div><Head>HOW TO PLAY</Head><div className="space-y-2">{GAMES.map(g=><div key={g.id} className="overflow-hidden rounded-2xl border-2 bg-panel" style={{borderColor:`${g.color}88`}}>
<button className="flex w-full items-center gap-3 p-2 text-left" aria-expanded={open===g.id} onClick={()=>setOpen(open===g.id?null:g.id)}><g.Icon className="h-10 w-10 shrink-0"/><span className="flex-1 font-display" style={{color:g.color}}>{g.title}</span><span className="pr-2 font-pixel text-xs text-snow/70">{open===g.id?'–':'+'}</span></button>
{open===g.id&&<motion.p initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} className="overflow-hidden px-4 text-snow/90"><span className="block pb-3">{g.how}</span></motion.p>}</div>)}</div></div>
<div><Head>ABOUT</Head><div className="flex gap-3 rounded-2xl border-2 border-hot/40 bg-panel p-4 text-sm text-snow/80"><IInfo className="h-6 w-6 shrink-0 text-hot"/><p>HYPE by Hindustan XR Division is a touch arcade with 10 games. Every player types a name when they start a game, and each game keeps its own leaderboard. There are no accounts. Scores are saved only in this browser.</p></div>
<Btn className="mt-3 w-full bg-fire" onClick={()=>setRs(true)}><span className="flex items-center justify-center gap-2"><ITrash className="h-5 w-5"/>Reset all scores</span></Btn></div>
<Dialog open={rs} title="Reset everything?" text="This deletes every player's scores on this device." yes="Delete" no="Cancel" onNo={()=>setRs(false)} onYes={()=>{actions.reset();setRs(false)}}/></section>}

/** Small round icon button for the top-right corner (settings). */
const Mini=({label,color,on,onClick,children}:{label:string;color:string;on?:boolean;onClick:()=>void;children:React.ReactNode}) =>
<button className="mini" style={col(color)} onClick={onClick} title={label} aria-label={label} {...(on!==undefined?{'aria-pressed':on,'data-off':!on}:{})}>{children}</button>;

function Corner({tab,setTab}:{tab:Tab;setTab:(t:Tab)=>void}){const {sound,music}=useStore();
const pick=(t:Tab)=>{if(t!==tab)sfx('tap');setTab(t)};
return <div className="ml-auto flex items-center gap-1.5">
{TABS.map(([id,label,Ic,c])=><button key={id} className="mini" style={col(c)} title={label} aria-label={label} aria-current={tab===id?'page':undefined} data-off={tab!==id} onClick={()=>pick(id)}><Ic className="h-3.5 w-3.5"/></button>)}
<span className="mx-0.5 h-4 w-px bg-hot/60" aria-hidden/>
<Mini label="Sound effects" color="#FFD700" on={sound} onClick={()=>{if(!sound)setTimeout(()=>sfx('coin'),30);actions.toggleSound()}}>{sound?<ISound className="h-3.5 w-3.5"/>:<IMute className="h-3.5 w-3.5"/>}</Mini>
<Mini label="Music" color="#FF69B4" on={music} onClick={actions.toggleMusic}><IMusic className="h-3.5 w-3.5"/></Mini>
<Mini label="Full screen" color="#FF00FF" onClick={fs}><IFull className="h-3.5 w-3.5"/></Mini></div>}

export function Lobby(){const {sessions}=useStore();const [tab,setTab]=useState<Tab>('games');
const champ=sessions.reduce<typeof sessions[number]|null>((m,s)=>!m||s.score>m.score?s:m,null);
return <motion.main initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}} className="relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-3 lobby-pb pt-[max(.75rem,env(safe-area-inset-top))]">
<Marquee compact={tab!=='games'}/>
<div className="bezel crt mt-4 flex-1 p-3 sm:p-5" style={{background:"rgba(31,5,38,.5)"}}><div className="relative z-10">
<div className="mb-4 flex flex-wrap items-center gap-2"><div className="lcd flex min-w-[6rem] flex-1 items-center gap-2 text-[.6rem]"><span className="text-hot">HI</span><span className="truncate">{champ?`${champ.p} ${champ.score}`:'---'}</span></div><div className="lcd flex items-center gap-2 text-[.6rem]"><IStar className="h-4 w-4 text-gold"/><span>{sessions.length}</span></div>
<Corner tab={tab} setTab={setTab}/></div>
<motion.div key={tab} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:.18}}>{tab==='games'?<GamesTab/>:tab==='scores'?<ScoresTab/>:<MoreTab/>}</motion.div></div></div>
</motion.main>}