import "@webcomponents/custom-elements";
import {bootstrap, Loader, CustomElementHandler} from "robojs";

import definitions from "./definitions";


bootstrap({
    definitions
    , loader: Loader((Mediator, resolve) => resolve(Mediator))
    , handler: CustomElementHandler({definitions})

}).promise.then(_ => console.log("Ok"))
    .catch(e => console.log(e))