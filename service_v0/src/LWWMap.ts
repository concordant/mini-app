
import { crdtlib } from 'c-crdtlib';

function vvToString(vv: any){
    return vv.toJson();
}

export class LWWMap{
    // CRDTlib objects declared as "any" to workaround
    // [#29](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/issues/29)
    // environment (clock & version vector)
    private env: any; //crdtlib.utils.Environment;
    // the RGA
    private elementsLWWMap: any; //: crdtlib.crdt.RGA<string>;

    // whole list component
    private glist: HTMLElement;
    // version vector
    private gVV: Text;
    // displayed list, with delete buttons
    private gul: HTMLElement;
    // input key
    private ginkey: HTMLInputElement;
    // input key
    private selectType: HTMLSelectElement;
    // input value
    private ginvalue : any;
    // insert
    private ginbtn: HTMLInputElement;

    constructor(env: crdtlib.utils.Environment){
        console.log(typeof crdtlib.crdt.LWWMap);

        enum MapTypes {
            String,
            Int,
            Double,
            Boolean
          }

        this.env = env;
        this.elementsLWWMap = new crdtlib.crdt.LWWMap();

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

        this.ginkey = this.glist.appendChild(
            document.createElement("input"));
        this.ginkey.type = "text";
        this.ginkey.placeholder = "Enter The Key";

        this.selectType = this.glist.appendChild(
            document.createElement("select"));
        this.selectType.id="mesTypes"
        
        var mapTypes=["String","Int","Double","Boolean"]
        mapTypes.forEach(element => {
            var option = document.createElement("option");
            option.value=element;
            option.text=element;
            this.selectType.appendChild(option);
        });

        this.ginvalue = this.glist.appendChild(
            document.createElement("input"));
        this.setginvalueType("String")

        this.ginbtn = this.glist.appendChild(
            document.createElement("input"));
        this.ginbtn.type = "button";
        this.ginbtn.value = "Add";
        this.ginbtn.addEventListener(
            "click",
            (e:Event) => this.doInsert(this.selectType.value));

        var ginbtnr = this.glist.appendChild(
            document.createElement("input"));
        ginbtnr.type = "button";
        ginbtnr.value = "Find";
        ginbtnr.addEventListener(
            "click",
            (e:Event) => this.search(this.selectType.value));

        var ginbtnremove = this.glist.appendChild(
                document.createElement("input"));
        ginbtnremove.type = "button";
        ginbtnremove.value = "Remove";
        ginbtnremove.addEventListener(
            "click",
            (e:Event) => this.remove(this.selectType.value));

        this.selectType.addEventListener(
                "change", 
                (e:Event) => this.setginvalueType(this.selectType.value));
    }

    private setginvalueType(type:string){
        switch (type){
            case "String":
                this.ginvalue.type = "text";
                this.ginvalue.placeholder = "Enter a string";
                break;
            case "Int":
                this.ginvalue.type = "number";
                this.ginvalue.step="1";
                this.ginvalue.placeholder = "Enter an integer";
                break;
            case "Double":
                this.ginvalue.type = "number";
                this.ginvalue.step="0.001";
                this.ginvalue.placeholder = "Enter a double";
                break;
            case "Boolean":
                this.ginvalue.type = "text";
                this.ginvalue.placeholder = "Enter true or false";
                break;
        }

    }

    /**
     * Insert typed value at given index and reset input boxes
     *
     * @remarks triggeres by the "Add" button onclick
     */
    public doInsert(type:string){
        let ts = this.env.tick();
        switch (type){
            case "String":
                this.elementsLWWMap.setString(this.ginkey.value,this.ginvalue.value,ts);
                break;
            case "Int":
                this.elementsLWWMap.setInt(this.ginkey.value,this.ginvalue.value,ts);
                break;
            case "Double":
                this.elementsLWWMap.setDouble(this.ginkey.value,this.ginvalue.value,ts);
                break;
            case "Boolean":
                if (this.ginvalue.value=="true" || this.ginvalue.value=="false"){
                    this.elementsLWWMap.setBoolean(this.ginkey.value,this.ginvalue.value,ts);
                } else {
                    this.ginvalue.value=""
                }
                break;
        }
        this.render();
    }

    public remove(type:string){
        let ts = this.env.tick();
        switch (type){
            case "String":
                this.elementsLWWMap.deleteString(this.ginkey.value,ts);
                break;
            case "Int":
                this.elementsLWWMap.deleteInt(this.ginkey.value,ts);
                break;
            case "Double":
                this.elementsLWWMap.deleteDouble(this.ginkey.value,ts);
                break;
            case "Boolean":
                this.elementsLWWMap.deleteBoolean(this.ginkey.value,ts);
                break;
        }
        this.render();
    }

    public search(type:string){
        var res=""
        switch (type){
            case "String":
                res=this.elementsLWWMap.getString(this.ginkey.value);
                break;
            case "Int":
                res=this.elementsLWWMap.getInt(this.ginkey.value);
                break;
            case "Double":
                res=this.elementsLWWMap.getDouble(this.ginkey.value);
                break;
            case "Boolean":
                res=this.elementsLWWMap.getBoolean(this.ginkey.value);
                break;
        }
        this.ginvalue.value=res
        console.log(this.elementsLWWMap.entries_0)
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
    public getState(): {delta: crdtlib.crdt.LWWMap,
                        vv: crdtlib.crdt.VersionVector}{
        return {delta: this.elementsLWWMap, vv: this.env.getState()};
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
    {delta: crdtlib.crdt.DeltaCRDT<crdtlib.crdt.LWWMap>,
     vv: crdtlib.crdt.VersionVector}{
        return {delta: this.elementsLWWMap.generateDelta(vv),
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
                 {delta: crdtlib.crdt.DeltaCRDT<crdtlib.crdt.LWWMap>,
                  vv: crdtlib.crdt.VersionVector}){
        this.elementsLWWMap.merge(delta.delta);
        this.env.updateVv(delta.vv);
        this.render();
    }
}
