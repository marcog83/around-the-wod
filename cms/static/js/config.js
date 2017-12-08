/**
 * Created by marcogobbi on 01/08/2017.
 */
requirejs.config({
    paths: {
        "robojs": "./libs/robojs.min"
        ,"handlebars": "./libs/handlebars"

    }
});
require(["./application"], function (main) {
    main();
})