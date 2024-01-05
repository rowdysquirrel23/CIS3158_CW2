class main_menu extends Phaser.Scene {
    constructor(){
        super('main_menu');
    }
    preload(){
        this.load.image('background', './assets/pixel_space.jpg');
        this.load.image('instructions', './assets/instructions.jpg');
    }
    create(){
        const background = this.add.image(0, 0, 'background').setOrigin(0,0);

        this.add.text(300, 250, 'Main Menu', { fontSize: '32pt', fill: '#DE3163', fontStyle: 'bold'});
        let start_button = this.add.text(425, 400, 'Choose Difficulty ', { fontSize: '24pt', fill: '#fff', fontStyle: 'bold' })
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('start_scene'); // Takes users to screen to change difficulty
        });
        this.add.image(400, 700, 'instructions');

    // Center the text
    start_button.setOrigin(0.5);
        
    }
}

class start_scene extends Phaser.Scene {

    constructor() {
        super('start_scene');
    }
    preload(){
        this.load.image('background', './assets/pixel_space.jpg');
    }
    create() {
        const background = this.add.image(0, 0, 'background').setOrigin(0,0);
        // Display Start text
        this.add.text(200, 225, 'Choose Difficulty', { fontSize: '32pt', fill: '#DE3163', fontStyle: 'bold' });

        // Start button that changes the difficulty of the game
        let easy_button = this.add.text(350, 300, 'Easy', { fontSize: '24pt', fill: '#fff', fontStyle: 'bold' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('game_scene', { difficulty: 'easy' }); 
            });
        // Medium Difficulty
        let medium_button = this.add.text(350, 400, 'Medium', { fontSize: '24pt', fill: '#fff', fontStyle: 'bold' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('game_scene', { difficulty: 'medium' }); 
            });
        // Hard Difficulty
        let hard_button = this.add.text(350, 500, 'Hard', { fontSize: '24pt', fill: '#fff', fontStyle: 'bold' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('game_scene', { difficulty: 'hard' }); 
            });
    }

}

class game_scene extends Phaser.Scene {
    constructor() {
        super('game_scene');
        this.ship = null;
        this.lastFired = 0;
        this.lasers = null;
        // Creates an array of the different colour aliens which can then be looped through to spawn a variety of colours
        this.enemy_colours = [
            'shipGreen_manned.png',
            'shipBlue_manned.png',
            'shipPink_manned.png',
            'shipYellow_manned.png'
        ];
    }
    set_difficulty(data) { // sets difficulty as what was chosen by the user
        this.difficulty = data.difficulty;
    }
    preload() {
        // Load the images required for the game to be used in the create function
        this.load.image('background', './assets/pixel_space.jpg');
        this.load.image('ship', './assets/playerShip2_green.png',{frameWidth: 32, frameHeight: 32});
        this.load.image('laser', './assets/laser.png');
        this.enemy_colours.forEach((enemy_type) => {
            this.load.image(`enemy_${enemy_type}`, `./assets/${enemy_type}`);
        });
        this.load.image('explosion', './assets/laserBlue_burst.png');
        this.load.image('coin','./assets/coin_01.png');
    }

    create(data) {
        // Loads game background
        const background = this.add.image(0, 0, 'background').setOrigin(0,0);
        // Create the ship sprite and add arcade physics to it
        this.ship = this.physics.add.sprite(385, 900, 'ship');
        this.physics.world.setBounds(0, 0, background.width, background.height);
        this.ship.setCollideWorldBounds(true);
        // adds physics for lasers and enemies
        this.lasers = this.physics.add.group();
        this.enemies = this.physics.add.group();
        // Handles the shooting of the lasers
        this.input.on('pointerdown', this.sprite_movement, this);
        this.fire_laser();
        this.time.addEvent({
            delay: 500, // Fire every 500 ms
            callback: this.fire_laser,
            callbackScope: this,
            loop: true // Makes the ship continuosly shoot lasers
        });
        this.time.addEvent({
            delay: 2000,
            callback: this.spawn_enemy,
            callbackScope: this,
            loop: true
        });
        this.explosion_effect = this.add.particles('explosion'); 
        this.explosion_emitter = this.explosion_effect.createEmitter({
            lifespan: 800, //How long the explosions last for
            speed: { min: 50, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.7, end: 0 },
            blendMode: 'ADD',
        });
        // sets the score as 0 then adds 10 eveery time an enemy is destroyed
        this.score = 0;
        this.score_text = this.add.text(
            this.game.config.width - 20,
            20,
            `Score: ${this.score}`,
            {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#ffffff'
            }
        );
        this.score_text.setOrigin(1, 0);
        // changes the difficulty of the game based on which one is being selected
        this.set_difficulty(data);
    }

