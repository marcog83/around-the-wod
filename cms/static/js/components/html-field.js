/**
 * Created by marcogobbi on 08/09/2017.
 */
define(function () {

    return function (node) {
        tinymce.init({
            target: node.querySelector("textarea"),
            plugins: "code link"
        });
    }
});