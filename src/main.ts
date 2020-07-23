import crdtlib = require('c-crdtlib');
let crdtl = crdtlib.crdtlib;

let env = crdtl.utils.SimpleEnvironment_init_yu9ib0$("myClientId");
let cntr = crdtl.crdt.PNCounter_init_u1d9q$();

// labels
var cntlabel_crdt = document.getElementById('cnt_crdt'); // find the HTML element in the DOM

export function incrLabel() {
    // this function is executed whenever the user clicks the increment button
    if (cntlabel_crdt) {
        var delta = cntr.increment(1, env.getNewTimestamp());
        cntr.merge(delta);
        cntlabel_crdt.textContent = cntr.get().toString()
    }
}

export function decrLabel() {
    // this function is executed whenever the user clicks the decrement button
   if (cntlabel_crdt) {
        var delta = cntr.decrement(1, env.getNewTimestamp());
        cntr.merge(delta);
        cntlabel_crdt.textContent = cntr.get().toString()
    }
}