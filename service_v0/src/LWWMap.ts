import { crdtlib } from '@concordant/c-crdtlib';

function vvToString(vv: any){
    return vv.toJson();
}

export class LWWMap{
    // CRDTlib objects declared as "any" to workaround
    // [#29](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/issues/29)
    // environment (clock & version vector)
    private env: any; //crdtlib.utils.Environment;
    // the LWWMap
    private elementsLWWMap: any; //: crdtlib.crdt.LWWMap;

    // whole list component
    private gElem: HTMLElement;
    // version vector
    private gVV: Text;
    // input key
    private gInKey: HTMLInputElement;
    // input key
    private selectType: HTMLSelectElement;
    // input value
    private gInValue : any;
    // insert button
    private gInBtn: HTMLInputElement;

    constructor(env: crdtlib.utils.Environment){
        enum MapTypes {
            String,
            Int,
            Double,
            Boolean
          }

        this.env = env;
        this.elementsLWWMap = new crdtlib.crdt.LWWMap();

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

        this.gInKey = this.gElem.appendChild(
            document.createElement("input"));
        this.gInKey.type = "text";
        this.gInKey.placeholder = "Enter The Key";

        this.selectType = this.gElem.appendChild(
            document.createElement("select"));
        this.selectType.id="mesTypes"
        
        var mapTypes=["String","Int","Double","Boolean"]
        mapTypes.forEach(element => {
            var option = document.createElement("option");
            option.value=element;
            option.text=element;
            this.selectType.appendChild(option);
        });

        this.gInValue = this.gElem.appendChild(
            document.createElement("input"));
        this.setValueType("String")

        this.gInBtn = this.gElem.appendChild(
            document.createElement("input"));
        this.gInBtn.type = "button";
        this.gInBtn.value = "Add";
        this.gInBtn.addEventListener(
            "click",
            (e:Event) => this.insert(this.selectType.value));

        var ginbtnr = this.gElem.appendChild(
            document.createElement("input"));
        ginbtnr.type = "button";
        ginbtnr.value = "Find";
        ginbtnr.addEventListener(
            "click",
            (e:Event) => this.search(this.selectType.value));

        var ginbtnremove = this.gElem.appendChild(
                document.createElement("input"));
        ginbtnremove.type = "button";
        ginbtnremove.value = "Remove";
        ginbtnremove.addEventListener(
            "click",
            (e:Event) => this.remove(this.selectType.value));

        this.selectType.addEventListener(
                "change", 
                (e:Event) => this.setValueType(this.selectType.value));
    }

    /**
     * Update the DOM with the new value type.
     * @param type The new value type.
     */
    private setValueType(type:string){
        switch (type){
            case "String":
                this.gInValue.type = "text";
                this.gInValue.placeholder = "Enter a string";
                this.gInValue.value="";
                break;
            case "Int":
                this.gInValue.type = "number";
                this.gInValue.step="1";
                this.gInValue.placeholder = "Enter an integer";
                this.gInValue.value="";
                break;
            case "Double":
                this.gInValue.type = "number";
                this.gInValue.step="0.001";
                this.gInValue.placeholder = "Enter a double";
                this.gInValue.value="";
                break;
            case "Boolean":
                this.gInValue.type = "text";
                this.gInValue.placeholder = "Enter true or false";
                this.gInValue.value="";
                break;
        }

    }

    /**
     * Insert typed entry and reset input boxes
     *
     * @param type The value type.
     * @remarks triggeres by the "Add" button onclick
     */
    public insert(type:string){
        let ts = this.env.tick();
        switch (type){
            case "String":
                this.elementsLWWMap.setString(this.gInKey.value,this.gInValue.value,ts);
                this.gInValue.value="";
                break;
            case "Int":
                this.elementsLWWMap.setInt(this.gInKey.value,this.gInValue.value,ts);
                this.gInValue.value=0;
                break;
            case "Double":
                this.elementsLWWMap.setDouble(this.gInKey.value,this.gInValue.value,ts);
                this.gInValue.value=0;
                break;
            case "Boolean":
                if (this.gInValue.value=="true" || this.gInValue.value=="false"){
                    this.elementsLWWMap.setBoolean(this.gInKey.value,this.gInValue.value,ts);

                }
                this.gInValue.value=""
                break;
        }
        this.gInKey.value="";
    }

    /**
     * Remove an entry
     *
     * @param type The value type.
     */
    public remove(type:string){
        let ts = this.env.tick();
        switch (type){
            case "String":
                this.elementsLWWMap.deleteString(this.gInKey.value,ts);
                break;
            case "Int":
                this.elementsLWWMap.deleteInt(this.gInKey.value,ts);
                break;
            case "Double":
                this.elementsLWWMap.deleteDouble(this.gInKey.value,ts);
                break;
            case "Boolean":
                this.elementsLWWMap.deleteBoolean(this.gInKey.value,ts);
                break;
        }
    }

    /**
     * Search an entry and display the value in the value box if founded.
     *
     * @param type The value type.
     */
    public search(type:string){
        var res=""
        switch (type){
            case "String":
                res=this.elementsLWWMap.getString(this.gInKey.value);
                break;
            case "Int":
                res=this.elementsLWWMap.getInt(this.gInKey.value);
                break;
            case "Double":
                res=this.elementsLWWMap.getDouble(this.gInKey.value);
                break;
            case "Boolean":
                res=this.elementsLWWMap.getBoolean(this.gInKey.value);
                break;
        }
        this.gInValue.value=res
        console.log(this.elementsLWWMap.entries_0)
    }

    /**
     * Update the DOM with the new version vector.
     *
     * @returns the whole component
     */
    public render(): HTMLElement{
        this.gVV.nodeValue = vvToString(this.getState().vv);
        return this.gElem;
    }

    ////////// Synchronization methods //////////

    /**
     * Get current state: LWWMap & current version vector
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
     * (same structure as {@link LWWMap.getState})
     */
    public getDeltaFrom(vv: crdtlib.crdt.VersionVector):
    {delta: crdtlib.crdt.DeltaCRDT,
     vv: crdtlib.crdt.VersionVector}{
        return {delta: this.elementsLWWMap.generateDelta(vv),
                vv: this.env.getState()};
    }

    /**
     * Merge a delta or state into this replica
     *
     * @param delta - the delta, as returned
     * by {@link LWWMap.getState}
     * or {@link LWWMap.getDeltaFrom}
     */
    public merge(delta:
                 {delta: crdtlib.crdt.DeltaCRDT,
                  vv: crdtlib.crdt.VersionVector}){
        this.elementsLWWMap.merge(delta.delta);
        this.env.updateVv(delta.vv);
        this.render();
    }
}
