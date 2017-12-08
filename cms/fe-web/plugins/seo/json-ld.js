/**
 * Created by mgobbi on 12/09/2017.
 */
exports.getGroup = group => {
    var result = {
        "@context": "http://schema.org",
        "@type": "MusicGroup",
        "@id": group.seo.seo_url,
        "name": group.name,
        "sameAs": group.website,
        "foundingLocation": {
            "@type": "City",
            "name": group.location
        },

        "genre": (group.generi || "").toString(),
        "album": (group.dischi || []).map(disco => {
            //todo disco.seo!!!

            return {
                "albumReleaseType": "http://schema.org/AlbumRelease",
                "@type": "MusicAlbum",
                "@id": disco.seo.seo_url,
                "creditedTo": group.name,
                "byArtist": {
                    "@type": "MusicGroup",
                    "@id": group.seo.seo_url,
                    "name": group.name
                },
                "name": disco.name,
                "albumProductionType": "http://schema.org/StudioAlbum"
            }
        }),
        "member": (group.membri || []).map(m => {
            return {
                "@type": "OrganizationRole",
                "member": {
                    "@type": "Person",
                    "name": m.name
                },

                "roleName": m.strumenti
            }
        })
    };
    return result;
};
exports.getDisco = disco => {
    const response = {
        "@context": "http://schema.org",
        "@type": "MusicAlbum",
        "@id": disco.seo.seo_url,
        "name": disco.name,

        "image": disco.coverImage,
        "albumProductionType": "http://schema.org/StudioAlbum",
        "albumReleaseType": "http://schema.org/AlbumRelease",
        // "genre": "rock",
        // "byArtist": {
        //     "@type": "MusicGroup",
        //     "name": "The Beatles",
        //     "@id": "http://musicbrainz.org/artist/b10bbbfc-cf9e-42e0-be17-e2c3e1d2600d"
        // },
        "albumRelease": {
            "@type": "MusicRelease",
            "name": disco.name,
            "@id": disco.seo.seo_url
        }
    };
    return response;
};