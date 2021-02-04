import { crdtlib } from '@concordant/c-crdtlib';
import { client } from '@concordant/c-client';

export class LWWMap {
    // CRDTlib objects declared as "any" to workaround
    // [#29](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/issues/29)
    // environment (clock & version vector)
    private env: any; //crdtlib.utils.Environment;
    // the LWWMap
    private elementsLWWMap: any; //: crdtlib.crdt.LWWMap;
    private session: any;

    // whole list component
    private gElem: HTMLElement;
    // array of displayed list, with delete buttons
    private gulMap: any = {};

    // input key
    private gInKey: HTMLInputElement;
    // input type selector
    private selectType: HTMLSelectElement;
    // input value
    private gInValue : any;
    // insert button
    private gInBtn: HTMLInputElement;

    // refresh checkbox
    private refreshBox: HTMLInputElement;
    // keep the id value returned by setInterval()
    private timer: number | undefined;

    constructor(session: any, collection: any) {
        enum MapTypes {
            String,
            Int,
            Double,
            Boolean
          }

        this.session = session;
        this.elementsLWWMap = collection.open("mylwwmap", "LWWMap", false, function () {return});

        this.gElem = document.createElement("div");

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
            (e:Event) => this.setValueType(this.selectType.value)
        );
        
        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createElement("br"));            

        this.refreshBox = this.gElem.appendChild(
            document.createElement("input")
        );
        this.refreshBox.type = "checkbox";
        this.refreshBox.id = "lwwmap-auto-refresh";
        this.refreshBox.value = "auto-refresh";
        this.refreshBox.addEventListener(
            "change",
             (event: Event) => this.onChangeCheckbox()
        );
        let boxLabel : HTMLLabelElement = this.gElem.appendChild(
            document.createElement("label")
        );
        boxLabel.setAttribute('for', "lwwmap-auto-refresh");
        boxLabel.innerHTML = " Auto-refresh";
        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createElement("br"));

        let refreshBtn = this.gElem.appendChild(
            document.createElement("input"));
        refreshBtn.type = "button";
        refreshBtn.value = "Refresh";
        refreshBtn.addEventListener(
            "click",
            (e:Event) => this.render());

        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createTextNode("String values :"));
        this.gulMap["String"] = this.gElem.appendChild(document.createElement("ul"));
        this.gElem.appendChild(document.createTextNode("Integer values :"));
        this.gulMap["Int"] = this.gElem.appendChild(document.createElement("ul"));
        this.gElem.appendChild(document.createTextNode("Double values :"));
        this.gulMap["Double"] = this.gElem.appendChild(document.createElement("ul"));
        this.gElem.appendChild(document.createTextNode("Boolean values :"));
        this.gulMap["Boolean"] = this.gElem.appendChild(document.createElement("ul"));
    }

    /**
     * This function manage the auto-refresh.
     */
    private onChangeCheckbox () {
        if (this.refreshBox.checked) {
            this.timer = window.setInterval( this.render.bind(this), 1000);
        } else {
            clearInterval(this.timer)
        }
    }

    /**
     * Update the DOM with the new value type.
     *
     * @param type The new value type
     */
    private setValueType(type:string) {
        switch (type) {
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
    private insert() {
        switch (this.selectType.value) {
            case "String":
                this.session.transaction(client.utils.ConsistencyLevel.None, () => {
                    this.elementsLWWMap.setString(this.gInKey.value, this.gInValue.value);    
                })
                break;
            case "Int":
                if (this.gInValue.value === '') {
                    return;
                }
                this.session.transaction(client.utils.ConsistencyLevel.None, () => {
                    this.elementsLWWMap.setInt(this.gInKey.value, this.gInValue.value);
                })
                break;
            case "Double":
                if (this.gInValue.value === '') {
                    return;
                }
                this.session.transaction(client.utils.ConsistencyLevel.None, () => {
                    this.elementsLWWMap.setDouble(this.gInKey.value, this.gInValue.value);
                })
                break;
            case "Boolean":
                if (this.gInValue.value.toLowerCase() != "true" &&
                    this.gInValue.value.toLowerCase() != "false") {
                    return;
                }
                this.session.transaction(client.utils.ConsistencyLevel.None, () => {
                    this.elementsLWWMap.setBoolean(this.gInKey.value, this.gInValue.value);
                })
                break;
        }
        this.renderType(this.selectType.value);
        this.gInKey.value = "";
        this.gInValue.value = "";
    }

    /**
     * Remove an element in the map and update the corresponding list.
     *
     * @param type The value type
     * @param key The element key
     *
     * @remarks Triggered by the "X" button onclick
     */
    private remove(type: string, key: string) {
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            switch (type) {
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
        })
        this.renderType(type);
    }

    /**
     * Update the DOM with the lists contents.
     *
     * @param type type of the list to be updated.
     */
    private renderType(type: string) {
        this.gulMap[type].innerHTML = "";
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            let iterator: any;
            switch (type) {
                case "String":
                    iterator = this.elementsLWWMap.iteratorString();
                    break;
                case "Int":
                    iterator = this.elementsLWWMap.iteratorInt();
                    break;
                case "Double":
                    iterator = this.elementsLWWMap.iteratorDouble();
                    break;
                case "Boolean":
                    iterator = this.elementsLWWMap.iteratorBoolean();
                    break;
            }
            while (iterator.hasNext()) {
                let elem = iterator.next()
                let line = this.newLine(type, elem.first, elem.second);
                this.gulMap[type].appendChild(line);
            }
        })
    }

    /**
     * Update the DOM with the lists contents.
     *
     * @returns the whole component
     */
    public render(): HTMLElement {
        this.renderType("String");
        this.renderType("Int");
        this.renderType("Double");
        this.renderType("Boolean");
        return this.gElem;
    }
}
