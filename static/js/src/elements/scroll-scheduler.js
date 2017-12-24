import {create} from "@most/create";

var oTick = create(function (add) {
    var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"

    var lastScrollTop = st;
// element should be replaced with the actual target element on which you have applied scroll, use window in case of no target element.
    document.addEventListener("scroll", function () { // or window.addEventListener("scroll"....
        var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
        if (st > lastScrollTop) {
            // downscroll code
            add(true);
        } else {
            // upscroll code
            add(false);
        }
        lastScrollTop = st;
    }, false);
    return function () {

    }
});

export default {
    oTick
};