import {useMemo} from 'react';import {P} from './Icons';
/* Playful backdrop art: ringed planet, UFO, rocket, spinning coins, hopping critters. All SVG, brand colours only. */
const o={stroke:P.ink,strokeWidth:3,strokeLinejoin:'round' as const,strokeLinecap:'round' as const};
const Eye=({x,y,r=8}:{x:number;y:number;r?:number})=><><circle cx={x} cy={y} r={r} fill={P.snow} {...o}/><circle cx={x+r*.25} cy={y+r*.1} r={r*.5} fill={P.ink}/><circle cx={x+r*.4} cy={y-r*.2} r={r*.18} fill={P.snow}/></>;

const Planet=()=><svg viewBox="0 0 140 100" width="100%" aria-hidden><g transform="rotate(-18 70 50)">
<ellipse cx="70" cy="50" rx="64" ry="15" fill="none" stroke={P.gold} strokeWidth="5" opacity=".9"/>
<circle cx="70" cy="50" r="30" fill={P.mag} {...o}/><path d="M42 40q28 8 56 0M41 56q29 9 58 0" fill="none" stroke={P.hot} strokeWidth="5" opacity=".8"/>
<circle cx="86" cy="38" r="4" fill={P.deep}/><circle cx="56" cy="62" r="3" fill={P.deep}/>
<path d="M6 50A64 15 0 0 0 134 50" fill="none" stroke={P.gold} strokeWidth="5"/></g></svg>;

const Moon=()=><svg viewBox="0 0 60 60" width="100%" aria-hidden><circle cx="30" cy="30" r="24" fill={P.hot} {...o}/><circle cx="22" cy="24" r="5" fill={P.deep}/><circle cx="38" cy="38" r="4" fill={P.deep}/><circle cx="36" cy="20" r="2.5" fill={P.deep}/></svg>;

const Ufo=()=><svg viewBox="0 0 120 90" width="100%" aria-hidden><path className="beam" d="M44 56L22 88h76L76 56z" fill={P.gold}/>
<path d="M38 38a22 22 0 0 1 44 0z" fill={P.hot} fillOpacity=".85" {...o}/><Eye x={60} y={28} r={7}/>
<ellipse cx="60" cy="46" rx="52" ry="14" fill={P.deep} {...o}/><circle cx="26" cy="47" r="3.5" fill={P.gold}/><circle cx="43" cy="52" r="3.5" fill={P.gold}/><circle cx="60" cy="54" r="3.5" fill={P.gold}/><circle cx="77" cy="52" r="3.5" fill={P.gold}/><circle cx="94" cy="47" r="3.5" fill={P.gold}/></svg>;

const Rocket=()=><svg viewBox="0 0 50 100" width="100%" aria-hidden><path d="M25 4c11 10 14 26 12 46H13C11 30 14 14 25 4z" fill={P.snow} {...o}/><path d="M25 4c11 10 14 26 12 46H25z" fill={P.hot} opacity=".55"/>
<circle cx="25" cy="30" r="7" fill={P.gold} {...o}/><path d="M13 36L2 56l11-4zM37 36l11 20-11-4z" fill={P.fire} {...o}/><path d="M13 50h24l-3 8H16z" fill={P.deep} {...o}/>
<path className="flame" d="M19 60h12l-6 28z" fill={P.gold} stroke={P.fire} strokeWidth="3" strokeLinejoin="round"/></svg>;

const Coin=()=><svg viewBox="0 0 40 40" width="100%" aria-hidden><circle cx="20" cy="20" r="16" fill={P.gold} {...o}/><circle cx="20" cy="20" r="10" fill="none" stroke={P.fire} strokeWidth="2.5"/><path d="M20 13l2.2 4.6 5 .6-3.700 3.400 1 5L20 24.300 15.500 26.600l1-5-3.700-3.400 5-.6z" fill={P.fire}/></svg>;

