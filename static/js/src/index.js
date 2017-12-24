import {bootstrap, Loader, CustomElementHandler} from "robojs";

import definitions from "./definitions";
import "./libs/polyfills/prepend";

bootstrap({
    definitions
    , loader: Loader((Mediator, resolve) => resolve(Mediator))
    , handler: CustomElementHandler({definitions})

}).promise.then(_ => console.log("Ok"))
    .catch(e => console.log(e))