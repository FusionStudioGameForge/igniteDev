var igniteData = {
    unlocked: 7, // Start at Level 1
    selectedMode: 'classic'
};

// Updated navigation: Infinity only sees MENU, Story sees MENU and LEVELS
function addNavigationButtons(scene) {
    let menuBtn = scene.add.text(20, 20, 'MENU', { fontSize: '24px', fill: '#fff', backgroundColor: '#333', padding: 5 })
        .setInteractive().setScrollFactor(0).setDepth(100);
    
    menuBtn.on('pointerdown', () => scene.scene.start('MainMenu'));

    // Only show LEVELS button if NOT in Infinity Mode
    if (scene.scene.key !== 'InfinityMode') {
        let levelsBtn = scene.add.text(110, 20, 'LEVELS', { fontSize: '24px', fill: '#fff', backgroundColor: '#333', padding: 5 })
            .setInteractive().setScrollFactor(0).setDepth(100);
        
        levelsBtn.on('pointerdown', () => scene.scene.start('LevelSelect'));
        
        levelsBtn.on('pointerover', () => levelsBtn.setStyle({ fill: '#ff0' }));
        levelsBtn.on('pointerout', () => levelsBtn.setStyle({ fill: '#fff' }));
    }

    menuBtn.on('pointerover', () => menuBtn.setStyle({ fill: '#ff0' }));
    menuBtn.on('pointerout', () => menuBtn.setStyle({ fill: '#fff' }));
}

