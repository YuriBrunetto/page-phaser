"use strict";

var Page = {};

Page.Init = function() {
    var game = new Phaser.Game(800, 600, Phaser.AUTO, "page", null, true, false);

    var BasicGame = function(game){ };
    BasicGame.Boot = function(game){ };

    // isometric
    var isoGroup, cursorPos;
    // cursors (mouse and keyboard)
    var cursor, cursors;
    // zoomIn/zoomOut
    var worldScale = 1,
        viewRect, boundsPoint;

    BasicGame.Boot.prototype = {
        preload: function(){
            game.load.spritesheet("tile", "assets/tiles/tile.png", 128, 74, 1);
            game.time.advancedTiming = true;

            // add the isometric plugin
            game.plugins.add(new Phaser.Plugin.Isometric(game));
            game.iso.anchor.setTo(0.5, 0.1);

            game.world.setBounds(0, 0, 1024, 600);
            game.physics.startSystem(Phaser.Physics.P2JS);
        },
        create: function(){
            game.canvas.oncontextmenu = function(e) { e.preventDefault(); }

            boundsPoint = new Phaser.Point(0, 0);
            // reusable rect view rectangle
            viewRect = new Phaser.Rectangle(0, 0, game.width, game.height);

            // camera in the middle of the game
            game.camera.x = (game.width * -0.5);
            game.camera.y = (game.height * -0.5);

            // create group of tiles
            isoGroup = game.add.group();

            // spawn the tiles
            this.spawnTiles();

            // 3d position for the cursor
            cursorPos = new Phaser.Plugin.Isometric.Point3();

            // keyboard keys (arrows)
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

            // zoom using the mouse wheel! <3
            game.input.mouse.mouseWheelCallback = mouseWheel;
            function mouseWheel(event) {
                if (game.input.mouse.wheelDelta == -1) worldScale += 0.03;
                else if (game.input.mouse.wheelDelta == 1) worldScale -= 0.03;
            }

            // minimum (0.25) and maximum (2) scale value for the zoom
            worldScale = Phaser.Math.clamp(worldScale, 1, 2);

            // set the zoom!
            game.world.scale.set(worldScale);

            // update the cursor position
            this.game.iso.unproject({
                x: (this.game.input.activePointer.position.x + this.game.camera.x) / this.game.camera.scale.x,
                y: (this.game.input.activePointer.position.y + this.game.camera.y) / this.game.camera.scale.y
            }, cursorPos);

            // click and drag to move the camera
            var active;
            if (this.game.input.activePointer.isDown) {
                if (this.game.origDragPoint) {
                    this.game.camera.x += this.game.origDragPoint.x - this.game.input.activePointer.position.x;
                    this.game.camera.y += this.game.origDragPoint.y - this.game.input.activePointer.position.y;
                }
                // set new drag origin to current position
                this.game.origDragPoint = this.game.input.activePointer.position.clone();
            } else {
                this.game.origDragPoint = null;
            }

            // loop through all the tiles to see if the cursor is hover
            isoGroup.forEach(function(tile){
                var inBounds = tile.isoBounds.containsXY(cursorPos.x, cursorPos.y);

                // if it does, animate it!
                if (!tile.selected && inBounds) {
                    tile.selected = true;
                    tile.tint = 0x86bfda; // color
                    // click
                    game.input.onDown.add(function(){
                        var zz;
                        // checks if tile is already up and updates the isoZ value
                        if (tile.isoZ !== 10) zz = 10;
                        else                  zz = 0;

                        // animate with the defined isoZ value
                        game.add.tween(tile).to({ isoZ: zz }, 100, Phaser.Easing.Quadratic.InOut, true);
                    }, this);

                } else if (tile.selected && !inBounds) {
                    tile.selected = false;
                    tile.tint = 0xffffff;
                    game.input.onDown.add(function(){
                        game.add.tween(tile).to({ isoZ: 0 }, 100, Phaser.Easing.Quadratic.InOut, true);
                    }, this);
                }
            });
        },
        render: function(){
            game.debug.text("fps: " + game.time.fps || "--", 2, 14, "#999");
            game.debug.text("camera x: " + game.camera.x || "--", 2, 36, "#999");
            game.debug.text("camera y: " + game.camera.y || "--", 2, 58, "#999");
        },
        spawnTiles: function(){
            var tile,
                separation = 70;
            for (var xx = 0; xx < 480; xx += separation) {
                for (var yy = 0; yy < 480; yy += separation) {
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
