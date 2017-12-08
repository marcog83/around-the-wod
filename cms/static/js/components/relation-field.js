/**
 * Created by mgobbi on 04/08/2017.
 */
define(function (require) {
    return function (node) {
        var select = node.querySelector(".js-select");
        var btnDetail = node.querySelector(".js-detail-btn");
        var pattern = btnDetail.dataset.patternUrl;

        function setDetailBtn() {
            if (select.value) {
                btnDetail.href = pattern + select.value;
                btnDetail.classList.remove("disabled")
            } else {
                btnDetail.classList.add("disabled")
            }

        }

        select.addEventListener("change", setDetailBtn);
        setDetailBtn();
    };
});

