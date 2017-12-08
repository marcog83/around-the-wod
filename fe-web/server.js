// process.env.NODE_ENV = "production"
const express = require('express');
const fs = require('fs');
const http2 = require('spdy');
const compression = require("compression");
const handlebars = require('./render/handlebars-config');
const SeoPlugin = require('../cms/fe-web/plugins/seo/seo-plugin');
const photoGallery = require("./routers/photo-gallery");
const homepage = require("./routers/homepage");
const contacts = require("./routers/contacts");
const whoWeAre = require("./routers/who-we-are");
const artists = require("./routers/artists");
const disco = require("./routers/disco");
const posts = require("./routers/posts");
const cms = require("../cms/fe-web/server").cms;

const app = express();

handlebars(app);

function cacheMiddleware(seconds) {
    return function (req, res, next) {
        var date = new Date();
        date.setDate(date.getDate() + 1);
        date.setHours(0, 0, 0, 0);
        res.setHeader("Cache-Control", `public, must-revalidate, max-age=${seconds}`);
        res.setHeader("Service-Worker-Allowed", `/`);
        res.setHeader("Expires", date.toString());
        next();
    }
}


app.get("/**", function (req, res, next) {
    if (req.originalUrl.match(/\/static|\/cms/gim) === null) {
        next();
    }else {
        next( 'route' );
    }
}, SeoPlugin.middleware);
app.use("/cms", cms);
app.use(compression());
app.use(cacheMiddleware(3600));
let staticPath = '/../static';
if (process.env.NODE_ENV === "production") {
    staticPath = '/static'
}
app.use('/static', express.static(__dirname + staticPath, {
    maxAge: '5d'
    , etag: "strong"
}));
// app.use('/uploads', express.static(__dirname + '/../uploads'));
app.use('/', homepage);
app.use('/contacts', contacts);
app.use('/photo-gallery', photoGallery);
app.use('/who-we-are', whoWeAre);
app.use('/gruppi', artists);
app.use('/dischi', disco);
app.use('/posts', posts);
//

const PORT = process.env.PORT || 4900;


// http2.createServer(options, app)
app.listen(PORT, () => {
        console.log(`Server is listening on http://localhost:${PORT}.
You can open the URL in the browser.`)
    }
);