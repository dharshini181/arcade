import type {ReactNode} from 'react';
/* All artwork is vector (SVG) and drawn only in the brand palette. */
export const P={hot:'#FF69B4',deep:'#FF1493',mag:'#FF00FF',fire:'#FF4500',gold:'#FFD700',ink:'#12000F',snow:'#FFF4FA'};
type C={className?:string};
const S=({children,className,w=4}:{children:ReactNode;className?:string;w?:number})=><svg viewBox="0 0 64 64" className={className} fill="none" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;

/* ---------- game icons (neon line art) ---------- */

/* ---------- interface icons (use currentColor) ---------- */
const U=({d,className,fill=false,w=3.5}:{d:ReactNode;className?:string;fill?:boolean;w?:number})=><svg viewBox="0 0 24 24" className={className} fill={fill?'currentColor':'none'} stroke={fill?'none':'currentColor'} strokeWidth={w/1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
export const IStar=(p:C)=><U {...p} fill d={<path d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.6 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z"/>}/>;
export const IFlame=(p:C)=><U {...p} fill d={<path d="M12 2c1 3.5 5 5.5 5 11a5 5 0 0 1-10 0c0-2 1-3.4 2-4.4.2 1.4.9 2.2 1.8 2.6C10.2 8.6 10.5 5 12 2z"/>}/>;
export const IBulb=(p:C)=><U {...p} d={<><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></>}/>;
export const IEye=(p:C)=><U {...p} d={<><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></>}/>;
export const ITrophy=(p:C)=><U {...p} d={<><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H3.5c0 3 1.5 4.5 3.7 4.8M17 6h3.5c0 3-1.5 4.5-3.7 4.8M12 14v4M8 21h8M9.5 18h5"/></>}/>;
export const ILock=(p:C)=><U {...p} d={<><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>}/>;
export const ISound=(p:C)=><U {...p} d={<><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/></>}/>;
export const IMute=(p:C)=><U {...p} d={<><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></>}/>;
export const IPause=(p:C)=><U {...p} fill d={<><rect x="5.5" y="4" width="4.5" height="16" rx="1.5"/><rect x="14" y="4" width="4.5" height="16" rx="1.5"/></>}/>;
export const IPlay=(p:C)=><U {...p} fill d={<path d="M7 3.5v17l14-8.5z"/>}/>;
export const IRestart=(p:C)=><U {...p} d={<><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 3.5V8h-4.5"/></>}/>;
export const IBack=(p:C)=><U {...p} d={<path d="M15 4l-8 8 8 8"/>}/>;
export const IFull=(p:C)=><U {...p} d={<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>}/>;
export const IPencil=(p:C)=><U {...p} d={<><path d="M4 20l1-4.5L16.5 4a2 2 0 0 1 3 0l.5.5a2 2 0 0 1 0 3L8.5 19z"/><path d="M14 6.5l3.5 3.5"/></>}/>;
export const IHeart=(p:C)=><U {...p} fill d={<path d="M12 21s-8.5-5.2-8.5-11.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8.5 2.8C20.5 15.8 12 21 12 21z"/>}/>;
export const IClock=(p:C)=><U {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/></>}/>;
export const ICheck=(p:C)=><U {...p} d={<path d="M4 12.5l5 5L20 6.5"/>}/>;
export const ICross=(p:C)=><U {...p} d={<path d="M5 5l14 14M19 5L5 19"/>}/>;
export const ITarget=(p:C)=><U {...p} d={<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></>}/>;
export const IMedal=(p:C)=><U {...p} d={<><circle cx="12" cy="15" r="6"/><path d="M8.5 3l3.5 6 3.5-6M12 12.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" /></>}/>;
export const ITrash=(p:C)=><U {...p} d={<><path d="M4 7h16M10 3.5h4M6 7l1 13h10l1-13M10 11v6M14 11v6"/></>}/>;
export const IInfo=(p:C)=><U {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.2"/></>}/>;
export const IPad=(p:C)=><U {...p} d={<><path d="M6.5 8h11a4.5 4.5 0 0 1 4.4 5.400l-.9 4a2.6 2.6 0 0 1-4.4 1.200L15 17h-6l-1.6 1.600A2.6 2.6 0 0 1 3 17.400l-.9-4A4.5 4.5 0 0 1 6.5 8z"/><path d="M7.5 11v3M6 12.500h3"/><circle cx="15.5" cy="11.5" r=".6" fill="currentColor"/><circle cx="17.5" cy="13.5" r=".6" fill="currentColor"/></>}/>;
export const IList=(p:C)=><U {...p} d={<><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></>}/>;
export const IMore=(p:C)=><U {...p} fill d={<><circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/></>}/>;
export const IArrowUp=(p:C)=><U {...p} d={<path d="M12 19V5M5 12l7-7 7 7"/>}/>;
export const IArrowDown=(p:C)=><U {...p} d={<path d="M12 5v14M5 12l7 7 7-7"/>}/>;
export const IBackspace=(p:C)=><U {...p} d={<><path d="M9 5h11v14H9l-6-7z"/><path d="M12.5 9.500l5 5M17.5 9.500l-5 5"/></>}/>;
export const ISpin=(p:C)=><U {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 12V3.500M12 12l7.5 4.500M12 12l-7.5 4.5"/></>}/>;

/* ---------- card symbols for Matching Pairs ---------- */
const cols=[P.deep,P.gold,P.hot,P.fire,P.mag];
export const GLYPHS:Record<string,(c:string)=>ReactNode>={
rocket:c=><><path d="M32 6c9 7 12 18 9 32H23C20 24 23 13 32 6z" fill={c} fillOpacity=".25" stroke={c}/><circle cx="32" cy="24" r="4.5" stroke={c}/><path d="M23 34l-8 10 9-1M41 34l8 10-9-1M28 46l4 10 4-10" stroke={c}/></>,
moon:c=><path d="M40 8a24 24 0 1 0 16 36A20 20 0 0 1 40 8z" fill={c} fillOpacity=".25" stroke={c}/>,
bolt:c=><path d="M36 6L14 36h14l-4 22 26-34H35z" fill={c} fillOpacity=".25" stroke={c}/>,
star:c=><path d="M32 6l7.5 16.5 18 2-13.5 12 4 17.500L32 44.5 16 54l4-17.5-13.5-12 18-2z" fill={c} fillOpacity=".25" stroke={c}/>,
heart:c=><path d="M32 54S8 40 8 24a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 16-24 30-24 30z" fill={c} fillOpacity=".25" stroke={c}/>,
bell:c=><><path d="M14 44c4-4 4-8 4-16a14 14 0 0 1 28 0c0 8 0 12 4 16z" fill={c} fillOpacity=".25" stroke={c}/><path d="M27 51a5 5 0 0 0 10 0" stroke={c}/></>,
diamond:c=><><path d="M16 12h32l10 14-26 28L6 26z" fill={c} fillOpacity=".25" stroke={c}/><path d="M6 26h52M24 12l-6 14 14 28 14-28-6-14" stroke={c} strokeWidth="2.5"/></>,
crown:c=><><path d="M8 46l-2-26 14 12 12-20 12 20 14-12-2 26z" fill={c} fillOpacity=".25" stroke={c}/><path d="M8 54h48" stroke={c}/></>,
ghost:c=><><path d="M12 54V28a20 20 0 0 1 40 0v26l-7-6-6.5 6-6.5-6-6.5 6-6.5-6z" fill={c} fillOpacity=".25" stroke={c}/><circle cx="25" cy="29" r="3" fill={c} stroke="none"/><circle cx="39" cy="29" r="3" fill={c} stroke="none"/></>,
note:c=><><path d="M24 48V12l26-6v36" stroke={c}/><ellipse cx="17" cy="48" rx="8" ry="6" fill={c} fillOpacity=".25" stroke={c}/><ellipse cx="43" cy="42" rx="8" ry="6" fill={c} fillOpacity=".25" stroke={c}/></>
};
export const GLYPH_IDS=Object.keys(GLYPHS);
export function Glyph({id,className}:{id:string;className?:string}){const i=GLYPH_IDS.indexOf(id);return <S className={className} w={4.5}>{GLYPHS[id]?.(cols[i%cols.length])}</S>}
export const ShapeIcon=({name,className}:{name:string;className?:string})=>name==='Star'?<IStar className={className}/>:name==='Heart'?<IHeart className={className}/>:<IFlower className={className}/>;
export const IFlower=(p:C)=><U {...p} fill d={<><circle cx="12" cy="5.5" r="3.5"/><circle cx="18.5" cy="10" r="3.5"/><circle cx="16" cy="17.5" r="3.5"/><circle cx="8" cy="17.5" r="3.5"/><circle cx="5.5" cy="10" r="3.5"/><circle cx="12" cy="12" r="3" fill="#12000F"/></>}/>;
export const IMusic=(p:C)=><U {...p} d={<><path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.8" fill="currentColor"/><circle cx="17.5" cy="16" r="2.8" fill="currentColor"/></>}/>;

/* ---------- Arcade Hub game icons ---------- */
export const FruitIcon=(p:C)=><S {...p}><circle cx="30" cy="38" r="19" fill={P.fire} fillOpacity=".25" stroke={P.fire}/><path d="M30 19c0-6 4-9 9-10" stroke={P.gold}/><path d="M6 12L58 56" stroke={P.snow} strokeWidth="3"/><path d="M42 8l6 6M50 14l5 3" stroke={P.hot}/></S>;
export const MazeIcon=(p:C)=><S {...p}><path d="M44 18A19 19 0 1 0 44 46L30 32z" fill={P.gold} fillOpacity=".25" stroke={P.gold}/><circle cx="29" cy="22" r="2.500" fill={P.gold}/><circle cx="54" cy="32" r="2.500" fill={P.hot}/><path d="M6 6h14M58 58H44" stroke={P.mag} opacity=".7"/></S>;
export const SlingIcon=(p:C)=><S {...p}><path d="M32 58V38M32 38L16 14M32 38l16-24" stroke={P.deep}/><path d="M16 14l16 12 16-12" stroke={P.gold} strokeDasharray="2 5"/><circle cx="32" cy="30" r="7" fill={P.fire} fillOpacity=".4" stroke={P.fire}/><path d="M44 54l14-8" stroke={P.hot} strokeDasharray="1 6"/></S>;
export const BasketIcon=(p:C)=><S {...p}><path d="M8 34h48l-6 22H14z" fill={P.hot} fillOpacity=".25" stroke={P.hot}/><path d="M8 34c4-6 44-6 48 0" stroke={P.gold}/><circle cx="22" cy="12" r="5" fill={P.gold} fillOpacity=".4" stroke={P.gold}/><circle cx="40" cy="20" r="5" fill={P.fire} fillOpacity=".4" stroke={P.fire}/></S>;
export const GalaxIcon=(p:C)=><S {...p}><path d="M32 8l14 34-14-8-14 8z" fill={P.mag} fillOpacity=".25" stroke={P.mag}/><path d="M26 46l6 10 6-10" stroke={P.fire}/><path d="M12 14v6M52 24v6M50 8v3" stroke={P.gold}/><circle cx="14" cy="38" r="2" fill={P.hot}/></S>;
export const KeeperIcon=(p:C)=><S {...p}><path d="M6 54V16h52v38" stroke={P.gold}/><path d="M6 16l8 8M58 16l-8 8M18 16v38M32 16v38M46 16v38" stroke={P.snow} opacity=".25"/><circle cx="38" cy="36" r="9" fill={P.deep} fillOpacity=".3" stroke={P.deep}/><path d="M33 36h10M38 31v10" stroke={P.snow} opacity=".6"/></S>;
export const BatakIcon=(p:C)=><S {...p}><circle cx="32" cy="32" r="24" stroke={P.deep}/><circle cx="32" cy="32" r="15" stroke={P.gold}/><circle cx="32" cy="32" r="6" fill={P.fire} fillOpacity=".5" stroke={P.fire}/><path d="M32 2v10M32 52v10M2 32h10M52 32h10" stroke={P.hot}/></S>;
export const HomerunIcon=(p:C)=><S {...p}><path d="M10 54l30-30" stroke={P.fire} strokeWidth="9"/><path d="M10 54l30-30" stroke={P.gold} strokeWidth="3"/><circle cx="48" cy="16" r="8" fill={P.snow} fillOpacity=".2" stroke={P.snow}/><path d="M44 12c3 1 4 4 5 7" stroke={P.hot} strokeWidth="2.500"/><path d="M54 30l6 3M52 38l5 5" stroke={P.gold}/></S>;
export const AirIcon=(p:C)=><S {...p}><ellipse cx="42" cy="18" rx="9" ry="13" stroke={P.gold} transform="rotate(20 42 18)"/><path d="M6 40l40-14-12 30-8-12z" fill={P.hot} fillOpacity=".25" stroke={P.hot}/><path d="M26 44l20-18" stroke={P.snow} opacity=".6"/></S>;
export const RacerIcon=(p:C)=><S {...p}><rect x="20" y="8" width="24" height="48" rx="10" fill={P.mag} fillOpacity=".25" stroke={P.mag}/><rect x="25" y="18" width="14" height="12" rx="3" stroke={P.gold}/><path d="M14 16h6M14 46h6M44 16h6M44 46h6" stroke={P.snow} strokeWidth="6"/><path d="M6 8v8M58 28v8M6 44v8" stroke={P.hot} opacity=".6"/></S>;
