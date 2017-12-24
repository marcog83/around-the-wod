
export default class MenuVisibility extends HTMLElement {
    constructor(dispatcher) {
        super();
        this.dispatcher = dispatcher;
    }

    connectedCallback() {
        console.log("attached foo element", this);
        this.querySelector(".nav-trigger").addEventListener("click", () => {
            this.classList.toggle("is-navopen");
        });
    }

    disconnectedCallback() {
        console.log("deattached foo element", this)
    }
}