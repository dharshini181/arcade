import {useEffect,useRef,useState} from 'react';
export const fmt=(s:number)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
/** Wall-clock based, so it stays accurate across tab switches. */
export function useClock(){const acc=useRef(0),t0=useRef<number|null>(null),[,tick]=useState(0);
const ms=()=>acc.current+(t0.current?Date.now()-t0.current:0);
useEffect(()=>{const id=setInterval(()=>tick(n=>n+1),250);return()=>clearInterval(id)},[]);
return{secs:()=>Math.floor(ms()/1000),start(){acc.current=0;t0.current=Date.now()},pause(){if(t0.current){acc.current+=Date.now()-t0.current;t0.current=null}},resume(){t0.current??=Date.now()},stop(){const s=Math.floor(ms()/1000);if(t0.current){acc.current+=Date.now()-t0.current;t0.current=null}return s}}}