//  SCENE 1: MAIN MENU 
class MainMenu extends Phaser.Scene {
    constructor() { super('MainMenu'); }
    create() {
        let centerX = this.cameras.main.width / 2;
        let centerY = this.cameras.main.height / 2;
        const logo = document.getElementById('html-logo');
        if(logo) logo.style.display = 'block';

        let buttonStartY = centerY + 100; 
        let playBtn = this.add.text(centerX, buttonStartY, 'PLAY', { 
            fontSize: '64px', fill: '#0f0', fontStyle: 'bold' 
        }).setOrigin(0.5).setInteractive();
        
        playBtn.on('pointerdown', () => {
            if(logo) logo.style.display = 'none';
            if (igniteData.selectedMode === 'infinity') this.scene.start('InfinityMode'); 
            else this.scene.start('LevelSelect'); 
        });

        let modeBtn = this.add.text(centerX, buttonStartY + 120, 'MODE', { 
            fontSize: '64px', fill: '#0ff', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();
        
        modeBtn.on('pointerdown', () => { this.scene.start('ModeSelect'); });

        [playBtn, modeBtn].forEach(btn => {
            btn.on('pointerover', () => btn.setScale(1.1).setStyle({ fill: '#fff' }));
            btn.on('pointerout', () => btn.setScale(1.0).setStyle({ fill: btn.text === 'PLAY' ? '#0f0' : '#0ff' }));
        });
    }
}

//  SCENE 2: MODE SELECTION 
class ModeSelect extends Phaser.Scene {
    constructor() { super('ModeSelect'); }
    create() {
        let centerX = this.cameras.main.width / 2;
        this.add.text(centerX, 150, 'SELECT MODE', { fontSize: '52px', fontStyle: 'bold' }).setOrigin(0.5);
        
        // STORY MODE Button
        let storyBtn = this.add.text(centerX, 300, 'STORY MODE', { fontSize: '42px', fontStyle: 'bold', fill: '#0f0' }).setOrigin(0.5).setInteractive();
        storyBtn.on('pointerdown', () => { 
            igniteData.selectedMode = 'classic'; 
            this.scene.start('LevelSelect'); 
        });
        
        // INFINITY MODE Button
        let infinityBtn = this.add.text(centerX, 450, 'INFINITY MODE', { fontSize: '42px', fontStyle: 'bold', fill: '#0ff' }).setOrigin(0.5).setInteractive();
        infinityBtn.on('pointerdown', () => { 
            igniteData.selectedMode = 'infinity'; 
            this.scene.start('MainMenu'); 
        });

        [storyBtn, infinityBtn].forEach(btn => {
            btn.on('pointerover', () => btn.setScale(1.1).setStyle({ fill: '#fff' }));
            btn.on('pointerout', () => btn.setScale(1.0).setStyle({ fill: btn.text === 'STORY MODE' ? '#0f0' : '#0ff' }));
        });
    }
}

//  SCENE 3: LEVEL SELECTION 
class LevelSelect extends Phaser.Scene {
    constructor() { super('LevelSelect'); }
    create() {
        let centerX = this.cameras.main.width / 2;
        this.add.text(centerX, 80, 'STORY LEVELS', { fontSize: '52px', fontStyle: 'bold' }).setOrigin(0.5);
        let backBtn = this.add.text(40, 40, '< BACK', { fontSize: '32px', fill: '#fff' }).setInteractive();
        backBtn.on('pointerdown', () => this.scene.start('MainMenu'));

        for (let i = 1; i <= 10; i++) {
            let x = (centerX - 300) + ((i-1)%5)*150; 
            let y = i<=5?250:450;
            let isLocked = i > igniteData.unlocked;
            let btnColor = isLocked ? '#444' : '#0f0';
            let btn = this.add.text(x, y, i, { fontSize: '60px', fill: btnColor }).setOrigin(0.5);
            
            if (!isLocked) {
                btn.setInteractive();
                btn.on('pointerdown', () => this.scene.start('Level' + i));
                btn.on('pointerover', () => btn.setScale(1.2));
                btn.on('pointerout', () => btn.setScale(1.0));
            } else {
                this.add.text(x, y + 40, 'LOCKED', { fontSize: '14px', fill: '#666' }).setOrigin(0.5);
            }
        }
    }
}

//  SCENE 4: LEVEL 1 
class Level1 extends Phaser.Scene {
    constructor() { super('Level1'); }
    preload(){
        this.load.image("pip", "/assets/PIP.png")
    }
    create() {
        addNavigationButtons(this);
        let w = this.cameras.main.width; let h = this.cameras.main.height;
        this.platforms = this.physics.add.staticGroup();
        
        // Changed 0x666666 to 0x00ff00 (Bright Green)
        this.platforms.add(this.add.rectangle(w/2, h-30, w, 60,0x666666 ));
        
        this.player = this.physics.add.image(100, h-150, "pip").setScale(0.65, 0.65);
        this.player.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);
        
        this.exitHole = this.add.circle(w-150, h-100, 50, 0x00ff00); 
        this.physics.add.existing(this.exitHole,  true);
        this.physics.add.overlap(this.player, this.exitHole, () => { 
            if(igniteData.unlocked < 2) igniteData.unlocked = 2;
            this.scene.start('LevelSelect'); 
        });
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    update() {
        if (this.cursors.left.isDown) this.player.body.setVelocityX(-400);
        else if (this.cursors.right.isDown) this.player.body.setVelocityX(400);
        else this.player.body.setVelocityX(0);
        if (this.cursors.up.isDown && this.player.body.touching.down) this.player.body.setVelocityY(-700);
    }
}

//  SCENE 5: LEVEL 2 
class Level2 extends Phaser.Scene {
    constructor() { super('Level2'); }
    preload(){
        this.load.image("pip", "/assets/PIP.png")
    }
    create() {
        addNavigationButtons(this);
        let w = this.cameras.main.width;
        let h = this.cameras.main.height;
        
        this.platforms = this.physics.add.staticGroup();
        let ground = this.add.rectangle(w / 2, h - 30, w, 60, 0x666666);
        let wallLeft = this.add.rectangle(200, h - 380, 400, 100, 0xFFFFFF);
        let wallTall = this.add.rectangle(450, 140, 100, 660, 0xFFFFFF);
      
        //let step1 = this.add.rectangle(w / 3, 710, 100, 25, 0xFFFFFF);
        let step2 = this.add.rectangle(w / 2, 600, 100, 25, 0xFFFFFF);
        let step3 = this.add.rectangle(1100, 400, 100, 25, 0xFFFFFF);
        let step4 = this.add.rectangle(1270, 550, 100, 25, 0xFFFFFF);
        let step5 = this.add.rectangle(1350, 300, 100, 25, 0xFFFFFF);
        let fakeStep = this.add.rectangle(1450, 300, 100, 25, 0x7a7a7a);
        let step6 = this.add.rectangle(1550, 300, 100, 25, 0xFFFFFF);
        this.platforms.addMultiple([ground, wallLeft, wallTall,  step2, step3, step4, step5, step6]);
        
        this.player = this.physics.add.image(100, h - 150, "pip").setScale(0.65, 0.65);
        this.player.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);
        
        this.exitHole = this.add.circle(w - 100, 100, 50, 0x00ff00);
        this.physics.add.existing(this.exitHole, true);
        this.physics.add.overlap(this.player, this.exitHole, () => {
            if(igniteData.unlocked < 3) igniteData.unlocked = 3;
            this.scene.start('LevelSelect');
        });
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    update() {
        if (this.cursors.left.isDown) this.player.body.setVelocityX(-350);
        else if (this.cursors.right.isDown) this.player.body.setVelocityX(350);
        else this.player.body.setVelocityX(0);
        if (this.cursors.up.isDown && this.player.body.touching.down) this.player.body.setVelocityY(-650);
    }
}

//  SCENE 6: LEVEL 3 
class Level3 extends Phaser.Scene {
    constructor() { super('Level3'); }
    preload(){
        this.load.image("pip", "/assets/PIP.png")
    }
    create() {
        addNavigationButtons(this);
        let w = this.cameras.main.width; let h = this.cameras.main.height;
        this.platforms = this.physics.add.staticGroup();
        let ground = this.add.rectangle(w/2, h-30, w, 60, 0x666666);
        let goalPlatform = this.add.rectangle(w-100, 220, 200, 30, 0x666666);
        this.platforms.addMultiple([ground, goalPlatform]);
        this.movingPlats = this.physics.add.group({ allowGravity: false });
        const createMovingStep = (name, y, speed) => {
            let p = this.add.rectangle(w/2, y, 250, 30, 0xFFFFFF);
            this.physics.add.existing(p);
            p.body.setImmovable(true);
            p.body.setFriction(1);
            p.startX = w/2; p.speed = speed; p.range = 300;
            p.name = name; 
            this.movingPlats.add(p);
        };
        createMovingStep('movingStep1', h-180, 1.5);
        createMovingStep('movingStep2', h-360, 2);
        
        this.player = this.physics.add.image(100, h-150, "pip").setScale(0.65, 0.65);
        this.player.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, [this.platforms, this.movingPlats]);
        
        this.exitHole = this.add.circle(w-100, 150, 50, 0x00ff00);
        this.physics.add.existing(this.exitHole, true);
        this.physics.add.overlap(this.player, this.exitHole, () => { 
            if(igniteData.unlocked < 4) igniteData.unlocked = 4;
            this.scene.start('LevelSelect'); 
        });
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    update() {
        if (this.cursors.left.isDown) this.player.body.setVelocityX(-400); else if (this.cursors.right.isDown) this.player.body.setVelocityX(400); else this.player.body.setVelocityX(0);
        if (this.cursors.up.isDown && this.player.body.touching.down) this.player.body.setVelocityY(-700);
        this.movingPlats.getChildren().forEach(p => {
            if (p.x >= p.startX + p.range) p.speed = -Math.abs(p.speed);
            if (p.x <= p.startX - p.range) p.speed = Math.abs(p.speed);
            p.x += p.speed;
            p.body.updateFromGameObject();
        });
    }
}

//  SCENE 7: LEVEL 4 
class Level4 extends Phaser.Scene {
    constructor() { super('Level4'); }
    preload(){
        this.load.image("pip", "/assets/PIP.png")
    }
    create() {
        addNavigationButtons(this);
        let w = this.cameras.main.width; let h = this.cameras.main.height;
        this.lava = this.add.rectangle(w / 2, h - 10, w, 20, 0xFF4500);
        this.physics.add.existing(this.lava, true);
        this.platforms = this.physics.add.staticGroup();
        let startGround = this.add.rectangle(w * 0.1, h - 100, 250, 40, 0x666666);
        let endGround = this.add.rectangle(w * 0.9, 150, 250, 40, 0x666666);
        this.platforms.addMultiple([startGround, endGround]);
        this.movingPlats = this.physics.add.group({ allowGravity: false });
        const createStep = (name, x, y, range, speed) => {
            let p = this.add.rectangle(x, y, 150, 30, 0xFFFFFF);
            this.physics.add.existing(p);
            p.body.setImmovable(true);
            p.startX = x; p.range = range; p.baseSpeed = speed; p.currentSpeed = speed; p.isPaused = false;
            p.name = name;
            this.movingPlats.add(p);
        };
        createStep('step1', w*0.3, h-220, 100, 2); 
        createStep('step2', w*0.6, h-340, 150, 3.5); 
        createStep('step3', w*0.4, h-460, 200, 4.5); 
        createStep('step4', w*0.7, h-580, 120, 7);
        
        this.player = this.physics.add.image(w*0.1, h-200, "pip").setScale(0.65, 0.65);
        this.player.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, [this.platforms, this.movingPlats]);
        this.physics.add.overlap(this.player, this.lava, () => { this.scene.start('Level4'); });
        
        this.exitHole = this.add.circle(w * 0.9, 80, 50, 0x000000);
        this.physics.add.existing(this.exitHole, true);
        this.physics.add.overlap(this.player, this.exitHole, () => { 
            if(igniteData.unlocked < 5) igniteData.unlocked = 5;
            this.scene.start('LevelSelect'); 
        });
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    update() {
        if (this.cursors.left.isDown) this.player.body.setVelocityX(-400); else if (this.cursors.right.isDown) this.player.body.setVelocityX(400); else this.player.body.setVelocityX(0);
        if (this.cursors.up.isDown && this.player.body.touching.down) this.player.body.setVelocityY(-700);
        this.movingPlats.getChildren().forEach(p => {
            let stoodOn = p.body.touching.up && this.player.body.touching.down;
            if (stoodOn && !p.isPaused) {
                p.isPaused = true; p.currentSpeed = 0;
                this.time.delayedCall(3000, () => { p.currentSpeed = p.baseSpeed; p.isPaused = false; });
            }
            if (!p.isPaused) {
                if (p.x >= p.startX + p.range) p.baseSpeed = -Math.abs(p.baseSpeed);
                if (p.x <= p.startX - p.range) p.baseSpeed = Math.abs(p.baseSpeed);
                p.currentSpeed = p.baseSpeed;
            }
            p.x += p.currentSpeed; p.body.updateFromGameObject();
        });
    }
}

//  SCENE 8: LEVEL 5 
class Level5 extends Phaser.Scene {
    constructor() { super('Level5'); }
    preload(){
        this.load.image("pip", "/assets/PIP.png")
    }
    create() {
        addNavigationButtons(this);
        let w = this.cameras.main.width; let h = this.cameras.main.height;
        this.lava = this.add.rectangle(w / 2, h - 10, w, 20, 0xFF4500);
        this.physics.add.existing(this.lava, true);
        this.platforms = this.physics.add.staticGroup();
        let startGround = this.add.rectangle(w * 0.1, h - 100, 250, 40, 0x666666); 
        let endGround = this.add.rectangle(w * 0.9, 150, 250, 40, 0x666666); 
        this.platforms.addMultiple([startGround, endGround]);
        this.trapPlats = this.physics.add.group({ allowGravity: false });
        const addTrapStep = (name, x, y, range, speed) => {
            let p = this.add.rectangle(w*x, y, 150, 30, 0xFF4444);
            this.physics.add.existing(p);
            p.body.setImmovable(true); p.startX = p.x; p.startY = y; p.range = range; p.speed = speed; p.isFalling = false;
            p.name = name;
            this.trapPlats.add(p);
        };
        addTrapStep('trap1', 0.3, h-200, 100, 2); 
        addTrapStep('trap2', 0.5, h-300, 150, 3); 
        addTrapStep('trap3', 0.7, h-400, 120, 4); 
        addTrapStep('trap4', 0.8, h-500, 180, 5); 
        
        this.player = this.physics.add.image(w*0.1, h-200, "pip").setScale(0.65, 0.65);
        this.player.body.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, [this.platforms, this.trapPlats]);
        this.physics.add.overlap(this.player, this.lava, () => this.scene.start('Level5'));
        
        this.exitHole = this.add.circle(w * 0.9, 80, 50, 0x000000);
        this.physics.add.existing(this.exitHole, true);
        this.physics.add.overlap(this.player, this.exitHole, () => { 
            if(igniteData.unlocked < 6) igniteData.unlocked = 6;
            this.scene.start('LevelSelect'); 
        });
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    update() {
        if (this.cursors.left.isDown) this.player.body.setVelocityX(-400); else if (this.cursors.right.isDown) this.player.body.setVelocityX(400); else this.player.body.setVelocityX(0);
        if (this.cursors.up.isDown && this.player.body.touching.down) this.player.body.setVelocityY(-700);
        this.trapPlats.getChildren().forEach(p => {
            if (!p.isFalling) {
                if (p.x >= p.startX + p.range) p.speed = -Math.abs(p.speed);
                if (p.x <= p.startX - p.range) p.speed = Math.abs(p.speed);
                p.x += p.speed; p.body.updateFromGameObject();
            }
            if (p.body.touching.up && this.player.body.touching.down && !p.isFalling) {
                p.isFalling = true;
                this.time.delayedCall(400, () => {
                    p.body.setAllowGravity(true); p.body.setImmovable(false);
                    this.time.delayedCall(3000, () => {
                        p.isFalling = false; p.body.setAllowGravity(false); p.body.setImmovable(true);
                        p.body.setVelocity(0); p.y = p.startY; p.x = p.startX;
                    });
                });
            }
        });
    }
}
//  SCENE 9: LEVEL 6

class Level6 extends Phaser.Scene {
    constructor() { 
        super("Level6");
    }

    preload() {
        this.load.image("bg", "/assets/vertical_cave.png");
        this.load.image("pip", "/assets/PIP.png");
    }

    create() {
        this.add.image(800, 400, "bg").setScale(1.5, 1.5);
        let w = 1600;
        let h = 800;
        
        this.platforms = this.physics.add.staticGroup();
        this.hazards = this.physics.add.staticGroup();
        
        this.platforms.add(this.add.rectangle((w / 2) + 9, h - 68, 210, 78, 0x666666).setAlpha(0));
        
        // Player setup
        this.player = this.physics.add.image(w / 2, 2*(h/3), "pip").setScale(0.5, 0.5);
        this.player.body.setCollideWorldBounds(true);
        
        // Collisions
        this.physics.add.collider(this.player, this.platforms);

        // Level Design
        this.platforms.add(this.add.rectangle(600, 400, 20, h - 100, 0x1f1f1f).setAlpha(0));
        this.platforms.add(this.add.rectangle(1000, 400, 20, h - 100, 0x1f1f1f).setAlpha(0));
        this.platforms.add(this.add.rectangle(w / 2, h - 30, w / 2, 5, 0x1f1f1f).setAlpha(0));
        this.platforms.add(this.add.rectangle(900, 200, 300, 25, 0x1f1f1f));
        this.platforms.add(this.add.rectangle(800, 480, 100, 20, 0xFFFFFF))

        // Hazards (Red Spikes/Blocks)
        this.hazards.add(this.add.rectangle(650, 380, 100, 30, 0x880808).setAlpha(0));
        this.hazards.add(this.add.rectangle(640, 640, 60, 30, 0x880808).setAlpha(0));
        this.hazards.add(this.add.rectangle(960, 480, 100, 30, 0x880808).setAlpha(0));
        this.hazards.add(this.add.rectangle(980, 220, 10, 80, 0x880808).setAlpha(0));
        this.hazards.add(this.add.rectangle(960, 220, 100, 30, 0x880808).setAlpha(0));
        this.hazards.add(this.add.rectangle(950, 220, 115, 10, 0x880808).setAlpha(0));
        this.hazards.add(this.add.rectangle(640, 100, 100, 30, 0x880808).setAlpha(0));

        // Death Logic: Restart if player touches red hazards
        this.physics.add.overlap(this.player, this.hazards, () => {
            this.scene.start('Level6');
        }, null, this);

        this.exitHole = this.add.circle(970, 150, 25, 0x00ff00);
        this.physics.add.existing(this.exitHole, true);
        
        this.physics.add.overlap(this.player, this.exitHole, () => { 
            igniteData.unlocked = 7; 
            this.scene.start('LevelSelect'); 
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        // Wall jump state
        this.wallJumpCooldown = 0;
        this.wallSlideTimer = 0; 
        this.lastWall = '';
    }

    update() {
        const body = this.player.body;
        const onGround = body.touching.down || body.blocked.down;
        const onWallLeft = (body.touching.left || body.blocked.left) && !onGround;
        const onWallRight = (body.touching.right || body.blocked.right) && !onGround;
        const onWall = onWallLeft || onWallRight;

        // Track grace timer for wall jumps
        if (onWall) {
            this.wallSlideTimer = 150;
            this.lastWall = onWallLeft ? 'left' : 'right';
        } else {
            this.wallSlideTimer = Math.max(0, this.wallSlideTimer - this.game.loop.delta);
        }

        // Slow fall while wall-sliding
        if (onWall && body.velocity.y > 0) {
            body.setVelocityY(Math.min(body.velocity.y, 120));
        }

        // Horizontal movement
        if (this.wallJumpCooldown <= 0) {
            if (this.cursors.left.isDown) body.setVelocityX(-400);
            else if (this.cursors.right.isDown) body.setVelocityX(400);
            else body.setVelocityX(0);
        } else {
            this.wallJumpCooldown -= this.game.loop.delta;
        }

        // Jump logic
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            if (onGround) {
                body.setVelocityY(-700);
            } else if (onWall || this.wallSlideTimer > 0) {
                body.setVelocityY(-600);
                body.setVelocityX(this.lastWall === 'left' ? 400 : -400);
                this.wallJumpCooldown = 200;
                this.wallSlideTimer = 0; // Reset timer after jumping
            }
        }
    }
}

//  SCENE 10: Level 7
class Level7 extends Phaser.Scene {
    constructor() {
        super("Level7");
    }

    preload() {
        // Using the assets you specified
        this.load.image("bg7", "/assets/Sprite-0003.png");
        this.load.image("pip", "/assets/PIP.png");
    }

    create() {
        // Add navigation (Menu/Levels)
        addNavigationButtons(this);

        let w = this.cameras.main.width;
        let h = this.cameras.main.height;

        // Background
        this.add.image(w / 2, h / 2, "bg7").setScale(7);

        // Platforms
        this.platforms = this.physics.add.staticGroup();
        // Positioned the platform towards the bottom so the player has room to walk
        let plat1 = this.add.rectangle(w / 2, h - 100, w, 40, 0xFFFFFF);
        this.platforms.add(plat1);

        // Player
        this.player = this.physics.add.image(100, h - 200, "pip").setScale(0.65);
        this.player.body.setCollideWorldBounds(true);
        
        // Collisions
        this.physics.add.collider(this.player, this.platforms);

        // Exit Hole (The Goal)
        this.exitHole = this.add.circle(w - 100, h - 180, 50, 0x00ff00);
        this.physics.add.existing(this.exitHole, true);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Movement Logic
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-400);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(400);
        } else {
            this.player.body.setVelocityX(0);
        }

        // Jump Logic
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.body.setVelocityY(-700);
        }

        // Win Condition: Check overlap with Exit Hole
        this.physics.overlap(this.player, this.exitHole, () => {
            if (igniteData.unlocked < 8) {
                igniteData.unlocked = 8; // Unlock the next level
            }
            this.scene.start('LevelSelect');
        });
    }
}

