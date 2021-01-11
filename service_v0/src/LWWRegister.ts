import { crdtlib } from '@concordant/c-crdtlib';

function vvToString(vv: any){
    return vv.toJson();
}

export class LWWRegister{
    // CRDTlib objects declared as "any" to workaround
    // [#29](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/issues/29)
    // environment (clock & version vector)
    private env: any; //crdtlib.utils.Environment;
    // the LWWRegister
    private elementsLWWRegister: any; //: crdtlib.crdt.LWWRegister;

    // whole list component
    private gElem: HTMLElement;
    // version vector
    private gVV: Text;
    // displayed register value
    private gDisplay: Text;
    // input value
    private gInValue: HTMLInputElement;
    // insert
    private gInBtn: HTMLInputElement;

    constructor(env: crdtlib.utils.Environment){
        this.env = env;
        this.elementsLWWRegister = crdtlib.crdt.DeltaCRDTFactory.Companion.createDeltaCRDT("LWWRegister", this.env);

        this.gElem = document.createElement("div");

        let refreshBtn = this.gElem.appendChild(
            document.createElement("input"));
        refreshBtn.type = "button";
        refreshBtn.value = "Refresh";
        refreshBtn.addEventListener(
            "click",
            (e:Event) => this.render());

        this.gVV = this.gElem.appendChild(document.createTextNode(""));
        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createTextNode("Register value : "));
        this.gDisplay = this.gElem.appendChild(document.createTextNode(this.elementsLWWRegister.get()));
        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createElement("br"));

        this.gInValue = this.gElem.appendChild(
            document.createElement("input"));
        this.gInValue.type = "text";
        this.gInValue.placeholder = "Enter The Value";

        this.gInBtn = this.gElem.appendChild(
            document.createElement("input"));
        this.gInBtn.type = "button";
        this.gInBtn.value = "Modify value";
        this.gInBtn.addEventListener(
            "click",
            (e:Event) => this.insert(this.gInValue.value));

        // Trigger the button element with a click on "Enter" key
        this.gInValue.addEventListener("keyup", (e:KeyboardEvent) => {
            if (e.keyCode === 13) { this.gInBtn.click(); }
        });
    }

    /**
     * Insert value
     *
     * @remarks triggered by the "Add" button onclick
     */
    public insert(value: string){
        this.elementsLWWRegister.set(value);
        this.gDisplay.nodeValue=value;
        this.update();
    }

    /**
     * Update the DOM and returns the whole element
     *
     * @returns the whole component
     */
    public render(): HTMLElement{
        this.gVV.nodeValue = vvToString(this.getState().vv);
        this.gDisplay.nodeValue=this.elementsLWWRegister.get();
        return this.gElem;
    }

    /**
     * Update the displayed Version Vector after a change.
     */
    private update(){
        this.gVV.nodeValue = vvToString(this.getState().vv);
    }

    ////////// Synchronization methods //////////

    /**
     * Get current state: LWWregister & current version vector
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
     * (same structure as {@link LWWRegister.getState})
     */
    public getDeltaFrom(vv: crdtlib.crdt.VersionVector):
    {delta: crdtlib.crdt.DeltaCRDT,
     vv: crdtlib.crdt.VersionVector}{
        return {delta: this.elementsLWWRegister.generateDelta(vv),
                vv: this.env.getState()};
    }

    /**
     * Merge a delta or state into this replica
     *
     * @param delta - the delta, as returned
     * by {@link LWWRegister.getState}
     * or {@link LWWRegister.getDeltaFrom}
     */
    public merge(delta:
                 {delta: crdtlib.crdt.DeltaCRDT,
                  vv: crdtlib.crdt.VersionVector}){
        this.elementsLWWRegister.merge(delta.delta);
        this.env.updateVv(delta.vv);
        this.render();
    }
}
