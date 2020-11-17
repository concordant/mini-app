
import { crdtlib } from '@concordant/c-crdtlib';

function vvToString(vv: any){
    return vv.toJson();
}

export class LWWRegister{
    // CRDTlib objects declared as "any" to workaround
    // [#29](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/issues/29)
    // environment (clock & version vector)
    private env: any; //crdtlib.utils.Environment;
    // the RGA
    private elementsLWWRegister: any; //: crdtlib.crdt.RGA<string>;

    // whole list component
    private glist: HTMLElement;
    // version vector
    private gVV: Text;
    // displayed list, with delete buttons
    private gul: Text;
    // input value
    private ginvalue: HTMLInputElement;
    // insert
    private ginbtn: HTMLInputElement;

    constructor(env: crdtlib.utils.Environment){
        console.log(typeof crdtlib.crdt.LWWRegister);
        this.env = env;
        let ts = this.env.tick();
        this.elementsLWWRegister = new crdtlib.crdt.LWWRegister("null",ts);

        this.glist = document.createElement("div");

        let refreshBtn = this.glist.appendChild(
            document.createElement("input"));
        refreshBtn.type = "button";
        refreshBtn.value = "Refresh";
        refreshBtn.addEventListener(
            "click",
            (e:Event) => this.render());

        this.gVV = this.glist.appendChild(document.createTextNode(""));
        this.glist.appendChild(document.createElement("br"));
        this.glist.appendChild(document.createElement("br"));
        this.glist.appendChild(document.createTextNode("Register value : "));
        this.gul = this.glist.appendChild(document.createTextNode(this.elementsLWWRegister.get()));
        this.glist.appendChild(document.createElement("br"));
        this.glist.appendChild(document.createElement("br"));

        this.ginvalue = this.glist.appendChild(
            document.createElement("input"));
        this.ginvalue.type = "text";
        this.ginvalue.placeholder = "Enter The Value"; 

        this.ginbtn = this.glist.appendChild(
            document.createElement("input"));
        this.ginbtn.type = "button";
        this.ginbtn.value = "Modify value";
        this.ginbtn.addEventListener(
            "click",
            (e:Event) => this.doInsertString(this.ginvalue.value));

    }

    /**
     * Insert typed value at given index and reset input boxes
     *
     * @remarks triggeres by the "Add" button onclick
     */
    public doInsertString(value: string){
        let ts = this.env.tick();
        this.elementsLWWRegister.set(value,ts);
        this.gul.nodeValue=value;
        this.gVV.nodeValue = vvToString(this.getState().vv);
    }

    /**
     * Populate the DOM with the list content
     *
     * @returns the whole component
     */
    public render(): HTMLElement{
        this.gVV.nodeValue = vvToString(this.getState().vv);
        // clear list
        // let gul = this.gul.cloneNode(false);
        // this.gul.parentNode.replaceChild(ngul, this.gul);
        // this.gul = ngul;
        // this.gul.innerHTML = "";

        // then populate :
        // convert to Array to workaround
        // [#32](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/issues/32)
        this.gul.nodeValue=this.elementsLWWRegister.get();
        return this.glist;
    }

    ////////// Synchronization methods //////////

    /**
     * Get current state: RGA & current version vector
     *
     * @remarks
     * There should be an interface containing both.
     *
     * @returns the current (full) state
     */
    public getState(): {delta: crdtlib.crdt.LWWRegister,
                        vv: crdtlib.crdt.VersionVector}{
        return {delta: this.elementsLWWRegister, vv: this.env.getState()};
    }

    /**
     * Compute a delta from a given version vector
     *
     * @param vv - current version vector of another replica,
     * used as origin for the delta
     * @returns the generated delta, with current version vector
     * (same structure as {@link RGASimpleList.getState})
     */
    public getDeltaFrom(vv: crdtlib.crdt.VersionVector):
    {delta: crdtlib.crdt.DeltaCRDT<crdtlib.crdt.LWWRegister>,
     vv: crdtlib.crdt.VersionVector}{
        return {delta: this.elementsLWWRegister.generateDelta(vv),
                vv: this.env.getState()};
    }

    /**
     * Merge a delta or state into this replica
     *
     * @param delta - the delta, as returned
     * by {@link RGASimpleList.getState}
     * or {@link RGASimpleList.getDeltaFrom}
     */
    public merge(delta:
                 {delta: crdtlib.crdt.DeltaCRDT<crdtlib.crdt.LWWRegister>,
                  vv: crdtlib.crdt.VersionVector}){
        this.elementsLWWRegister.merge(delta.delta);
        this.env.updateVv(delta.vv);
        this.render();
    }
}
