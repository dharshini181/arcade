import {AnimatePresence,motion} from 'framer-motion';import {Btn} from './ui';
export function Dialog({open,title,text,yes='Yes',no='Cancel',onYes,onNo}:{open:boolean;title:string;text:string;yes?:string;no?:string;onYes:()=>void;onNo:()=>void}){
return <AnimatePresence>{open&&<motion.div key="dlg" role="alertdialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[70] grid place-items-center bg-night/80 px-5 backdrop-blur-sm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
<motion.div className="bezel w-full max-w-sm p-5 text-center" initial={{scale:.7,y:30}} animate={{scale:1,y:0}} exit={{scale:.8,opacity:0}} transition={{type:'spring',stiffness:300,damping:20}}>
<h2 className="glow font-display text-2xl text-gold">{title}</h2><p className="mt-2 text-snow/90">{text}</p>
<div className="mt-5 grid grid-cols-2 gap-3"><Btn className="bg-snow" onClick={onNo}>{no}</Btn><Btn className="bg-deep" onClick={onYes}>{yes}</Btn></div></motion.div></motion.div>}</AnimatePresence>}
