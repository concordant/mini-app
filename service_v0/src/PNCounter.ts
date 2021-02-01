import { crdtlib } from '@concordant/c-crdtlib';
import { client } from '@concordant/c-client';

export class PNCounter{
    // CRDTlib objects declared as "any" to workaround
    // [#29](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/issues/29)
    // environment (clock & version vector)
    private env: any; //crdtlib.utils.Environment;
    // the PNCounter
    private elementsPNCounter: any; //: crdtlib.crdt.PNCounter;
    private session: any

    // root div of our crdt
    private gElem: HTMLElement;
    // displayed counter value
    private gDisplay: Text;
    // increment button
    private gPlusBtn: HTMLInputElement;
    // decrement button
    private gMinusBtn: HTMLInputElement;

    // refresh checkbox
    private refreshBox: HTMLInputElement;
    // keep the id value returned by setInterval()
    private timer: number | undefined;

    constructor(session: any, collection: any) {
        this.session = session;
        this.elementsPNCounter = collection.open("mypncounter", "PNCounter", false, function () {return});

        this.gElem = document.createElement("div");

        this.refreshBox = this.gElem.appendChild(
            document.createElement("input")
        );
        this.refreshBox.type = "checkbox";
        this.refreshBox.id = "cnt-auto-refresh";
        this.refreshBox.value = "auto-refresh";
        this.refreshBox.addEventListener(
            "change",
             (event: Event) => this.onChangeCheckbox()
        );
        let boxLabel : HTMLLabelElement = this.gElem.appendChild(
            document.createElement("label")
        );
        boxLabel.setAttribute('for', "cnt-auto-refresh");
        boxLabel.innerHTML = " Auto-refresh";
        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createElement("br"));

        let refreshBtn = this.gElem.appendChild(
            document.createElement("input")
        );
        refreshBtn.type = "button";
        refreshBtn.value = "Refresh";
        refreshBtn.addEventListener("click", (e:Event) => this.render());
        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createElement("br"));

        this.gPlusBtn = this.gElem.appendChild(
            document.createElement("input"));
        this.gPlusBtn.type = "button";
        this.gPlusBtn.value = "+";
        this.gPlusBtn.addEventListener(
            "click",
            (event: Event) => this.incrLabel()
        );
        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createElement("br"));
        
        this.gElem.appendChild(document.createTextNode("Counter value: "));
        this.gDisplay = this.gElem.appendChild(document.createTextNode(""));
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            this.gDisplay.nodeValue=this.elementsPNCounter.get();
        }) 
        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createElement("br"));

        this.gMinusBtn = this.gElem.appendChild(
            document.createElement("input"));
        this.gMinusBtn.type = "button";
        this.gMinusBtn.value = "-";
        this.gMinusBtn.addEventListener(
            "click",
            (e:Event) => this.decrLabel()
        );
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
     * This function is executed whenever the user clicks the increment button.
     */
    private incrLabel() {
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            this.elementsPNCounter.increment(1);
            this.gDisplay.nodeValue=this.elementsPNCounter.get()
        })
    }
    
    /**
     * This function is executed whenever the user clicks the decrement button.
     */
    private decrLabel() {
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            this.elementsPNCounter.decrement(1);
            this.gDisplay.nodeValue=this.elementsPNCounter.get()
        })
    }

    /**
     * Update the DOM and returns the whole element
     *
     * @returns the whole component
     */
    public render(): HTMLElement{
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            this.gDisplay.nodeValue=this.elementsPNCounter.get();
        })
        return this.gElem;
    }
}