    sprite_movement(pointer) {
        // Checks which side of the screen is being touched by the pointer
        if (pointer.x < this.game.config.width / 2) {
            // Move the ship left
            this.ship.setVelocityX(-300); 
        } else {
            // Move the ship right
            this.ship.setVelocityX(300); 
        }
    }
    fire_laser() {
        // Shoots the lasers out of the ship
        const laser = this.lasers.create(this.ship.x, this.ship.y - 20, 'laser');
        laser.setVelocityY(-400); 
    }
    spawn_enemy() {
        // loops through the colours of alien ships
        const random_colour_loop = Phaser.Math.Between(0, this.enemy_colours.length - 1);
        const random_colour = this.enemy_colours[random_colour_loop];
        //spawns enemy ships in whilst looping through the colours of ships
        const enemy = this.enemies.create(Phaser.Math.Between(15, this.game.config.width), -100, `enemy_${random_colour}`);
        enemy.setScale(0.8);
        switch (this.difficulty) {
            // When difficulty is changed, the velocity of the ships is adjusted
            case 'easy':
                enemy.setVelocityY(100);
                break;
            case 'medium':
                enemy.setVelocityY(250);
                break;
            case 'hard':
                enemy.setVelocityY(400);
                break;
            default:
                // Set default values or any additional difficulty settings
                enemy.setVelocityY(100);
                break;
        }
    }
    laser_collision(laser, enemy) {
        laser.destroy();
        enemy.destroy();
        this.explosion_emitter.explode(30, enemy.x, enemy.y); // Adjust particle count and position
        this.score += 10; // Adjust score increment as needed
        this.update_score();
    }
    update_score() {
        // Update score text with the current score value
        this.score_text.setText(`Score: ${this.score}`);

    }
    check_achievements() {
        // Achievement is unlocked when user hits a certian score
        if (this.score === 100) {
            this.show_achievement('Achievement', 'Reach 100 points!');
        }
        else if (this.score === 250) {
            this.show_achievement('Achievement', 'Reach 250 points!');
        }
        else if (this.score === 500) {
            this.show_achievement('Achievement', 'Reach 500 points!');
        }
        else if (this.score === 1000) {
            this.show_achievement('Achievement', 'Reach 1000 points!');
        }
    }
    show_achievement(title, description) {
        // displays the achievment icon and text below it
        const achievement_coin = this.add.sprite(625 , 150, 'coin');
        const achievement_text = this.add.text(470, 220, `${title}: ${description}`, {fontSize: '14pt' , color: '#000000'});
        // after 3 seconds, the achievment is removed from the screen
        this.time.delayedCall(3000, () => {
            achievement_coin.destroy();
            achievement_text.destroy();
        });
    }
    update(){
        //if the screen isnt being touched, do not move sprite
        if (!this.input.manager.activePointer.isDown) {
            this.ship.setVelocityX(0);
        }

        this.enemies.getChildren().forEach((enemy) => {

            // If enemy ship reaches bottom, destroy it
            if (enemy.y > this.game.config.height) {
                enemy.destroy();
                this.physics.pause();

                // Display Game Over text
                const game_over = this.add.text(
                    this.game.config.width / 2,
                    this.game.config.height / 2 - 25,
                    'Game Over',
                    {
                        fontFamily: 'Arial',
                        fontSize: 48,
                        color: '#ffffff'
                    }
                ).setOrigin(0.5);
                // Adds the text when game over
                this.add.text(
                    this.game.config.width / 2,
                    this.game.config.height / 2 + 25,
                    'Returning to Main Menu',
                    {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        color: '#ffffff'
                    }
                ).setOrigin(0.5);
                game_over.setOrigin(0.5);
                    
                // Return to the main menu after a delay
                this.time.delayedCall(4000, () => {
                    this.scene.start('main_menu'); 
                });
            }
        });
        this.check_achievements();
        // Check for collision between lasers and enemies
        this.physics.overlap(this.lasers, this.enemies, this.laser_collision, null, this);
    }
}


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 1024,
    backgroundColor: '#2d2d2d',
    parent: 'game-container',
    physics: {
        default: 'arcade',
        matter: {
            debug: true,
            plugins: {
                wrap: true // plugin for world wrapping
  
            },
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    scene: [main_menu, start_scene, game_scene]
};

const game = new Phaser.Game(config);
