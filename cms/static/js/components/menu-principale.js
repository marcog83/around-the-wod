/**
 * Created by mgobbi on 04/08/2017.
 */
define(function () {
    return function (node) {
        var trigger = node.querySelector(".menu-trigger-btn");
        var menu = node.querySelector(".menu");
        trigger.addEventListener("click", function () {
            menu.classList.toggle("opened");
        })
    }
});