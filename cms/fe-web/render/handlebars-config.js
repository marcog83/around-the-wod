 

 // const exphbs = require("express-handlebars");
const hbs = require("../handlebars-engine/handlebars-engine");
const path = require("path");
const pages = require("../render/definitions/definitions");

module.exports=function(app){
    
    app.engine('.hbs',hbs({
        pages
    }));

    app.set('views', path.join(__dirname, 'body/'));
    app.set('view engine', 'hbs');
    app.enable('view cache');
};