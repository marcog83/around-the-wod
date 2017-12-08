const {getPosts} = require("./facebook");


exports.getData = () => {
    return Promise.all([

        getPosts()

    ]).then(([posts]) => {
        return {
            data: {
                _production:process.env.NODE_ENV=="production",
                seoData: {
                    seo_title: "Posts | Stonebridge Studio"
                    , seo_shareImage: "http://www.stonebridgestudio.it/static/img/profile.jpg"
                    , seo_description: "This place got something."
                    , seo_url: "/posts"
                }

                , posts: posts.filter(({full_picture, message}) => {
                    return full_picture && message
                })
            }
        }
    })
};