//  SCENE 11: INFINITY MODE 
class InfinityMode extends Phaser.Scene {
    constructor() { super('InfinityMode'); }
    preload(){
        this.load.image("pip", "/assets/PIP.png")
    }
    create() {
        addNavigationButtons(this); // Only MENU button will show here
        let w = this.cameras.main.width; let h = this.cameras.main.height;
        this.cameras.main.setBackgroundColor('#000022');
        this.platforms = this.physics.add.staticGroup();
        this.powerups = this.physics.add.staticGroup();
        let floor = this.add.rectangle(w/2, h-30, w, 60, 0x444444);
        this.physics.add.existing(floor, true); this.platforms.add(floor);
        this.currentY = h - 30; this.gap = 120; this.scrollSpeed = 0.6; this.normalJump = -700;
        this.jumpForce = this.normalJump; this.score = 0; this.boostTimer = 0;
        for (let i = 0; i < 20; i++) { this.spawnNextPlatform(); }
        
        this.player = this.physics.add.image(w/2, h-150, "pip").setScale(0.65, 0.65);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.world.setBounds(0, -1000000, w, 1000000 + h); 
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.overlap(this.player, this.powerups, this.collectBoost, null, this);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.scoreText = this.add.text(30, 30, 'HEIGHT: 0', { fontSize: '36px', fill: '#fff', fontStyle: 'bold' }).setScrollFactor(0);
        this.boostText = this.add.text(w/2, 100, '', { fontSize: '48px', fill: '#ff0', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);
    }
    spawnNextPlatform() {
        let w = this.cameras.main.width;
        this.currentY -= (this.gap + Math.min(this.score / 100, 100));
        let x = Phaser.Math.Between(150, w - 150);
        let plat = this.add.rectangle(x, this.currentY, 180, 30, 0x00ccff);
        this.physics.add.existing(plat, true); this.platforms.add(plat);
        if (Phaser.Math.Between(1, 8) === 1) {
            let boost = this.add.star(x, this.currentY - 50, 5, 15, 30, 0xffff00);
            this.physics.add.existing(boost, true); this.powerups.add(boost);
        }
    }
    collectBoost(player, boost) {
        boost.destroy(); this.jumpForce = -1100; this.boostTimer = 15;
        if (this.boostEvent) this.boostEvent.remove();
        this.boostEvent = this.time.addEvent({ delay: 1000, callback: () => { this.boostTimer--; if (this.boostTimer <= 0) { this.jumpForce = this.normalJump; this.boostText.setText(''); this.boostEvent.remove(); } }, loop: true });
    }
    update() {
        let h = this.cameras.main.height;
        if (this.cursors.left.isDown) this.player.body.setVelocityX(-400); else if (this.cursors.right.isDown) this.player.body.setVelocityX(400); else this.player.body.setVelocityX(0);
        if (this.cursors.up.isDown && this.player.body.touching.down) this.player.body.setVelocityY(this.jumpForce);
        this.cameras.main.scrollY -= this.scrollSpeed; this.scrollSpeed += 0.0005; 
        if (this.currentY > this.cameras.main.scrollY - 1200) this.spawnNextPlatform();
        let currentHeight = Math.abs(Math.floor(this.player.y - (h-150)));
        if (currentHeight > this.score) { this.score = currentHeight; this.scoreText.setText('HEIGHT: ' + this.score); }
        if (this.boostTimer > 0) this.boostText.setText('SUPER JUMP: ' + this.boostTimer + 's');
        if (this.player.y > this.cameras.main.scrollY + h) { if (this.boostEvent) this.boostEvent.remove(); this.scene.start('MainMenu'); }
    }
}

//  CONFIG 
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 1200 } } },
    scene: [MainMenu, ModeSelect, LevelSelect, Level1, Level2, Level3, Level4, Level5,Level6, Level7, InfinityMode]
};
const game = new Phaser.Game(config);