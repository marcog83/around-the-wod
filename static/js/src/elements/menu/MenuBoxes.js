import PerfectScrollbar from "perfect-scrollbar";
export default class MenuBoxes extends HTMLElement{
    constructor(){
        super();

    }
    connectedCallback(){
        console.log("si",this.toLocaleString())
        const ps = new PerfectScrollbar(this,{
            wheelSpeed: 20,
            suppressScrollY: true
        });
    }
    disconnectedCallback(){
        console.log("disconnect")
    }
}