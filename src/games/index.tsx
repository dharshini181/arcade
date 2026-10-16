import type {Api,GameDef} from '../types';import {AirIcon,BasketIcon,BatakIcon,FruitIcon,GalaxIcon,HomerunIcon,KeeperIcon,MazeIcon,RacerIcon,SlingIcon} from '../components/Icons';
import {A} from './arcade/arcade';import {CanvasGame} from './arcade/CanvasGame';
/* The ten canvas games register themselves with the Arcade helper when imported (order = order on the lobby). */
import './arcade/fruit.js';import './arcade/maze.js';import './arcade/slingshot.js';import './arcade/basket.js';import './arcade/galax.js';
import './arcade/keeper.js';import './arcade/batak.js';import './arcade/homerun.js';import './arcade/air.js';import './arcade/racer.js';
const plain=(h:string)=>h.replace(/<\/li>\s*<li>/g,' ').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
// colour, second colour, icon, short tag, and whether the game draws its own on-canvas 3-2-1 / menu (then the shell skips its countdown)
const META:Record<string,[string,string,GameDef['Icon'],string,boolean]>={
fruit:['#FF4500','#FFD700',FruitIcon,'Slice fruit, dodge bombs',false],
maze:['#FFD700','#FF4500',MazeIcon,'Eat dots, outrun ghosts',false],
sling:['#FF1493','#FF00FF',SlingIcon,'Pull back, aim, smash',false],
basket:['#FF69B4','#FFD700',BasketIcon,'Catch the good stuff',false],
galax:['#FF00FF','#FF69B4',GalaxIcon,'Blast the invaders',false],
keeper:['#FFD700','#FF1493',KeeperIcon,'Save every shot',true],
batak:['#FF1493','#FFD700',BatakIcon,'Tap the glowing targets',true],
homerun:['#FF4500','#FF69B4',HomerunIcon,'Time your swing',true],
air:['#FF69B4','#FF00FF',AirIcon,'Fly through the rings',true],
racer:['#FF00FF','#FF4500',RacerIcon,'Dodge traffic, go fast',true]};
export const GAMES:GameDef[]=A.games.map((g:any)=>{const [color,c2,Icon,tag,noCount]=META[g.id];
 return{id:g.id,title:g.title,tag,how:plain(g.how),color,c2,dark:false,Icon,noCount,options:[],Game:({api}:{api:Api})=><CanvasGame id={g.id} api={api}/>}});
