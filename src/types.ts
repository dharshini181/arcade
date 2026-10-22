import type {ComponentType} from 'react';
export type Result={score:number;win:boolean;detail:string};
export type Api={cfg:Record<string,string>;finish:(r:Result)=>void;setScore:(n:number)=>void;touch:()=>void;elapsed:()=>number;paused:boolean};
export type GameDef={id:string;title:string;tag:string;how:string;color:string;c2:string;dark:boolean;noCount?:boolean;Icon:ComponentType<{className?:string}>;options:{key:string;label:string;values:string[];def:string}[];Game:ComponentType<{api:Api}>};
