export default class MenuBoxes extends HTMLElement {
    constructor() {
        super();
        this.wrapper = this.querySelector(".menu-boxes-wrapper")
    }

    connectedCallback() {
        this.addEventListener("mousewheel", e => {
            console.log(e);
            this.scrollLeft -= e.wheelDelta
        })

    }


    disconnectedCallback() {
        console.log("disconnect")
    }
}