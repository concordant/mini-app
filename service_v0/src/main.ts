import { crdtlib } from '@concordant/c-crdtlib';
import { client } from '@concordant/c-client';

let session = client.Session.Companion.connect("miniapp", "credentials");
let collection = session.openCollection("miniAppCollection", false);

let cntr = collection.open("mycounter", "PNCounter", false, function (a: any, b:any) {return});

// labels
var cntlabel_crdt = document.getElementById('cnt_crdt'); // find the HTML element in the DOM

export function incrLabel() {
    // this function is executed whenever the user clicks the increment button
    if (cntlabel_crdt) {
        session.transaction(client.utils.ConsistencyLevel.RC, () => {
            cntr.increment(1);
            if (cntlabel_crdt){
                cntlabel_crdt.textContent = cntr.get()
            }
        })
    }
}

export function decrLabel() {
    // this function is executed whenever the user clicks the decrement button
    if (cntlabel_crdt) {
        session.transaction(client.utils.ConsistencyLevel.RC, () => {
            cntr.decrement(1);
            if (cntlabel_crdt){
                cntlabel_crdt.textContent = cntr.get()
            }
        })
    }
}

import { GList } from './RGASimpleList';

const listsRoot: HTMLElement | null =
    document.getElementById('listsRoot');
if (listsRoot == null){
    throw new Error("root element is missing in DOM");
}

let envA = new crdtlib.utils.SimpleEnvironment(
    new crdtlib.utils.ClientUId("myClientA"));
var glA = new GList(envA);

let envB = new crdtlib.utils.SimpleEnvironment(
        new crdtlib.utils.ClientUId("myClientB"));
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
listsRoot.appendChild(document.createElement("br"));
listsRoot.appendChild(AtoB);
listsRoot.appendChild(BtoA);
listsRoot.appendChild(document.createElement("br"));
listsRoot.appendChild(document.createElement("br"));
listsRoot.appendChild(glB.render());

import { LWWMap } from './LWWMap';

const myLWWMap: HTMLElement | null =
    document.getElementById('my_lwwmap');
if (myLWWMap == null){
    throw new Error("my_lwwmap element is missing in DOM");
}

let envC = new crdtlib.utils.SimpleEnvironment(
    new crdtlib.utils.ClientUId("myClientC"));
var mapC = new LWWMap(envC);

let envD = new crdtlib.utils.SimpleEnvironment(
        new crdtlib.utils.ClientUId("myClientD"));
var mapD = new LWWMap(envD);

let CtoD = document.createElement("input");
CtoD.type = "button";
CtoD.value = "↓↓↓↓↓";
CtoD.addEventListener("click", (e:Event) => mapD.merge(mapC.getState()));

// propagate from B to A (delta)
let DtoC = document.createElement("input");
DtoC.type = "button";
DtoC.value = "↑↑↑↑↑";
DtoC.addEventListener("click", (e:Event) => {
    let cVV = mapC.getState().vv;
    let delta = mapD.getDeltaFrom(cVV);
    mapC.merge(delta);
})

myLWWMap.appendChild(mapC.render());
myLWWMap.appendChild(document.createElement("br"));
myLWWMap.appendChild(CtoD);
myLWWMap.appendChild(DtoC);
myLWWMap.appendChild(document.createElement("br"));
myLWWMap.appendChild(document.createElement("br"));
myLWWMap.appendChild(mapD.render());

import { LWWRegister } from './LWWRegister';

const myLWWRegister: HTMLElement | null =
    document.getElementById('my_lwwregister');
if (myLWWRegister == null){
    throw new Error("my_lwwregister element is missing in DOM");
}

let envE = new crdtlib.utils.SimpleEnvironment(
    new crdtlib.utils.ClientUId("myClientE"));
var lregisterE = new LWWRegister(envE);

let envF = new crdtlib.utils.SimpleEnvironment(
        new crdtlib.utils.ClientUId("myClientF"));
var lregisterF = new LWWRegister(envF);

let EtoF = document.createElement("input");
EtoF.type = "button";
EtoF.value = "↓↓↓↓↓";
EtoF.addEventListener("click", (e:Event) => lregisterF.merge(lregisterE.getState()));

// propagate from B to A (delta)
let FtoE = document.createElement("input");
FtoE.type = "button";
FtoE.value = "↑↑↑↑↑";
FtoE.addEventListener("click", (e:Event) => {
    let cVV = lregisterE.getState().vv;
    let delta = lregisterF.getDeltaFrom(cVV);
    lregisterE.merge(delta);
})

myLWWRegister.appendChild(lregisterE.render());
myLWWRegister.appendChild(document.createElement("br"));
myLWWRegister.appendChild(EtoF);
myLWWRegister.appendChild(FtoE);
myLWWRegister.appendChild(document.createElement("br"));
myLWWRegister.appendChild(document.createElement("br"));
myLWWRegister.appendChild(lregisterF.render());

import { MVRegister } from './MVRegister';

const myMVRegister: HTMLElement | null =
    document.getElementById('my_mvregister');
if (myMVRegister == null){
    throw new Error("my_mvregister element is missing in DOM");
}

let envG = new crdtlib.utils.SimpleEnvironment(
    new crdtlib.utils.ClientUId("myClientG"));
var mvrg = new MVRegister(envG);

let envH = new crdtlib.utils.SimpleEnvironment(
        new crdtlib.utils.ClientUId("myClientH"));
var mvrh = new MVRegister(envH);

let GtoH = document.createElement("input");
GtoH.type = "button";
GtoH.value = "↓↓↓↓↓";
GtoH.addEventListener("click", (e:Event) => mvrh.merge(mvrg.getState()));

// propagate from B to A (delta)
let HtoG = document.createElement("input");
HtoG.type = "button";
HtoG.value = "↑↑↑↑↑";
HtoG.addEventListener("click", (e:Event) => {
    let cVV = mvrg.getState().vv;
    let delta = mvrh.getDeltaFrom(cVV);
    mvrg.merge(delta);
})

myMVRegister.appendChild(mvrg.render());
myMVRegister.appendChild(document.createElement("br"));
myMVRegister.appendChild(GtoH);
myMVRegister.appendChild(HtoG);
myMVRegister.appendChild(document.createElement("br"));
myMVRegister.appendChild(document.createElement("br"));
myMVRegister.appendChild(mvrh.render());
