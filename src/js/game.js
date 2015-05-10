(function() {
  'use strict';

  function Game() {
    this.player = null;
    this.steeringAngle = 270;
    this.steeringMultiplier = 2;
    this.currentSpeed = 0;
    this.baseSpeed = 0;
    this.backwardSpeed = 0;
    this.skiddingSpeed = 0;
    this.drifting = false;
    this.reduceSpeed = false;
  }

  Game.prototype = {

    create: function() {
      var x = this.game.width / 2,
          y = this.game.height / 2;

      // this.player = this.add.sprite(x, y, 'player');
      // this.player.anchor.setTo(0.5, 0.5);
      // this.input.onDown.add(this.onInputDown, this);

      this.track1c = this.add.image(0, 0, 'track1c');
      this.track1bL = this.add.image(0, 0, 'track1bL');
      this.track1bR = this.add.image(480, 0, 'track1bR');
      this.track1aL = this.add.image(0, 0, 'track1aL');
      this.track1aR = this.add.image(480, 0, 'track1aR');

      this.car = this.add.sprite(x, y, 'cars');
      this.car.cover = this.add.sprite(0, 0, 'cars_cover');
      this.car.anchor.set(0.5);
      this.car.cover.anchor.set(0.5);
      this.car.addChild(this.car.cover);

      // this.car.animations.add('turn', Phaser.Animation.generateFrameNames('car', 0, 23, '', 2), 5, true);
      // this.car.animations.play('turn');
      this.car.frame = this.car.cover.frame = 0;

      this.game.physics.enable(this.car, Phaser.Physics.ARCADE);
      this.car.body.maxVelocity.set(400);

      this.cursors = this.game.input.keyboard.createCursorKeys();
    },

    update: function() {
      // var x, y, cx, cy, dx, dy, angle, scale;

      // x = this.input.position.x;
      // y = this.input.position.y;
      // cx = this.world.centerX;
      // cy = this.world.centerY;

      // angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI);
      // this.player.angle = angle;

      // dx = x - cx;
      // dy = y - cy;
      // scale = Math.sqrt(dx * dx + dy * dy) / 100;

      // this.player.scale.x = scale * 0.6;
      // this.player.scale.y = scale * 0.6;

      if (this.currentSpeed > 250) {
        this.baseSpeed = 0.25;
        this.steeringMultiplier = this.cursors.up.isDown ? 1 : 2;
      } else if (this.currentSpeed > 200) {
        this.baseSpeed = 0.5;
        this.steeringMultiplier = this.cursors.up.isDown ? 1.5 : 2;
      } else if (this.currentSpeed > 150) {
        this.baseSpeed = 0.75;
        this.steeringMultiplier = this.cursors.up.isDown ? 1.5 : 2;
      } else {
        this.baseSpeed = 1;
        this.steeringMultiplier = 2;
      }

      if (this.cursors.left.isDown) {
        if (this.currentSpeed > 0) {
          this.steeringAngle = this.steeringAngle > 0 ? this.steeringAngle - this.steeringMultiplier : 359;
        } else if (this.currentSpeed < 0) {
          this.steeringAngle = this.steeringAngle < 359 ? this.steeringAngle + this.steeringMultiplier : 0;
        }
      } else if (this.cursors.right.isDown) {
        if (this.currentSpeed > 0) {
          this.steeringAngle = this.steeringAngle < 359 ? this.steeringAngle + this.steeringMultiplier : 0;
        } else if (this.currentSpeed < 0) {
          this.steeringAngle = this.steeringAngle > 0 ? this.steeringAngle - this.steeringMultiplier : 359;
        }
      }

      if (this.cursors.left.isDown || this.cursors.right.isDown) {
        var angle = this.steeringAngle-270;
        if (angle < 0){
          angle += 360;
        }

        var frame = Math.floor(angle * (119/7*2) / 360) *7;
        if (frame>119){
          this.car.scale.x = -1;
          frame = 119*2 - frame;

        } else {
          this.car.scale.x = 1;
          if (angle > 90 && frame === 119){
            frame=112;
          }
        }
        this.car.frame = this.car.cover.frame = frame;
      }

      if (this.cursors.up.isDown) {
        if (this.currentSpeed < 300) {
          this.currentSpeed += this.baseSpeed;
        }
        if (this.backwardSpeed < 0) {
          this.backwardSpeed += this.baseSpeed;
        }

        if (this.currentSpeed > 250 && this.skiddingSpeed < 100) {
          this.skiddingSpeed += 1;
        }

        if (this.drifting) {
          if (this.reduceSpeed) {
            this.currentSpeed *= 0.75;
            this.reduceSpeed = false;
          }

          if (this.currentSpeed >= 0) {
            this.game.physics.arcade.velocityFromAngle(this.steeringAngle, this.currentSpeed, this.car.body.velocity);
          } else {
            this.game.physics.arcade.velocityFromAngle(this.steeringAngle, this.backwardSpeed, this.car.body.velocity);
          }
        }
      } else if (this.cursors.down.isDown) {
        if (this.currentSpeed > -100) {
          this.currentSpeed -= 4;
        } else if (this.backwardSpeed > -100) {
          this.backwardSpeed -= 4;
        }
      } else {
        if (this.currentSpeed > 2) {
          this.currentSpeed -= 2;
          this.backwardSpeed -= 2;
        } else if (this.currentSpeed < -2) {
          this.currentSpeed += 2;
          this.backwardSpeed += 2;
        } else {
          this.currentSpeed = 0;
          this.backwardSpeed = 0;
        }
      }

      if (!this.cursors.up.isDown) {
        if (this.skiddingSpeed > 0) {
          this.skiddingSpeed -= 1;
        }

        if (this.drifting) {
          this.reduceSpeed = true;
        }
      }

      if (!this.skiddingSpeed) {
        if (this.currentSpeed >= 0) {
          this.game.physics.arcade.velocityFromAngle(this.steeringAngle, this.currentSpeed, this.car.body.velocity);
        } else {
          this.game.physics.arcade.velocityFromAngle(this.steeringAngle, this.backwardSpeed, this.car.body.velocity);
        }
        this.drifting = false;
      } else if (!this.drifting) {
        this.drifting = true;
      }
    },

    onInputDown: function() {
      this.game.state.start('menu');
    }

  };

  window['drift-runners'] = window['drift-runners'] || {};
  window['drift-runners'].Game = Game;

}());
