class main_menu extends Phaser.Scene {
    constructor(){
        super('main_menu');
    }
    preload(){
        this.load.image('background', './assets/pixel_space.jpg');
    }
    create(){
        const background = this.add.image(0, 0, 'background').setOrigin(0,0);

        this.add.text(300, 250, 'Main Menu', { fontSize: '32px', fill: '#fff' });
        let startButton = this.add.text(350, 300, 'Choose Difficulty ', { fontSize: '32px', fill: '#fff' })
        .setInteractive()
        .on('pointerdown', () => {
            this.scene.start('start_scene'); // Transition to the game scene
        });

    // Center the text
    startButton.setOrigin(0.5);
        
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
        // Display "Press Start" text
        this.add.text(300, 250, 'Choose Difficulty', { fontSize: '32px', fill: '#fff' });

        // Create a start button
        let startButton = this.add.text(350, 300, 'Easy', { fontSize: '24px', fill: '#fff' })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('easy_scene'); // Transition to the game scene
            });

        // Center the text
        startButton.setOrigin(0.5);
    }

}

class easy_scene extends Phaser.Scene {
    constructor() {
        super('easy_scene');
        this.ship = null;
        this.lastFired = 0;
        this.lasers = null;
        this.enemy_colours = [
            'shipGreen_manned.png',
            'shipBlue_manned.png',
            'shipPink_manned.png',
            'shipYellow_manned.png'
        ];
    }
    preload() {
        this.load.image('background', './assets/pixel_space.jpg');
        this.load.image('ship', './assets/playerShip2_green.png',{frameWidth: 32, frameHeight: 32});
        this.load.image('laser', './assets/laser.png');
        this.enemy_colours.forEach((enemy_type) => {
            this.load.image(`enemy_${enemy_type}`, `./assets/${enemy_type}`);
        });
        this.load.image('explosion', './assets/laserBlue_burst.png');
    }

    create() {
        const background = this.add.image(0, 0, 'background').setOrigin(0,0);

        // Create the ship sprite and add arcade physics to it
        this.ship = this.physics.add.sprite(385, 900, 'ship');
        this.physics.world.setBounds(0, 0, background.width, background.height);
        this.ship.setCollideWorldBounds(true);

        this.lasers = this.physics.add.group();
        this.enemies = this.physics.add.group();

        this.input.on('pointerdown', this.handleTouch, this);
        this.fireLaser();
        this.time.addEvent({
            delay: 500, // Fire every 500 milliseconds
            callback: this.fireLaser,
            callbackScope: this,
            loop: true // Repeat
        });
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemyShip,
            callbackScope: this,
            loop: true
        });
        this.explosionParticles = this.add.particles('explosion'); // Replace 'particle_key' with your particle image key
        this.explosionEmitter = this.explosionParticles.createEmitter({
            lifespan: 800, // Duration of each particle
            speed: { min: 50, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.7, end: 0 },
            blendMode: 'ADD', // Adjust blend mode as needed
            // Add other particle settings as desired
        });
        this.score = 0;
        this.scoreText = this.add.text(
            this.game.config.width - 20,
            20,
            `Score: ${this.score}`,
            {
                fontFamily: 'Arial',
                fontSize: 24,
                color: '#ffffff'
            }
        );
        this.scoreText.setOrigin(1, 0);
    }

    handleTouch(pointer) {
        // Check if the touch position is on the left or right side of the screen
        if (pointer.x < this.game.config.width / 2) {
            // Move the sprite left
            this.ship.setVelocityX(-300); // Adjust the velocity as needed
        } else {
            // Move the sprite right
            this.ship.setVelocityX(300); // Adjust the velocity as needed
        }
    }
    fireLaser() {
        const laser = this.lasers.create(this.ship.x, this.ship.y - 20, 'laser');
        laser.setVelocityY(-400); // Adjust the velocity as needed
    }
    spawnEnemyShip() {
        const random_colour_loop = Phaser.Math.Between(0, this.enemy_colours.length - 1);
        const random_colour = this.enemy_colours[random_colour_loop];
        const enemy = this.enemies.create(Phaser.Math.Between(0, this.game.config.width), -50, `enemy_${random_colour}`);
        enemy.setScale(0.8);
        enemy.setVelocityY(100);
    }
    laserEnemyCollision(laser, enemy) {
        laser.destroy();
        enemy.destroy();
        this.explosionEmitter.explode(30, enemy.x, enemy.y); // Adjust particle count and position
        this.score += 10; // Adjust score increment as needed
        this.updateScoreText();
    }
    updateScoreText() {
        // Update score text with the current score value
        this.scoreText.setText(`Score: ${this.score}`);

    }
    update(){
        if (!this.input.manager.activePointer.isDown) {
            this.ship.setVelocityX(0);
        }

        this.enemies.getChildren().forEach((enemy) => {
            enemy.setVelocityY(100); // Adjust enemy ship speed as needed

            // If enemy ship reaches bottom, destroy it
            if (enemy.y > this.game.config.height) {
                enemy.destroy();
                this.physics.pause();

                // Display Game Over text
                const gameOverText = this.add.text(
                    this.game.config.width / 2,
                    this.game.config.height / 2 - 25,
                    'Game Over',
                    {
                        fontFamily: 'Arial',
                        fontSize: 48,
                        color: '#ffffff'
                    }
                ).setOrigin(0.5);
                
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
                gameOverText.setOrigin(0.5);
                    
                // Return to the main menu after a delay
                this.time.delayedCall(4000, () => {
                    // Reset the game or go back to the main menu
                    this.scene.start('start_scene'); 
                });
            }
        });

        // Check for collision between lasers and enemies
        this.physics.overlap(this.lasers, this.enemies, this.laserEnemyCollision, null, this);
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
            debug: false,
            plugins: {
                wrap: true // plugin for world wrapping
  
            },
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    scene: [main_menu, start_scene, easy_scene]
};

const game = new Phaser.Game(config);
