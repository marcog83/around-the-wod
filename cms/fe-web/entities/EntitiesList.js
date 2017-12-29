
const TemplateEntity = require("./pages/TemplateEntity");
const Page = require("./pages/Page");
const Modello = require("./pages/Modello");
module.exports = [
      {name: "TEMPLATE ENTITY", excludeFromSeo: true, entity: new TemplateEntity()}
    , {name: "PAGE", excludeFromSeo: true, entity: new Page()}
    , {name: "MODELLO",excludeFromContents:true, entity: new Modello()}

];