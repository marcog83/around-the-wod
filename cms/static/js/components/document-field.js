/**
 * Created by marcogobbi on 04/08/2017.
 */
define(function () {
    return function (node) {
        var input = node.querySelector(".js-input");
        var inputImgUrl = node.querySelector(".js-img-url");
        var img = node.querySelector(".js-img");
        var copyBtn = node.querySelector(".js-copy");
        input.addEventListener("change", function (e) {
            var file = input.files[0];
            var reader = new FileReader();

            reader.addEventListener("load", function () {
                img.src = reader.result;
            }, false);

            if (file) {
                reader.readAsDataURL(file);
            } else {
                img.src = ""
            }
        });
        if (copyBtn) {
            var clipboard = new Clipboard(copyBtn, {
                text: function (trigger) {
                    return inputImgUrl.value;
                }
            });
            clipboard.on('success', function (e) {
                alert("url documento copiato nella Clipboard")

                e.clearSelection();
            });
        }

    };
});