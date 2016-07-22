# A Druid's Duel Prototype

This code represents the complete JavaScript-based (web browser) prototype of the turn-based strategy game [A Druid's Duel](http://druidsduel.com). It implements all game rules and allows up to four players to play a complete game on the same browser.

You see what it's like [by trying it out here](https://peaceful-island-82026.herokuapp.com/).

# Project Status

The codebase was completed in August 2013. It has been changed only to load from a basic Node.js server so maps can be served statically instead of directly from the local file system.

This code is fairly verbose and reflects some poor practices (it was my first JS game, btw!). Much of the loading and initial bootstrapping could be done in different and arguably better ways. The code could be refactored down to far fewer lines and files using modern techniques in relatively short order.

# Credits

All game design, programming, and artwork by [Kris Szafranski](https://github.com/kdszafranski). The basic architecture is based on code from Jacob Seidelin's book, HTML5 Games: Creating Fun with HTML5, CSS3, and WebGL.

Some sound effects are based on copyrighted material though the files have been modified from the originals.

The music was composed by [Troy Strand](http://www.yellowchordaudio.com/) and reflects the final original score.

# License

All original code (not including libraries) and documentation provided under the MIT License.

# Setup

After cloning the repo, you'll need to get the Node server up and running.

In a terminal:

1. Run `npm install`
2. Start the server: `npm start`
3. In a browser, go to URL: `localhost:5000`

# The Game

A Druid's Duel is a turn-based strategy game where the objective is to be the only player to own any pieces of land. Each Druid unit can move and attack every turn, in any order you want. Collect land by moving your Druids over it. Land generates Mana on your turn. Use Mana to turn your Druids into their Animal forms, which give temporary movement and attack options.

# The Code

The game is implemented in JavaScript and uses the Sizzle, jQuery, and Modernizr libraries. The code is based on the underlying loading and board/input engine described in [Jacob Seidelin's book: HTML5 Games: Creating Fun with HTML5, CSS3, and WebGL](http://www.wiley.com/WileyCDA/WileyTitle/productCd-1119975085.html)

The game uses the [JavaScript Module Pattern](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html) for organizing the code.

## Canvas Rendering and Events

The in-game view (`screen.game.js`) uses an HTML canvas element (in `index.html`) to do all of the drawing. Meaning that while the UI remains accessible on the page DOM, all of the in-game elements (land, units, markers) are all rendered as static pixels inside the canvas. Mouse click events are registered inside the canvas area. This location is parsed out and the engine determines if a player clicked on a valid space and if so, if they own a unit on that space.

The entry point for this critical logic is in `input.js`,  which takes the canvas's pixel coordinates of the click and determines which game space it translates to.

That game space coordinate is then passed to  `screen.game.js.selectUnit()` for handling the game logic. If it was a valid unit they can control, the engine determines the unit's valid moves and updates the UI with movement markers.

Each click, therefore, forces a re-rendering of the canvas element and each sprite/pixel of the game view.

## Files

Game files are served from `server/public/`.

### Scripts

Contains all of the JavaScript code to run the game. Entry point is in `loader.js`, which loads all of the files in order. Note that the game can run in a standalone mode

* `loader.js` sets a bunch of game variables. It also determines the environment and loads all script and images files into memory in the browser.
* `display.canvas.js` handles setting up the animation loop and draws the actual sprites onto the canvas.
* `input.js` handles keyboard and click events. Clicks are translated from raw pixel coordinates to game spaces on the game board. Only the game space coordinates are used by the rest of the game.
* `board.js` keeps track of the actual array of game spaces and unit data. Each click asks these data structures for the cooresponding land or unit information for the given game space coordinate (x,y). Also loads the map JSON data into these structures.
* `screen.*` handles the events for switching and loading specific game screens such as the main menu, credits, etc.
* `game.players.js` keeps track of the player objects. Players are designated as Blue, Yellow, Red, Black in that order. A 2-playe game, therefore, includes Blue and Yellow. 3-players add in Red, etc. They always take turns in that order. `.cyclePlayer()` handles advancing the turns and changing the current player.

### Sounds

All SFX and music files in MP3 and OGG formats.

### Images

Contains GUI and game artwork sprites. Some are organized in spritesheets.

### Maps

Map files are provided as raw JSON data.
