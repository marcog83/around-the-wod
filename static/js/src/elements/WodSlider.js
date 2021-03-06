// Import Swiper and modules
import {Swiper, Navigation, Pagination, Mousewheel, Keyboard} from 'swiper/dist/js/swiper.esm.js';
// import TweenMax from "gsap";
// Install modules
Swiper.use([Navigation, Pagination, Mousewheel, Keyboard]);
export default class WodSlider extends HTMLElement {
    constructor(dispatcher) {
        super();
        this.dispatcher = dispatcher;
        this.pagination = this.querySelector('.swiper-pagination');
        this.container = this.querySelector(".swiper-container");

    }

    static get observedAttributes() {
        return ['zoomed'];
    }

    get zoomed() {
        return this.hasAttribute('zoomed');
    }

    set zoomed(val) {
        // Reflect the value of the open property as an HTML attribute.
        if (val) {
            this.setAttribute('zoomed', '');
        } else {
            this.removeAttribute('zoomed');
        }

    }

    disconnectCallback() {
        this.swiper.destroy();
    }

    // Only called for the disabled and open attributes due to observedAttributes
    attributeChangedCallback(name, oldValue, zoomed) {
        let opts = {
            spaceBetween: 0
            ,freeMode:false
            ,freeModeSticky:false
        };
        if (zoomed!=null) {
            opts.spaceBetween = 10;
            opts.freeMode = true;
            opts.freeModeSticky = true;
            opts.freeModeMomentumRatio = .2;
            // opts.freeModeMomentumVelocityRatio = .2;

            // TweenMax.to(this.querySelector(".wod-slider-zoom"), .3, {scale: .6});
        }else{
            // TweenMax.to(this.querySelector(".wod-slider-zoom"), .3, {scale: 1});
        }
        Object.assign(this.swiper.params, opts);
        // this.swiper.update();

    }

    connectedCallback() {
        this.swiper = new Swiper(this.container, {
            spaceBetween: 0,
            slidesPerView: 1,
            pagination: {
                el: this.pagination
                , type: 'bullets'
            }
            ,slideToClickedSlide:true
            , keyboard: true

        });

        this.addEventListener("click", e => {
            // if (this.zoomed) {
            //
            // } else {
            //
            // }

            this.zoomed = !this.zoomed;


            // swiper.update();
        })

    }
}