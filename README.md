# A Druid's Duel Prototype

This code represents the complete JavaScript-based (web browser) prototype of the turn-based strategy game [A Druid's Duel](http://druidsduel.com). It implements all game rules and allows up to four players to play a complete game on the same browser.

# Project Status

The codebase was completed in August 2013. It has been changed only to load from a basic Node.js server so maps can be served statically instead of directly from the local file system.

# Credits

All game design, programming, and artwork by [Kris Szafranski](https://github.com/kdszafranski). The basic architecture is based on code from Jacob Seidelin's book, HTML5 Games: Creating Fun with HTML5, CSS3, and WebGL.

Some sound effects are based on copyrighted material though the files have been modified from the originals.

The music was composed by [Troy Strand](http://www.yellowchordaudio.com/) and reflects the final original score.

# License

All original code (not including libraries) and documentation provided under the MIT License.

# Setup

After cloning the repo, you'll need to get the Node server up and running. Do so by running `npm install`. This will set up the node static file server.

In a browser, to to URL: `localhost:5000`

# The Code

The game is implemented in JavaScript and uses the Sizzle, jQuery, and Modernizr libraries. The code is based on the underlying loading and board/input engine described in [Jacob Seidelin's book: HTML5 Games: Creating Fun with HTML5, CSS3, and WebGL](http://www.wiley.com/WileyCDA/WileyTitle/productCd-1119975085.html)


## Scripts

## Sounds

## Images

## Maps

Map files are provided as raw JSON data.
