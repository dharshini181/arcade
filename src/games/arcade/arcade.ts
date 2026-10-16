// @ts-nocheck
/* Shared helpers the ten canvas games expect (palette, drawing, particles). Sound goes through the shell synth in lib/sound.ts. */
import {sfx,hasSfx} from '../../lib/sound';
const A:any={games:[]};
A.register=(g:any)=>{A.games.push(g)};
A.C={hot:'#FF69B4',deep:'#FF1493',mag:'#FF00FF',fire:'#FF4500',gold:'#FFD700',ink:'#12000F',snow:'#FFF4FA',panel:'#1F0526',panel2:'#31093D'};
A.clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
A.rnd=(a:number,b:number)=>a+Math.random()*(b-a);
A.pick=(arr:any[])=>arr[Math.floor(Math.random()*arr.length)];
A.near=(ax:number,ay:number,bx:number,by:number,rx:number,ry?:number)=>Math.abs(ax-bx)<rx&&Math.abs(ay-by)<(ry===undefined?rx:ry);
A.rr=(g:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number)=>{const q=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+q,y);g.arcTo(x+w,y,x+w,y+h,q);g.arcTo(x+w,y+h,x,y+h,q);g.arcTo(x,y+h,x,y,q);g.arcTo(x,y,x+w,y,q);g.closePath()};
A.segHitsCircle=(ax,ay,bx,by,cx,cy,r)=>{const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,t=l===0?0:Math.max(0,Math.min(1,((cx-ax)*dx+(cy-ay)*dy)/l)),px=ax+t*dx,py=ay+t*dy;return (cx-px)*(cx-px)+(cy-py)*(cy-py)<=r*r};
A.sfx=(name:string,pitch?:number)=>{if(hasSfx(name))sfx(name,pitch)};
A.txt=(g,s,x,y,size,color,align)=>{g.font='900 '+size+'px Impact,"Arial Black",system-ui,sans-serif';g.textAlign=align||'center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=Math.max(3,size/6);g.strokeStyle=A.C.ink;g.strokeText(s,x,y);g.fillStyle=color||A.C.gold;g.fillText(s,x,y)};
A.drawCD=(g,W,H,cd,go)=>{if(cd>0){const n=Math.ceil(cd),f=cd-Math.floor(cd);g.globalAlpha=.35;g.fillStyle=A.C.ink;g.fillRect(0,0,W,H);g.globalAlpha=Math.min(1,.3+f*1.4);A.txt(g,String(n),W/2,H/2,150+f*60,A.C.gold);g.globalAlpha=1}else if(go>0){g.globalAlpha=Math.min(1,go*3);A.txt(g,'GO!',W/2,H/2,150+(1-go*2)*40,A.C.hot);g.globalAlpha=1}};
/* sparks, score pops and shock rings */
A.Fx=function(){this.clear()};
const P=A.Fx.prototype;
P.clear=function(){this.sp=[];this.pops=[];this.rings=[]};
P.burst=function(x,y,cols,n,spd,grav){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=(spd||140)*(.4+Math.random()*.8);this.sp.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0,max:.45+Math.random()*.4,c:cols[i%cols.length],s:2+Math.random()*3,g:grav===undefined?300:grav})}};
P.pop=function(text,x,y,color){this.pops.push({text,x,y,color:color||A.C.gold,t:0})};
P.ring=function(x,y,color,max){this.rings.push({x,y,color,r:4,max:max||40,t:0})};
P.update=function(dt){let i,p;
  for(i=this.sp.length-1;i>=0;i--){p=this.sp[i];p.life+=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.life>=p.max)this.sp.splice(i,1)}
  for(i=this.pops.length-1;i>=0;i--){p=this.pops[i];p.t+=dt;p.y-=38*dt;if(p.t>.9)this.pops.splice(i,1)}
  for(i=this.rings.length-1;i>=0;i--){p=this.rings[i];p.t+=dt;p.r+=(p.max-p.r)*Math.min(1,dt*7);if(p.t>.45)this.rings.splice(i,1)}};
P.draw=function(g){let i,p;
  for(i=0;i<this.sp.length;i++){p=this.sp[i];g.globalAlpha=Math.max(0,1-p.life/p.max);g.fillStyle=p.c;g.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s)}
  for(i=0;i<this.rings.length;i++){p=this.rings[i];g.globalAlpha=Math.max(0,1-p.t/.45);g.strokeStyle=p.color;g.lineWidth=3;g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.stroke()}
  g.globalAlpha=1;g.textAlign='center';g.textBaseline='middle';g.font='900 16px Impact,"Arial Black",system-ui,sans-serif';g.lineWidth=4;g.lineJoin='round';
  for(i=0;i<this.pops.length;i++){p=this.pops[i];g.globalAlpha=Math.max(0,1-p.t/.9);g.strokeStyle=A.C.ink;g.strokeText(p.text,p.x,p.y);g.fillStyle=p.color;g.fillText(p.text,p.x,p.y)}
  g.globalAlpha=1};
(globalThis as any).window??=globalThis;(window as any).Arcade=A;
export {A};
