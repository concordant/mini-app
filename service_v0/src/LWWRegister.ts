import { crdtlib } from '@concordant/c-crdtlib';
import { client } from '@concordant/c-client';

export class LWWRegister{
    // CRDTlib objects declared as "any" to workaround
    // [#29](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/issues/29)
    // environment (clock & version vector)
    private env: any; //crdtlib.utils.Environment;
    // the LWWRegister
    private elementsLWWRegister: any; //: crdtlib.crdt.LWWRegister;
    private session: any;

    // whole list component
    private gElem: HTMLElement;
    // displayed register value
    private gDisplay: HTMLSpanElement;
    // input value
    private gInValue: HTMLInputElement;
    // insert
    private gInBtn: HTMLInputElement;

    // refresh checkbox
    private refreshBox: HTMLInputElement;
    // keep the id value returned by setInterval()
    private timer: number | undefined;

    constructor(session: any, collection: any) {
        this.session = session;
        this.elementsLWWRegister = collection.open("mylwwregister", "LWWRegister", false, function () {return});

        this.gElem = document.createElement("div");

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

        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createElement("br"));

        this.refreshBox = this.gElem.appendChild(
            document.createElement("input")
        );
        this.refreshBox.type = "checkbox";
        this.refreshBox.id = "lwwregister-auto-refresh";
        this.refreshBox.value = "auto-refresh";
        this.refreshBox.addEventListener(
            "change",
             (event: Event) => this.onChangeCheckbox()
        );
        let boxLabel : HTMLLabelElement = this.gElem.appendChild(
            document.createElement("label")
        );
        boxLabel.setAttribute('for', "lwwregister-auto-refresh");
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
        this.gElem.appendChild(document.createTextNode("Register value : "));
        this.gDisplay = this.gElem.appendChild(document.createElement("span"));
        this.gDisplay.className = "longValue";
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            this.gDisplay.innerHTML = this.elementsLWWRegister.get();
        }) 
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
     * Insert value
     *
     * @remarks triggered by the "Add" button onclick
     */
    private insert(value: string) {
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            this.elementsLWWRegister.set(value);
        })
        this.gDisplay.innerHTML = value;
    }

    /**
     * Update the DOM and returns the whole element
     *
     * @returns the whole component
     */
    public render(): HTMLElement {
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            this.gDisplay.innerHTML = this.elementsLWWRegister.get();
        })
        return this.gElem;
    }
}
