 

 // const exphbs = require("express-handlebars");
const hbs = require("../handlebars-engine/handlebars-engine");
const path = require("path");

module.exports=function(app){
    
    app.engine('.hbs',hbs({
        pages:{
            index:true
        }
    }));

    app.set('views', path.join(__dirname, 'body/'));
    app.set('view engine', 'hbs');
    app.enable('view cache');
};