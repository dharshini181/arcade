import {useSyncExternalStore} from 'react';
/** One finished play. `p` is the player name typed at the start of that game. */
export type Session={g:string;p:string;score:number;win:boolean;secs:number;at:number;cfg:string};
export type Row={p:string;score:number;at:number;plays:number};
type State={sound:boolean;music:boolean;sessions:Session[]};
const K='tapnook:v2';
const load=():State=>{try{const p=JSON.parse(localStorage.getItem(K)||'{}');
  const legacy=typeof p.name==='string'?p.name:''; // older versions saved one name for the whole device
  const sessions:Session[]=Array.isArray(p.sessions)?p.sessions.filter((s:Session)=>s&&typeof s.score==='number'&&typeof s.g==='string').map((s:Session)=>({...s,p:typeof s.p==='string'&&s.p?s.p:(legacy||'PLAYER')})):[];
  return{sound:p.sound!==false,music:p.music===true,sessions}}catch{return{sound:true,music:false,sessions:[]}}};
let state=load();const subs=new Set<()=>void>();
const set=(p:Partial<State>)=>{state={...state,...p};try{localStorage.setItem(K,JSON.stringify(state))}catch{/* storage unavailable */}subs.forEach(f=>f())};
export const useStore=()=>useSyncExternalStore(f=>{subs.add(f);return()=>{subs.delete(f)}},()=>state);
export const getState=()=>state;
export const actions={toggleSound:()=>set({sound:!state.sound}),toggleMusic:()=>set({music:!state.music}),
  addSession:(s:Session)=>set({sessions:[...state.sessions,s].slice(-1000)}),reset:()=>set({sessions:[]})};

const key=(p:string)=>p.trim().toLowerCase();
/** Ranked board for one game: each player appears once with their best score. Ties go to whoever got there first. */
export function boardOf(sessions:Session[],g:string):Row[]{
  const m=new Map<string,Row>();
  for(const s of sessions){if(s.g!==g)continue;const k=key(s.p),r=m.get(k);
    if(!r)m.set(k,{p:s.p,score:s.score,at:s.at,plays:1});
    else{r.plays++;if(s.score>r.score){r.score=s.score;r.at=s.at;r.p=s.p}}}
  return[...m.values()].sort((a,b)=>b.score-a.score||a.at-b.at)}
export const sameP=(a:string,b:string)=>key(a)===key(b);
export const bestOf=(g:string,sessions:Session[]=state.sessions)=>sessions.reduce((m,s)=>s.g===g?Math.max(m,s.score):m,0);
