import {el} from '@elemaudio/core';

export default function test(props, xl, xr) {
  
  // attackSec: ElemNode, 
  // decaySec: ElemNode, 
  // sustain: ElemNode, 
  // releaseSec: ElemNode, 
  // gate: ElemNode
  const adsr = el.adsr(0.01, 1, 0.0 , 0.0, 1.00111902);
  const lfo = el.mul(adsr,el.cycle(5));
  const sin = el.mul(el.cycle(440),lfo);

  return [
    sin,
    sin,
  ];
}
