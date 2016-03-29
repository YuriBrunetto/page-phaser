"use strict";

var Page = {};

Page.Init = function() {
    var game = new Phaser.Game(800, 600, Phaser.AUTO, "page", null, true, false);

    var BasicGame = function(game){ };
    BasicGame.Boot = function(game){ };

    var isoGroup, cursorPos, cursor, cursors;

    BasicGame.Boot.prototype = {
        preload: function(){
            game.load.image("tile", "assets/tiles/tile.png");
            game.time.advancedTiming = true;

            // add the isometric plugin
            game.plugins.add(new Phaser.Plugin.Isometric(game));
            game.iso.anchor.setTo(0.5, 0.1);

            game.world.setBounds(0, 0, 1024, 600);
            game.physics.startSystem(Phaser.Physics.P2JS);
        },
        create: function(){
            // create group of tiles
            isoGroup = game.add.group();

            // spawn the tiles
            this.spawnTiles();

            // 3d position for the cursor
            cursorPos = new Phaser.Plugin.Isometric.Point3();

            // keyboard keys
            cursors = game.input.keyboard.createCursorKeys();
        },
        update: function(){
            // move the camera
            if (cursors.down.isDown || game.input.keyboard.isDown(Phaser.Keyboard.S)) {
                game.camera.y += 10;
            } else if (cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W)) {
                game.camera.y -= 10;
            }

            if (cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A)) {
                game.camera.x -= 10;
            } else if (cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D)) {
                game.camera.x += 10;
            }

            // update the cursor position. it's important to understand that screen-to-isometric projection means you have to
            // specify a z position manually, as this cannot be easily determined from the 2D pointer position without extra
            // trickery. by default, the z position is 0 if not set.
            game.iso.unproject(game.input.activePointer.position, cursorPos);

            // loop through all the tiles to see if the cursor is hover
            isoGroup.forEach(function(tile){
                var inBounds = tile.isoBounds.containsXY(cursorPos.x, cursorPos.y);

                // if it does, animate it!
                if (!tile.selected && inBounds) {
                    tile.selected = true;
                    tile.tint = 0x86bfda; // color
                    game.add.tween(tile).to({ isoZ:4 }, 200, Phaser.Easing.Quadratic.InOut, true);
                } else if (tile.selected && !inBounds) {
                    tile.selected = false;
                    tile.tint = 0xffffff;
                    game.add.tween(tile).to({ isoZ:0 }, 200, Phaser.Easing.Quadratic.InOut, true);
                }
            });
        },
        render: function(){
            game.debug.text("camera x: " + game.camera.x || "--", 2, 36, "#fff");
            game.debug.text("fps: " + game.time.fps || "--", 2, 14, "#fff");
        },
        spawnTiles: function(){
            var tile;
            for (var xx = 0; xx < 480; xx += 38) {
                for (var yy = 0; yy < 480; yy += 38) {
                    tile = game.add.isoSprite(xx, yy, 0, "tile", 0, isoGroup);
                    tile.anchor.setTo(0.5, 0);
                }
            }
        }
    };

    game.state.add("Boot", BasicGame.Boot);
    game.state.start("Boot");
};

Page.Init();
