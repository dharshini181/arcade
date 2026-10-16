import {motion} from 'framer-motion';import {useState} from 'react';import {Btn,Screen} from './ui';import type {GameDef} from '../types';import {IBack} from './Icons';import {Board} from './Board';import {sfx} from '../lib/sound';

/** Shown every time someone walks up to a game, like a real arcade. The field always starts empty; only finished scores are kept for the leaderboard. */
export function NameGate({def,onCancel,onReady}:{def:GameDef;onCancel:()=>void;onReady:(name:string)=>void}){
const [v,setV]=useState(''),[err,setErr]=useState('');
const go=()=>{const n=v.trim().toUpperCase();if(!n){setErr('Type a name to continue');sfx('bad');return}sfx('coin');onReady(n.slice(0,12))};
return <Screen className="grid min-h-dvh place-items-center">
<motion.div className="bezel crt w-full max-w-sm p-5" initial={{scale:.85,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:240,damping:20}}>
<div className="relative z-10">
<div className="mb-3 flex items-center gap-3"><button onClick={onCancel} aria-label="Back to games" className="arc-btn sm" style={{'--c':'#FF69B4'} as React.CSSProperties}><IBack className="h-6 w-6"/></button>
<p className="font-pixel text-[.6rem] leading-5 text-gold blink">INSERT COIN · NEW PLAYER</p></div>
<div className="mb-4 flex items-center gap-3 rounded-2xl border-2 p-3" style={{borderColor:def.color}}><def.Icon className="h-16 w-16 shrink-0"/><div className="min-w-0"><p className="truncate font-display text-xl" style={{color:def.color}}>{def.title}</p><p className="text-sm text-snow/80">{def.tag}</p></div></div>
<h1 className="glow mb-3 font-display text-3xl text-snow">Who's playing?</h1>
<label htmlFor="player-name" className="font-pixel text-[.65rem] leading-5 text-hot">ENTER YOUR NAME</label>
<input id="player-name" autoFocus value={v} maxLength={12} placeholder="NOVA" autoComplete="nickname" autoCapitalize="characters" spellCheck={false} enterKeyHint="go"
onChange={e=>{setV(e.target.value);setErr('')}} onKeyDown={e=>e.key==='Enter'&&go()}
className="lcd mt-2 h-16 w-full text-center text-xl uppercase placeholder:text-gold/30"/>
<p role="alert" className="min-h-6 pt-1 text-sm font-bold text-fire">{err}</p>
<Btn className="mt-1 w-full bg-gold py-3 text-2xl" onClick={go}>Start game</Btn>
<div className="mt-4"><Board g={def.id} color={def.color} me={v.trim()} limit={3} title="SCORES TO BEAT"/></div>
<p className="mt-3 text-xs text-snow/70">No account needed. Scores stay on this device.</p></div></motion.div></Screen>}
