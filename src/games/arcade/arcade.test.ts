import {describe,expect,it} from 'vitest';
(globalThis as any).window=globalThis; // the games read window.Arcade
const {GAMES}=await import('../index');const {A}=await import('./arcade');
const ctx=new Proxy({} as any,{get:(t,k)=>k in t?t[k]:(k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):k==='measureText'?()=>({width:10}):()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
describe('arcade games',()=>{
 it('registers all ten with the lobby',()=>{expect(GAMES.map(g=>g.id)).toEqual(['fruit','maze','sling','basket','galax','keeper','batak','homerun','air','racer']);GAMES.forEach(g=>{expect(g.how.length).toBeGreaterThan(20);expect(g.how).not.toMatch(/</)})});
 for(const G of A.games)it(`${G.id} resets, updates and draws without errors`,()=>{
  let ended=false;const api:any={W:G.W,H:G.H,score:0,lives:null,maxLives:3,info:'',keys:new Set(),fx:new A.Fx(),sfx(){},add(n:number){this.score=Math.max(0,this.score+n)},end(){ended=true},banner(){},isPlaying:()=>!ended};
  G.reset(api);
  for(let i=0;i<900&&!ended;i++){G.update(1/60,api);api.fx.update(1/60);G.draw(ctx,api);api.fx.draw(ctx)}
  expect(Number.isFinite(api.score)).toBe(true);expect(G.W).toBeGreaterThan(100);expect(G.H).toBeGreaterThan(100)});
});
