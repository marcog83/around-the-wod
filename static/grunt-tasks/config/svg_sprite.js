/**
 * Created by mgobbi on 28/10/2015.
 */
var utils      = require( "../utils/Utils" );
module.exports = {
	// Target options

	dist : {
		options : {
			shape : {
				dimension : {                         // Dimension related options

					precision : 1,                        // Floating point precision
					attributes : false                    // Width and height attributes on embedded shapes
				},
				id : {
					separator : "",

					generator : function ( a ) {
						var regexp_filename = /([\w\d_-]*)\.?[^\\\/]*$/i;

						return ".sprite." + a.match( regexp_filename )[ 1 ]
					}
				},
				spacing : {         // Add padding
					padding : 0
				}
			},
			mode : {
				css : {     // Activate the «css» mode
					dest : utils.getSourcePath( utils.LESS ),
					prefix : "%s",
					dimensions : "%s",
					bust : false,
					mixin : null,
					render : {
						less : {
							dest : "_sprite.less"
						}  // Activate CSS output (with default options)
					},
					sprite : "../gfx/sprite.svg"
				},
				symbol  : {
					symbol			: true,
					inline : true,
					sprite : "../gfx/sprite-defs.svg"
				},
				inline : true     // Prepare for inline embedding

			}
		},
		src : utils.getSourcePath( utils.GFX ) + '_sprite/*.svg',
		dest : utils.getSRC()
	}

};