import crdtlib = require('c-crdtlib');
var crdtl = crdtlib.crdtlib;

var cntr = new crdtl.crdt.PNCounter();
var x:number = 0;

// labels
var cntlabel_local = document.getElementById('cnt_local'); // find the HTML element in the DOM
var cntlabel_crdt = document.getElementById('cnt_crdt'); // find the HTML element in the DOM

export function incrLabel() {
    // this function is executed whenever the user clicks the increment button
    if (cntlabel_local) {
      cntlabel_local.textContent = (++x).toString()
    }
    if (cntlabel_crdt) {
        cntr.increment();
        cntlabel_crdt.textContent = cntr.get().toString()
    }
}

export function decrLabel() {
    // this function is executed whenever the user clicks the increment button
    if (cntlabel_local)
      cntlabel_local.textContent = (--x).toString()
    if (cntlabel_crdt) {
        cntr.decrement();
        cntlabel_crdt.textContent = cntr.get().toString()
    }
}
