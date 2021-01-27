import { crdtlib } from '@concordant/c-crdtlib';
import { client } from '@concordant/c-client';

export class MVRegister{
    // CRDTlib objects declared as "any" to workaround
    // [#29](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/issues/29)
    // environment (clock & version vector)
    private env: any; //crdtlib.utils.Environment;
    // the MVRegister
    private elementsMVRegister: any; //: crdtlib.crdt.MVRegister;
    private session: any

    // whole list component
    private gElem: HTMLElement;
    // displayed register value
    private gDisplay: Text;
    // input value
    private gInValue: HTMLInputElement;
    // insert
    private gInBtn: HTMLInputElement;

    constructor(session: any, collection: any){
        this.session = session;
        this.elementsMVRegister = collection.open("mymvregister", "MVRegister", false, function () {return});

        this.gElem = document.createElement("div");

        let refreshBtn = this.gElem.appendChild(
            document.createElement("input"));
        refreshBtn.type = "button";
        refreshBtn.value = "Refresh";
        refreshBtn.addEventListener("click", (e:Event) => this.render());
        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createElement("br"));

        this.gElem.appendChild(document.createTextNode("Register value : "));
        this.gDisplay = this.gElem.appendChild(document.createTextNode(""));
        this.session.transaction(client.utils.ConsistencyLevel.RC, () => {
            this.gDisplay.nodeValue=this.elementsMVRegister.get();
        }) 
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
    public insert(value: string) {
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            this.elementsMVRegister.set(value);
            this.gDisplay.nodeValue=this.elementsMVRegister.get();
        })
    }

    /**
     * Update the DOM and returns the whole element
     *
     * @returns the whole component
     */
    public render(): HTMLElement{
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            this.gDisplay.nodeValue=this.elementsMVRegister.get();
        })
        return this.gElem;
    }
}
