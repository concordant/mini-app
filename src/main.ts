import { crdtlib as crdtl } from 'c-crdtlib';

let env = new crdtl.utils.SimpleEnvironment(
    new crdtl.utils.ClientUId("myClientId"));
let cntr = new crdtl.crdt.PNCounter();

// labels
var cntlabel_crdt = document.getElementById('cnt_crdt'); // find the HTML element in the DOM

export function incrLabel() {
    // this function is executed whenever the user clicks the increment button
    if (cntlabel_crdt) {
        cntr.increment(1, env.tick());
        cntlabel_crdt.textContent = cntr.get().toString()
    }
}

export function decrLabel() {
    // this function is executed whenever the user clicks the decrement button
   if (cntlabel_crdt) {
        cntr.decrement(1, env.tick());
        cntlabel_crdt.textContent = cntr.get().toString()
    }
}

import { GList } from './RGASimpleList';

const listsRoot: HTMLElement | null =
    document.getElementById('listsRoot');
if (listsRoot == null){
    throw new Error("root element is missing in DOM");
}

let envA = new crdtl.utils.SimpleEnvironment(
    new crdtl.utils.ClientUId("myClientA"));
var glA = new GList(envA);

let envB = new crdtl.utils.SimpleEnvironment(
        new crdtl.utils.ClientUId("myClientB"));
var glB = new GList(envB);

// propagate from A to B (full state)
let AtoB = document.createElement("input");
AtoB.type = "button";
AtoB.value = "↓↓↓↓↓";
AtoB.addEventListener("click", (e:Event) => glB.merge(glA.getState()));

// propagate from B to A (delta)
let BtoA = document.createElement("input");
BtoA.type = "button";
BtoA.value = "↑↑↑↑↑";
BtoA.addEventListener("click", (e:Event) => {
    let aVV = glA.getState().vv;
    let delta = glB.getDeltaFrom(aVV);
    glA.merge(delta);
})

listsRoot.appendChild(glA.render());
listsRoot.appendChild(AtoB);
listsRoot.appendChild(BtoA);
listsRoot.appendChild(glB.render());
