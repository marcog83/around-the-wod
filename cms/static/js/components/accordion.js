/**
 * Created by mgobbi on 04/08/2017.
 */
define(function () {
    return function (node) {
        var button = node.querySelector("[data-accordion-button]");
        var expando = node.querySelector("[data-accordion-expand]");
        button.addEventListener("click", function () {
            expando.classList.toggle("hidden");
        })
    };
});