const Blob=()=><svg viewBox="0 0 60 70" width="100%" aria-hidden><path d="M30 24V9" stroke={P.ink} strokeWidth="3"/><circle cx="30" cy="8" r="5" fill={P.gold} {...o}/>
<ellipse cx="18" cy="64" rx="9" ry="5" fill={P.fire} {...o}/><ellipse cx="42" cy="64" rx="9" ry="5" fill={P.fire} {...o}/><ellipse cx="30" cy="42" rx="23" ry="22" fill={P.hot} {...o}/><Eye x={30} y={38} r={11}/><path d="M22 54q8 7 16 0" fill="none" stroke={P.ink} strokeWidth="3"/></svg>;
const Imp=()=><svg viewBox="0 0 60 70" width="100%" aria-hidden><path d="M14 26L10 8l14 10zM46 26l4-18-14 10z" fill={P.fire} {...o}/><ellipse cx="18" cy="64" rx="8" ry="5" fill={P.gold} {...o}/><ellipse cx="42" cy="64" rx="8" ry="5" fill={P.gold} {...o}/>
<rect x="8" y="20" width="44" height="42" rx="15" fill={P.mag} {...o}/><Eye x={22} y={36} r={8}/><Eye x={38} y={36} r={8}/><path d="M20 50h20l-3 6-3-6-3 6-3-6-3 6z" fill={P.snow} {...o} strokeWidth="2"/></svg>;
const Bean=()=><svg viewBox="0 0 60 70" width="100%" aria-hidden><ellipse cx="20" cy="65" rx="8" ry="4.500" fill={P.deep} {...o}/><ellipse cx="40" cy="65" rx="8" ry="4.500" fill={P.deep} {...o}/>
<rect x="14" y="8" width="32" height="56" rx="16" fill={P.gold} {...o}/><path d="M21 28q4-5 8 0M31 28q4-5 8 0" fill="none" stroke={P.ink} strokeWidth="3"/><circle cx="20" cy="38" r="3.500" fill={P.hot}/><circle cx="40" cy="38" r="3.500" fill={P.hot}/><path d="M25 42q5 6 10 0z" fill={P.deep} {...o} strokeWidth="2"/></svg>;

export function Scenery(){
const stars=useMemo(()=>Array.from({length:26},(_,i)=>({x:(i*47)%100,y:(i*29)%58,s:2+(i%3),d:(i%7)*.4,c:i%4===0?P.gold:i%4===1?P.hot:P.snow})),[]);
const coins=[[8,46,28,0],[90,22,24,.5],[78,52,30,1.1],[22,70,24,.8],[50,12,22,1.4],[93,60,26,.3]] as const;
return <div aria-hidden>
{stars.map((s,i)=><span key={i} className="twinkle absolute rounded-full" style={{left:`${s.x}%`,top:`${s.y}%`,width:s.s,height:s.s,background:s.c,boxShadow:`0 0 6px ${s.c}`,animationDelay:`${s.d}s`}}/>)}
<div className="scn" style={{left:'3%',top:'7%',width:'clamp(80px,17vw,150px)'}}><div className="wob"><Planet/></div></div>
<div className="scn" style={{right:'7%',top:'24%',width:'clamp(30px,6vw,56px)'}}><div className="wob" style={{animationDelay:'-2s'}}><Moon/></div></div>
<div className="scn cross" style={{left:0,top:'13%',width:'clamp(64px,12vw,110px)',animationDuration:'34s',animationDelay:'-9s'}}><div className="wob" style={{animationDuration:'3s'}}><Ufo/></div></div>
<div className="scn rocket" style={{left:0,top:0,width:'clamp(22px,4vw,38px)',animationDuration:'26s',animationDelay:'-6s'}}><Rocket/></div>
{coins.map(([x,y,w,d],i)=><div key={i} className="scn" style={{left:`${x}%`,top:`${y}%`,width:w}}><div className="wob" style={{animationDelay:`${-d*3}s`}}><div className="spin" style={{animationDelay:`${-d}s`}}><Coin/></div></div></div>)}
{/* a little parade of critters walking along the horizon */}
<div className="scn cross flex items-end gap-6" style={{left:0,bottom:'27%',animationDuration:'60s',animationDelay:'-20s'}}>
{[Blob,Imp,Bean].map((C,i)=><div key={i} className="hop" style={{width:'clamp(34px,7vw,56px)',animationDelay:`${-i*.3}s`}}><C/></div>)}</div>
</div>}
