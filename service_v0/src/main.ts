import { crdtlib } from '@concordant/c-crdtlib';
import { client } from '@concordant/c-client';

let session = client.Session.Companion.connect("miniapp", "credentials");
let collection = session.openCollection("miniAppCollection", false);

let cntr = collection.open("mycounter", "PNCounter", false, function () {return});

// labels
var cntlabel_crdt = document.getElementById('cnt_crdt'); // find the HTML element in the DOM

export function incrLabel() {
    // this function is executed whenever the user clicks the increment button
    session.transaction(client.utils.ConsistencyLevel.RC, () => {
        cntr.increment(1);
        if (cntlabel_crdt){
            cntlabel_crdt.textContent = cntr.get()
        }
    })
}

export function decrLabel() {
    // this function is executed whenever the user clicks the decrement button
    session.transaction(client.utils.ConsistencyLevel.RC, () => {
        cntr.decrement(1);
        if (cntlabel_crdt){
            cntlabel_crdt.textContent = cntr.get()
        }
    })
}

import { GList } from './RGASimpleList';

const listsRoot: HTMLElement | null =
    document.getElementById('listsRoot');
if (listsRoot == null){
    throw new Error("root element is missing in DOM");
}

var glA = new GList(session, collection);

listsRoot.appendChild(glA.render());

import { LWWMap } from './LWWMap';

const myLWWMap: HTMLElement | null =
    document.getElementById('my_lwwmap');
if (myLWWMap == null) {
    throw new Error("my_lwwmap element is missing in DOM");
}

var mapC = new LWWMap(session, collection);

myLWWMap.appendChild(mapC.render());

import { LWWRegister } from './LWWRegister';

const myLWWRegister: HTMLElement | null =
    document.getElementById('my_lwwregister');
if (myLWWRegister == null) {
    throw new Error("my_lwwregister element is missing in DOM");
}

var lregisterE = new LWWRegister(session, collection);

myLWWRegister.appendChild(lregisterE.render());

import { MVRegister } from './MVRegister';

const myMVRegister: HTMLElement | null =
    document.getElementById('my_mvregister');
if (myMVRegister == null) {
    throw new Error("my_mvregister element is missing in DOM");
}

var mvrg = new MVRegister(session, collection);

myMVRegister.appendChild(mvrg.render());
