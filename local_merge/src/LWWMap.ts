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

    // displayed string list, with delete buttons
    private gulString: HTMLElement;
    // displayed integer list, with delete buttons
    private gulInt: HTMLElement;
    // displayed double list, with delete buttons
    private gulDouble: HTMLElement;
    // displayed boolean list, with delete buttons
    private gulBoolean: HTMLElement;

    // keep track of HTML lines for update operations on existent keys
    private gliMap: any = {};

    // input key
    private gInKey: HTMLInputElement;
    // input type selector
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
        this.elementsLWWMap = crdtlib.crdt.DeltaCRDTFactory.Companion.createDeltaCRDT("LWWMap", this.env);

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
        this.gElem.appendChild(document.createTextNode("String values :"));
        this.gulString = this.gElem.appendChild(document.createElement("ul"));
        this.gElem.appendChild(document.createTextNode("Integer values :"));
        this.gulInt = this.gElem.appendChild(document.createElement("ul"));
        this.gElem.appendChild(document.createTextNode("Double values :"));
        this.gulDouble = this.gElem.appendChild(document.createElement("ul"));
        this.gElem.appendChild(document.createTextNode("Boolean values :"));
        this.gulBoolean = this.gElem.appendChild(document.createElement("ul"));

        this.gInKey = this.gElem.appendChild(
            document.createElement("input"));
        this.gInKey.type = "text";
        this.gInKey.placeholder = "Enter The Key";

        this.selectType = this.gElem.appendChild(
            document.createElement("select"));
        this.selectType.id="mesTypes"

        var mapTypes=["String", "Int", "Double", "Boolean"]
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
            (e:Event) => this.insert());

        this.selectType.addEventListener(
                "change",
                (e:Event) => this.setValueType(this.selectType.value));
    }

    /**
     * Update the DOM with the new value type.
     *
     * @param type The new value type
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
                this.gInValue.step="0.01";
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
     * Create a new line element ("li") with delete button
     *
     * @remarks New line is not added to the map nor to the DOM
     *
     * @param type - The value type
     * @param key - The element key
     * @param value - The element value for the given key
     */
    private newLine(type: string, key: string, value: string): HTMLLIElement{
        let line = document.createElement("li");
        let lineDelBtn = line.appendChild(
            document.createElement("input"));
        lineDelBtn.type = "button";
        lineDelBtn.value = "X";
        lineDelBtn.addEventListener("click", (e:Event) => {
            this.remove(type, key);
        });
        line.appendChild(document.createTextNode(" " + key + " -> " + value));
        return line;
    }

    /**
     * Insert typed entry and reset input boxes.
     *
     * @remarks triggered by the "Add" button onclick
     */
    public insert(){

        let line : HTMLLIElement = this.gliMap[this.gInKey.value + this.selectType.value];
        let isNew : boolean = false
        if (line == undefined) {
            line = this.newLine(this.selectType.value,
                this.gInKey.value,
                this.gInValue.value);
            this.gliMap[this.gInKey.value + this.selectType.value] = line
            isNew = true
        } else {
            line.childNodes[1].textContent = " " + this.gInKey.value + " -> " + this.gInValue.value
        }
        switch (this.selectType.value){
            case "String":
                this.elementsLWWMap.setString(this.gInKey.value, this.gInValue.value);
                if (isNew) {
                    this.gulString.appendChild(line);
                }
                break;
            case "Int":
                this.elementsLWWMap.setInt(this.gInKey.value, this.gInValue.value);
                if (isNew) {
                    this.gulInt.appendChild(line);
                }
                
                break;
            case "Double":
                this.elementsLWWMap.setDouble(this.gInKey.value, this.gInValue.value);
                if (isNew) {
                    this.gulDouble.appendChild(line);
                }
                break;
            case "Boolean":
                if (this.gInValue.value=="true" || this.gInValue.value=="false"){
                    this.elementsLWWMap.setBoolean(this.gInKey.value, this.gInValue.value);
                    if (isNew) {
                        this.gulBoolean.appendChild(line);
                    }
                }
                break;
        }
        this.gInKey.value="";
        this.gInValue.value="";
        this.update();
    }

    /**
     * Remove a line and the corresponding element in the map.
     *
     * @param type The value type
     * @param key The element key
     * @remarks Triggered by the "X" button onclick
     */
    public remove(type:string, key:string){

        let line = this.gliMap[key + type]
        delete this.gliMap[key + type]

        let parentList = line.parentElement;
        if (! parentList)
            throw new Error("line has no parent. "
                + "Are you trying to make me kill an orphan ?")
        line.remove();

        switch (type){
            case "String":
                this.elementsLWWMap.deleteString(key);
                break;
            case "Int":
                this.elementsLWWMap.deleteInt(key);
                break;
            case "Double":
                this.elementsLWWMap.deleteDouble(key);
                break;
            case "Boolean":
                this.elementsLWWMap.deleteBoolean(key);
                break;
        }
    }

    /**
     * Update the DOM with the lists contents and the new version vector.
     *
     * @returns the whole component
     */
    public render(): HTMLElement{
        this.gVV.nodeValue = vvToString(this.getState().vv);

        this.gliMap = {}

        this.gulString.innerHTML = "";
        this.gulInt.innerHTML = "";
        this.gulDouble.innerHTML = "";
        this.gulBoolean.innerHTML = "";

        let iterators = [this.elementsLWWMap.iteratorString(),
            this.elementsLWWMap.iteratorInt(),
            this.elementsLWWMap.iteratorDouble(),
            this.elementsLWWMap.iteratorBoolean()]
        let type = ["String", "Int", "Double", "Boolean"]

        for (let index in iterators) {
            let iterator = iterators[index]
            while (iterator.hasNext()) {
                let elem = iterator.next()
                let line = this.newLine(type[index],
                                        elem.first, elem.second);
                this.gliMap[elem.first + type[index]] = line
                switch (type[index]){
                    case "String":
                        this.gulString.appendChild(line);
                        break;
                    case "Int":
                        this.gulInt.appendChild(line);
                        break;
                    case "Double":
                        this.gulDouble.appendChild(line);
                        break;
                    case "Boolean":
                        this.gulBoolean.appendChild(line);
                        break;
                }
            }
        }
        return this.gElem;
    }

    /**
     * Update the displayed Version Vector after a change.
     *
     * Must be called by every user-facing method modifying state
     */
    private update(){
        this.gVV.nodeValue = vvToString(this.getState().vv);
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
