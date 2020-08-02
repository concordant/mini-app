import crdtlib = require('c-crdtlib');
let crdtl = crdtlib.crdtlib;

let env = new crdtl.utils.SimpleEnvironment("myClientId");
let cntr = new crdtl.crdt.PNCounter();

// labels
var cntlabel_crdt = document.getElementById('cnt_crdt'); // find the HTML element in the DOM

export function incrLabel() {
    // this function is executed whenever the user clicks the increment button
    if (cntlabel_crdt) {
        cntr.increment(1, env.getNewTimestamp());
        cntlabel_crdt.textContent = cntr.get().toString()
    }
}

export function decrLabel() {
    // this function is executed whenever the user clicks the decrement button
   if (cntlabel_crdt) {
        cntr.decrement(1, env.getNewTimestamp());
        cntlabel_crdt.textContent = cntr.get().toString()
    }
}
