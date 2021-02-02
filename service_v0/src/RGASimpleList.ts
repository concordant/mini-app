import { crdtlib } from '@concordant/c-crdtlib';
import { client } from '@concordant/c-client';

export class GList{
    // CRDTlib objects declared as "any" to workaround
    // [#29](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/issues/29)
    // environment (clock & version vector)
    private env: any; //crdtlib.utils.Environment;
    // the RGA
    private elementsRGA: any; //: crdtlib.crdt.RGA;
    private session : any;

    // whole list component
    private gElem: HTMLElement;
    // displayed list, with delete buttons
    private gul: HTMLElement;
    // input text (value to be inserted)
    private gintext: HTMLInputElement;
    // where to insert
    private gindex: HTMLInputElement;
    // insert
    private ginbtn: HTMLInputElement;

    // refresh checkbox
    private refreshBox: HTMLInputElement;
    // keep the id value returned by setInterval()
    private timer: number | undefined;

    constructor(session: any, collection: any) {
        this.session = session;
        this.elementsRGA = collection.open("myrga", "RGA", false, function () {return});

        this.gElem = document.createElement("div");

        this.gintext = this.gElem.appendChild(
            document.createElement("input"));
        this.gintext.type = "text";
        this.gintext.placeholder = "Enter Your List Element";

        this.gindex = this.gElem.appendChild(
            document.createElement("input"));
        this.gindex.type = "text";
        this.gindex.placeholder = "Index";
        this.gindex.style.width="5ch";

        this.ginbtn = this.gElem.appendChild(
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

        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createElement("br"));
    
        this.refreshBox = this.gElem.appendChild(
            document.createElement("input")
        );
        this.refreshBox.type = "checkbox";
        this.refreshBox.id = "rga-auto-refresh";
        this.refreshBox.value = "auto-refresh";
        this.refreshBox.addEventListener(
            "change",
             (event: Event) => this.onChangeCheckbox()
        );
        let boxLabel : HTMLLabelElement = this.gElem.appendChild(
            document.createElement("label")
        );
        boxLabel.setAttribute('for', "rga-auto-refresh");
        boxLabel.innerHTML = " Auto-refresh";
        this.gElem.appendChild(document.createElement("br"));
        this.gElem.appendChild(document.createElement("br"));

        // refresh button, for debugging purpose:
        // render from scratch the whole list according to internal state
        // → should not generate any visible change,
        //   as each update is already applied separately
        let refreshBtn = this.gElem.appendChild(
            document.createElement("input"));
        refreshBtn.type = "button";
        refreshBtn.value = "Refresh";
        refreshBtn.addEventListener(
            "click",
            (e:Event) => this.render());

        this.gul = this.gElem.appendChild(document.createElement("ul"));
    }

    /**
     * This function manage the auto-refresh.
     */
    public onChangeCheckbox () {
        if (this.refreshBox.checked) {
            this.timer = window.setInterval( this.render.bind(this), 1000);
        } else {
            clearInterval(this.timer)
        }
    }

    /**
     * Create a new line element ("li") with delete button
     *
     * @remarks New line is not added to the list ;
     * see {@link RGASimpleList.append} and {@link RGASimpleList.insertAt}
     *
     * @param value - Content of the key
     * @returns The new line
     */
    private newLine(value: string): HTMLElement{
        let line = document.createElement("li");
        let lineDelBtn = line.appendChild(
            document.createElement("input"));
        lineDelBtn.type = "button";
        lineDelBtn.value = "X";
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
    public append(value: string) {
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            this.elementsRGA.insertAt(this.elementsRGA.get().size, value);
        })
        this.gul.appendChild(this.newLine(value));
    }

    /**
     * Insert a line to the list at given index
     *
     * @param index - The index where the line should be inserted
     * @param value - The content of the line
     */
    public insertAt(index: number, value: string) {
        let lis = this.gul.children;
        let ref = index < lis.length ? lis[index] : null;
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            this.elementsRGA.insertAt(index, value);
        })
        this.gul.insertBefore(this.newLine(value), ref);
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
        if (index == '' || isNaN(Number(index))) {
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
     * @remarks triggered by the "Add" button onclick
     */
    public doInsert() {
        let i = this.insertAtStr(this.gindex.value, this.gintext.value);
        this.gintext.value = '';
        this.gindex.value = i.toString();
    }

    /**
     * Remove a line
     *
     * @param line - the line element to remove
     */
    private remove(line: HTMLElement) {
        let parentList = line.parentElement;
        if (! parentList)
            throw new Error("line has no parent. "
                + "Are you trying to make me kill an orphan ?")
        let index = Array.prototype.indexOf.call(parentList.children, line);
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            this.elementsRGA.removeAt(index);
        })
        line.remove();
    }

    /**
     * Populate the DOM with the list content
     *
     * @returns the whole component
     */
    public render(): HTMLElement {
        // clear list
        // let gul = this.gul.cloneNode(false);
        // this.gul.parentNode.replaceChild(ngul, this.gul);
        // this.gul = ngul;
        this.gul.innerHTML = "";

        // then populate :
        // convert to Array to workaround
        // [#32](https://gitlab.inria.fr/concordant/software/c-crdtlib/-/issues/32)
        this.session.transaction(client.utils.ConsistencyLevel.None, () => {
            let iterator = this.elementsRGA.iterator()
            while (iterator.hasNext()) {
                this.gul.appendChild(this.newLine(iterator.next()));
            }
        })
        return this.gElem;
    }
}
