 

 // const exphbs = require("express-handlebars");
const hbs = require("../handlebars-engine/handlebars-engine");

module.exports=function(app){
    
    app.engine('.hbs',hbs({
        pages:{
            homepage:true
        }
    }));

    app.set('views', 'fe-web/render/body/');
    app.set('view engine', 'hbs');
    app.enable('view cache');
};