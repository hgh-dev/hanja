import {useLayoutEffect} from 'react';

// Size both square boards from the space left after their real controls.
export default function useStudySizing(active:boolean){
  useLayoutEffect(()=>{
    if(!active)return;
    const panel=document.querySelector<HTMLElement>('.practice-panel');
    const picture=document.querySelector<HTMLElement>('.memory-picture');
    if(!panel||!picture)return;
    const outer=(el:Element|null)=>{if(!el)return 0;const s=getComputedStyle(el);return s.display==='none'?0:el.getBoundingClientRect().height+parseFloat(s.marginTop)+parseFloat(s.marginBottom);};
    const set=(el:HTMLElement,key:string,value:number)=>{const next=`${Math.max(0,Math.floor(value))}px`;if(el.style.getPropertyValue(key)!==next)el.style.setProperty(key,next);};
    const measure=()=>{
      const s=getComputedStyle(panel);
      const available=panel.clientHeight-parseFloat(s.paddingTop)-parseFloat(s.paddingBottom);
      const fixed=[':scope > h2','.stroke-title','.writing-board h3','.stroke-controls','.stroke p','.stroke small','.shared-writing-tools'].reduce((sum,sel)=>sum+outer(panel.querySelector(sel)),0);
      const work=panel.querySelector<HTMLElement>('.practice-work');
      if(work){
        const columns=work.querySelectorAll('.writing-board').length;
        const tabletPortrait=columns===2&&window.matchMedia('(min-width:700px) and (max-width:1099px) and (min-height:1100px) and (orientation:portrait)').matches;
        if(tabletPortrait){
          const secondHeading=outer(work.querySelectorAll('.writing-board h3')[1]);
          const boardSize=Math.min(work.clientWidth,(available-fixed-secondHeading-18)/3);
          set(work,'--study-board-size',boardSize);
          set(work,'--stroke-board-size',boardSize);
        }else{
          const writingSize=columns?Math.min((work.clientWidth-8*(columns-1))/columns,(available-fixed-8)/2):0;
          set(work,'--study-board-size',writingSize);
          set(work,'--stroke-board-size',Math.min(work.clientWidth,available-fixed-8-writingSize));
        }
      }
      const ps=getComputedStyle(picture);
      const artSpace=picture.clientHeight-parseFloat(ps.paddingTop)-parseFloat(ps.paddingBottom)-outer(picture.querySelector('.memory-copy'))-4;
      set(picture,'--memory-art-size',Math.min(picture.clientWidth-parseFloat(ps.paddingLeft)-parseFloat(ps.paddingRight),artSpace));
    };
    let frame=0;
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
    const resize=typeof ResizeObserver!=='undefined'?new ResizeObserver(schedule):null;
    resize?.observe(panel);resize?.observe(picture);
    // Stroke loading and captions change the amount of space reserved for text.
    const mutation=new MutationObserver(schedule);
    mutation.observe(panel,{childList:true,subtree:true});mutation.observe(picture,{childList:true,subtree:true,characterData:true});
    window.addEventListener('resize',schedule);measure();
    return()=>{cancelAnimationFrame(frame);resize?.disconnect();mutation.disconnect();window.removeEventListener('resize',schedule);};
  },[active]);
}
