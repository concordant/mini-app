import { crdtlib } from '@concordant/c-crdtlib';

function vvToString(vv: any){
    return vv.toJson();
}

export class GList{
    // CRDTlib objects declared as "any" to workaround
    // [#29](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/issues/29)
    // environment (clock & version vector)
    private env: any; //crdtlib.utils.Environment;
    // the RGA
    private elementsRGA: any; //: crdtlib.crdt.RGA;

    // whole list component
    private glist: HTMLElement;
    // version vector
    private gVV: Text;
    // displayed list, with delete buttons
    private gul: HTMLElement;
    // input text (value to be inserted)
    private gintext: HTMLInputElement;
    // where to insert
    private gindex: HTMLInputElement;
    // insert
    private ginbtn: HTMLInputElement;

    constructor(env: crdtlib.utils.Environment){
        console.log(typeof crdtlib.crdt.RGA);
        this.env = env;
        this.elementsRGA = new crdtlib.crdt.RGA();

        this.glist = document.createElement("div");

        let refreshBtn = this.glist.appendChild(
            document.createElement("input"));
        refreshBtn.type = "button";
        refreshBtn.value = "Refresh";
        refreshBtn.addEventListener(
            "click",
            (e:Event) => this.render());

        this.gVV = this.glist.appendChild(document.createTextNode(""));
        this.gul = this.glist.appendChild(document.createElement("ul"));

        this.gintext = this.glist.appendChild(
            document.createElement("input"));
        this.gintext.type = "text";
        this.gintext.placeholder = "Enter Your List Element";

        this.gindex = this.glist.appendChild(
            document.createElement("input"));
        this.gindex.type = "text";
        this.gindex.placeholder = "Index";
        this.gindex.style.width="5ch";

        this.ginbtn = this.glist.appendChild(
            document.createElement("input"));
        this.ginbtn.type = "button";
        this.ginbtn.value = "Add";
        this.ginbtn.addEventListener(
            "click",
            (e:Event) => this.doInsert());

        // Trigger the button element with a click on "Enter" key
        this.gintext.addEventListener("keyup", (e:KeyboardEvent) => {
            if (e.keyCode === 13) { this.ginbtn.click(); }
        });
        this.gindex.addEventListener("keyup", (e:KeyboardEvent) => {
            if (e.keyCode === 13) { this.ginbtn.click(); }
        });
    }

    /**
     * Create a new line element ("li") with delete button
     * and add it to the DOM
     *
     * @remarks New line is not added to the list ;
     * see {@link GList.append} and {@link GList.insertAt}
     *
     * @param value - Content of the key
     * @returns The new line
     */
    private newLine(value: string): HTMLElement{
        let line = document.createElement("li");
        let lineDelBtn = line.appendChild(
            document.createElement("input"));
        lineDelBtn.type = "button";
        lineDelBtn.value = "x";
        lineDelBtn.addEventListener("click", (e:Event) => {
            this.remove(line);
        });
        line.append(value);
        return line;
    }

    /**
     * Append a new line to the list
     *
     * @param value - The content of the line
     */
    public append(value: string){
        let ts = this.env.tick();
        this.elementsRGA.insertAt(this.elementsRGA.get().size,
                                  value,
                                  ts);
        this.gul.appendChild(this.newLine(value));
    }

    /**
     * Insert a line to the list at given index
     *
     * @param index - The index where the line should be inserted
     * @param value - The content of the line
     */
    public insertAt(index: number, value: string){
        let lis = this.gul.children;
        let ref = index < lis.length ? lis[index] : null;
        let ts = this.env.tick();
        this.elementsRGA.insertAt(index,
                                  value,
                                  ts);
        this.gul.insertBefore(this.newLine(value), lis[index]);
    }

    /**
     * Insert a line to the list at given index or append
     *
     * @param index - The index where the line should be inserted.
     * If it is not a number, the line is appended at the end of the list.
     * @param value - The content of the line
     * @returns the next index if index was a number, else an empty string
     */
    public insertAtStr(index: string, value: string): string{
        // index vide ou invalide → append
        if (index == '' || isNaN(Number(index))){
            this.append(value);
            return '';
        } else {
            this.insertAt(Number(index), value);
            return (Number(index)+1).toString();
        }
    }

    /**
     * Insert typed value at given index and reset input boxes
     *
     * @remarks triggeres by the "Add" button onclick
     */
    public doInsert(){
        let i = this.insertAtStr(this.gindex.value, this.gintext.value);
        this.gintext.value = '';
        this.gindex.value = i.toString();
        this.render();
    }

    /**
     * Remove a line
     *
     * @param line - the line element to remove
     */
    private remove(line: HTMLElement){
        let parentList = line.parentElement;
        if (! parentList)
            throw new Error("line has no parent. "
                + "Are you trying to make me kill an orphan ?")
        let index = Array.prototype.indexOf.call(
            parentList.children, line);

        let ts = this.env.tick();
        this.elementsRGA.removeAt(index,
                                  ts);
        line.remove();
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
        this.gul.innerHTML = "";

        // then populate :
        // convert to Array to workaround
        // [#32](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/issues/32)
        for (let v of this.elementsRGA.get().toArray()){
            this.gul.appendChild(this.newLine(v));
        }
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
    public getState(): {delta: crdtlib.crdt.RGA,
                        vv: crdtlib.crdt.VersionVector}{
        return {delta: this.elementsRGA, vv: this.env.getState()};
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
    {delta: crdtlib.crdt.DeltaCRDT<crdtlib.crdt.RGA>,
     vv: crdtlib.crdt.VersionVector}{
        return {delta: this.elementsRGA.generateDelta(vv),
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
                 {delta: crdtlib.crdt.DeltaCRDT<crdtlib.crdt.RGA>,
                  vv: crdtlib.crdt.VersionVector}){
        this.elementsRGA.merge(delta.delta);
        this.env.updateVv(delta.vv);
        this.render();
    }
}
