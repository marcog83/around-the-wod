exports.getData = () => {
    return {
        data: {
            _production: process.env.NODE_ENV === "production",
            seoData: {
                seo_title: "Around The WOD"
                , seo_shareImage: "http://www.stonebridgestudio.it/static/img/profile.jpg"
                , seo_description: "This place got something."
                , seo_url: "/"
            }
            , menuBoxes: [
                {
                    type: "menu-box",
                    title: "Around<br>The<br>WOD"
                    , text: "per sportivi che viaggiano\n" +

                    "e vogliono entrare in contatto\n" +

                    "con la cultura locale"
                },
                {
                    type: "thumbnail"
                },
                {
                    type: "thumbnail"
                },
                {
                    type: "thumbnail"
                },
                {
                    type: "menu-box",
                    title: "Around<br>The<br>Food"
                    , text: "consigli utili su alimentazione in vari paesi"
                }, {
                    type: "thumbnail"
                }, {
                    type: "thumbnail"
                }, {
                    type: "thumbnail"
                }, {
                    type: "menu-box",
                    title: "Volunteer"
                    ,
                    text: "progetto di promozione e sviluppo di attività di functional training in paesi del terzo mondo"
                }, {
                    type: "thumbnail"
                }, {
                    type: "thumbnail"
                }, {
                    type: "thumbnail"
                }
            ]
        }
    }
};