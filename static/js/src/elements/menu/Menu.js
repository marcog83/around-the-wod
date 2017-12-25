export default class Menu extends HTMLElement {
    constructor(dispatcher) {
        super();
        this.dispatcher = dispatcher;

    }

// A getter/setter for an open property.
    get open() {
        return this.hasAttribute('open');
    }

    set open(val) {
        // Reflect the value of the open property as an HTML attribute.
        if (val) {
            this.setAttribute('open', '');
        } else {
            this.removeAttribute('open');
        }

    }

    static get observedAttributes() {
        return ['open'];
    }

    // Only called for the disabled and open attributes due to observedAttributes
    attributeChangedCallback(name, oldValue, newValue) {

        // TODO: also react to the open attribute changing.
    }

    connectedCallback() {
        console.log("attached foo element", this);
        this.querySelector("#nav-trigger__button").addEventListener("click", () => {
            this.open = !this.open;
            document.body.classList.toggle("overflow-hidden");
        });
    }

    disconnectedCallback() {
        console.log("deattached foo element", this)
    }
}