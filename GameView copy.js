class GameView {
  constructor() {
    this.app = new PIXI.Application({
      width: 1200,
      height: 800,
      backgroundColor: 0x000000
    });
    this.reelViews = [];
    this.uiContainer = new PIXI.Container();
    this.mapContainer = new PIXI.Container();
    this.symbolContainer = new PIXI.Container();
    this.bonusContainer = new PIXI.Container();
    this.transitionContainer = new PIXI.Container();
    this.popupContainer = new PIXI.Container();
    this.app.stage.addChild(this.mapContainer, this.symbolContainer, this.bonusContainer, this.uiContainer, this.transitionContainer, this.popupContainer);
    this.themeSelector = null;
    this.heroProgressBar = null;
    this.enemyProgressBar = null;
    this.heroProgressText = null;
    this.enemyProgressText = null;
    this.winText = null;
    this.bonusText = null;
    this.bonusTotalWinText = null;
    this.bonusWinText = null;
    this.spinButton = null;
    this.bonusButton = null;
    this.spinSprite = null;
    this.spinAnimation = null;
    this.heroSprite = null;
    this.zombieSprites = new Map();
    this.zombieHealthBars = new Map();
    this.bulletSprites = new Map();
    this.bulletTexture = null;
    this.ammoText = null;
    this.isBonusSetupComplete = false;
    this.heroTargetRotation = 0;
    this.zombieSpineData = null;
    this.heroSpineData = null;
    this.zombieMoveSpineData = null; // Added for ZombieMoveAnim
    this.heroMoveSpineData = null;   // Added for HeroMoveAnim
    this.heroFireSpineData = null;   // Added for HeroFireAnim
    this.bonusBgTexture = null;
  }

  async init() {
    document.body.appendChild(this.app.view);
    await this.loadFonts();
    await this.loadSpinAssets();
    this.setupProgressBars();
    this.setupWinDisplay();
    this.setupBonusDisplay();
    this.setupBonusTotalWinDisplay();
    this.setupBonusWinDisplay();
  }

  async loadFonts() {
    console.log('Loading font: Arial via Google Fonts');
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Arial&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return new Promise((resolve) => {
      link.onload = () => {
        console.log('Arial font stylesheet loaded');
        resolve();
      };
      link.onerror = () => {
        console.warn('Failed to load Arial font stylesheet, using fallback');
        resolve();
      };
      setTimeout(() => {
        console.log('Font loading timeout, proceeding with fallback');
        resolve();
      }, 2000);
    });
  }

  async loadSpinAssets() {
    try {
      const spinAtlas = await PIXI.Assets.load('assets/mobilePanel.json');
      if (spinAtlas.textures && spinAtlas.textures['spinBtn_normal']) {
        this.spinSprite = new PIXI.Sprite(spinAtlas.textures['spinBtn_normal']);
        console.log('Loaded spin button sprite: spinBtn_normal');
      } else {
        console.warn('Spin button texture not found in mobilePanel.json');
        this.spinSprite = new PIXI.Sprite();
      }

      const spineData = await PIXI.Assets.load({
        src: 'animations/spin_animation.json',
        data: { type: 'spine' }
      });
      if (spineData.spineData && spineData.spineData.animations.some(anim => anim.name === 'spin')) {
        this.spinAnimation = new PIXI.spine.Spine(spineData.spineData);
        this.spinAnimation.state.setAnimation(0, 'spin', true);
        this.spinAnimation.autoUpdate = true;
        this.spinAnimation.visible = false;
        console.log('Loaded spin button animation: spin');
      } else {
        console.warn('Spin animation not found in spin_animation.json');
        this.spinAnimation = new PIXI.Container();
      }
    } catch (error) {
      console.error('Failed to load spin button assets:', error);
      this.spinSprite = new PIXI.Sprite();
      this.spinAnimation = new PIXI.Container();
    }
  }

  async loadBonusAssets() {
    this.zombieSpineData = null;
    this.heroSpineData = null;
    this.zombieMoveSpineData = null;
    this.heroMoveSpineData = null;
    this.heroFireSpineData = null;
    this.bonusBgTexture = null;
    this.bulletTexture = null;

    try {
      const bgAtlas = await PIXI.Assets.load('assets/BonusBg.json');
      if (bgAtlas.textures && bgAtlas.textures['BonusBg']) {
        this.bonusBgTexture = bgAtlas.textures['BonusBg'];
        console.log('Loaded BonusBg texture from BonusBg.json');
      } else {
        console.warn('BonusBg texture not found in BonusBg.json');
      }
    } catch (error) {
      console.warn('Failed to load BonusBg.json, using solid background:', error);
    }

    try {
      const bonusAtlas = await PIXI.Assets.load('bonusAssets.json');
      if (bonusAtlas.textures && bonusAtlas.textures['bullet']) {
        this.bulletTexture = bonusAtlas.textures['bullet'];
        console.log('Loaded bullet texture from bonusAssets.json');
      } else {
        console.warn('Bullet texture not found in bonusAssets.json, using fallback');
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF);
        graphics.drawRect(0, 0, 10, 5);
        graphics.endFill();
        this.bulletTexture = this.app.renderer.generateTexture(graphics);
      }
    } catch (error) {
      console.warn('Failed to load bullet texture, using fallback:', error);
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0xFFFFFF);
      graphics.drawRect(0, 0, 10, 5);
      graphics.endFill();
      this.bulletTexture = this.app.renderer.generateTexture(graphics);
    }

    try {
      const zombieSpine = await PIXI.Assets.load({
        src: 'animations/ZombieAnim.json',
        data: { type: 'spine' }
      });
      if (
        zombieSpine.spineData &&
        zombieSpine.spineData.animations.some(anim => anim.name === 'ZombieGrow') &&
        zombieSpine.spineData.animations.some(anim => anim.name === 'ZombieMoving')
      ) {
        this.zombieSpineData = zombieSpine.spineData;
        console.log('Loaded ZombieAnim spine data with ZombieGrow and ZombieMoving animations');
      } else {
        console.warn('ZombieAnim spine data missing required animations (ZombieGrow or ZombieMoving)');
      }
    } catch (error) {
      console.warn('Failed to load ZombieAnim.json, falling back to sprite:', error);
    }

    try {
      const zombieMoveSpine = await PIXI.Assets.load({
        src: 'animations/ZombieMoveAnim.json',
        data: { type: 'spine' }
      });
      if (zombieMoveSpine.spineData) {
        this.zombieMoveSpineData = zombieMoveSpine.spineData;
        const availableAnimations = zombieMoveSpine.spineData.animations.map(anim => anim.name);
        console.log(`Loaded ZombieMoveAnim spine data with animations: ${availableAnimations.join(', ')}`);
      } else {
        console.warn('ZombieMoveAnim spine data not loaded');
      }
    } catch (error) {
      console.warn('Failed to load ZombieMoveAnim.json:', error);
    }

    try {
      const heroSpine = await PIXI.Assets.load({
        src: 'animations/HeroAnim.json',
        data: { type: 'spine' }
      });
      if (
        heroSpine.spineData &&
        heroSpine.spineData.animations.some(anim => anim.name === 'HeroFiring')
      ) {
        this.heroSpineData = heroSpine.spineData;
        console.log('Loaded HeroAnim spine data with HeroFiring animation');
      } else {
        console.warn('HeroAnim spine data missing required animation (HeroFiring)');
      }
    } catch (error) {
      console.warn('Failed to load HeroAnim.json, falling back to sprite:', error);
    }

    try {
      const heroMoveSpine = await PIXI.Assets.load({
        src: 'animations/HeroMoveAnim.json',
        data: { type: 'spine' }
      });
      if (heroMoveSpine.spineData) {
        this.heroMoveSpineData = heroMoveSpine.spineData;
        const availableAnimations = heroMoveSpine.spineData.animations.map(anim => anim.name);
        console.log(`Loaded HeroMoveAnim spine data with animations: ${availableAnimations.join(', ')}`);
      } else {
        console.warn('HeroMoveAnim spine data not loaded');
      }
    } catch (error) {
      console.warn('Failed to load HeroMoveAnim.json:', error);
    }

    try {
      const heroFireSpine = await PIXI.Assets.load({
        src: 'animations/HeroFireAnim.json',
        data: { type: 'spine' }
      });
      if (heroFireSpine.spineData) {
        this.heroFireSpineData = heroFireSpine.spineData;
        const availableAnimations = heroFireSpine.spineData.animations.map(anim => anim.name);
        console.log(`Loaded HeroFireAnim spine data with animations: ${availableAnimations.join(', ')}`);
      } else {
        console.warn('HeroFireAnim spine data not loaded');
      }
    } catch (error) {
      console.warn('Failed to load HeroFireAnim.json:', error);
    }
  }

  setupProgressBars() {
    this.heroProgressBar = new PIXI.Graphics();
    this.heroProgressBar.beginFill(0x00FF00);
    this.heroProgressBar.drawRect(20, 100, 50, 600);
    this.heroProgressBar.endFill();
    this.heroProgressBar.scale.y = 0;
    this.uiContainer.addChild(this.heroProgressBar);

    this.heroProgressText = new PIXI.Text('0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      fill: 0xFFFFFF,
      align: 'center'
    });
    this.heroProgressText.x = 45;
    this.heroProgressText.y = 80;
    this.heroProgressText.anchor.set(0.5);
    this.uiContainer.addChild(this.heroProgressText);

    this.enemyProgressBar = new PIXI.Graphics();
    this.enemyProgressBar.beginFill(0xFF0000);
    this.enemyProgressBar.drawRect(1130, 100, 50, 600);
    this.enemyProgressBar.endFill();
    this.enemyProgressBar.scale.y = 0;
    this.uiContainer.addChild(this.enemyProgressBar);

    this.enemyProgressText = new PIXI.Text('0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      fill: 0xFFFFFF,
      align: 'center'
    });
    this.enemyProgressText.x = 1155;
    this.enemyProgressText.y = 80;
    this.enemyProgressText.anchor.set(0.5);
    this.uiContainer.addChild(this.enemyProgressText);
  }

  setupWinDisplay() {
    this.winText = new PIXI.Text('', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 50,
      fill: 0xFFFF00,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 4
    });
    this.winText.x = 600;
    this.winText.y = 400;
    this.winText.anchor.set(0.5);
    this.winText.visible = false;
    this.uiContainer.addChild(this.winText);
  }

  setupBonusDisplay() {
    this.bonusText = new PIXI.Text('', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 30,
      fill: 0xFFFFFF,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 2
    });
    this.bonusText.x = 600;
    this.bonusText.y = 50;
    this.bonusText.anchor.set(0.5);
    this.bonusText.visible = false;
    this.uiContainer.addChild(this.bonusText);
  }

  setupBonusTotalWinDisplay() {
    this.bonusTotalWinText = new PIXI.Text('', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 60,
      fill: 0xFFD700,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 4
    });
    this.bonusTotalWinText.x = 600;
    this.bonusTotalWinText.y = 400;
    this.bonusTotalWinText.anchor.set(0.5);
    this.bonusTotalWinText.visible = false;
    this.uiContainer.addChild(this.bonusTotalWinText);
  }

  setupBonusWinDisplay() {
    this.bonusWinText = new PIXI.Text('Bonus Win: 0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 30,
      fill: 0xFFD700,
      align: 'right',
      stroke: 0x000000,
      strokeThickness: 2
    });
    this.bonusWinText.x = 1180;
    this.bonusWinText.y = 20;
    this.bonusWinText.anchor.set(1, 0);
    this.bonusWinText.visible = false;
    this.bonusContainer.addChild(this.bonusWinText);
  }

  async setupBonusBattle(initialAmmo, heroTexture, zombieTexture, onInputCallback) {
    this.isBonusSetupComplete = false;
    this.bonusContainer.removeChildren();
    this.mapContainer.visible = false;
    this.symbolContainer.visible = false;

    await this.loadBonusAssets();

    let background;
    if (this.bonusBgTexture && this.bonusBgTexture.valid) {
      background = new PIXI.Sprite(this.bonusBgTexture);
      background.width = 1200;
      background.height = 800;
      console.log('Using BonusBg sprite as bonus background');
    } else {
      background = new PIXI.Graphics();
      background.beginFill(0x333333);
      background.drawRect(0, 0, 1200, 800);
      background.endFill();
      console.warn('Using solid background due to missing BonusBg texture');
    }
    this.bonusContainer.addChild(background);

    // Setup hero sprite
    let heroSpineUsed = false;
    if (this.heroMoveSpineData || this.heroFireSpineData) {
      // Use HeroMoveAnim or HeroFireAnim if available
      const spineData = this.heroFireSpineData || this.heroMoveSpineData;
      this.heroSprite = new PIXI.spine.Spine(spineData);
      this.heroSprite.autoUpdate = true;

      // Check for firing animation first
      if (this.heroFireSpineData && this.heroFireSpineData.animations.some(anim => anim.name === 'HeroFiring')) {
        this.heroSprite.state.setAnimation(0, 'HeroFiring', true);
        console.log('Using HeroFiring animation from HeroFireAnim');
        heroSpineUsed = true;
      } else if (this.heroMoveSpineData && this.heroMoveSpineData.animations.some(anim => anim.name === 'HeroRight')) {
        // Default to HeroRight if available
        this.heroSprite.state.setAnimation(0, 'HeroRight', true);
        console.log('Using HeroRight animation from HeroMoveAnim as default');
        heroSpineUsed = true;
      } else {
        // Fallback to any available animation
        const availableAnimations = spineData.animations.map(anim => anim.name);
        if (availableAnimations.length > 0) {
          this.heroSprite.state.setAnimation(0, availableAnimations[0], true);
          console.log(`Using fallback animation ${availableAnimations[0]} for hero`);
          heroSpineUsed = true;
        }
      }
    } else if (this.heroSpineData && this.heroSpineData.animations.some(anim => anim.name === 'HeroFiring')) {
      // Fallback to old HeroAnim
      this.heroSprite = new PIXI.spine.Spine(this.heroSpineData);
      this.heroSprite.state.setAnimation(0, 'HeroFiring', true);
      this.heroSprite.autoUpdate = true;
      console.log('Using HeroFiring animation from HeroAnim');
      heroSpineUsed = true;
    }

    if (!heroSpineUsed) {
      // Fallback to static sprite
      if (heroTexture && heroTexture.valid) {
        this.heroSprite = new PIXI.Sprite(heroTexture);
        console.log('Using hero sprite from bonusAssets.json');
      } else {
        this.heroSprite = new PIXI.Sprite();
        console.warn('No valid hero texture provided, using empty sprite');
      }
    }

    this.heroSprite.anchor.set(0.5);
    this.heroSprite.x = 600;
    this.heroSprite.y = 700;
    this.heroSprite.width = 80;
    this.heroSprite.height = 80;
    this.heroSprite.rotation = 0;
    this.heroSprite.interactive = true;
    this.heroSprite.buttonMode = true;
    this.bonusContainer.addChild(this.heroSprite);

    let isDragging = false;
    this.heroSprite.on('pointerdown', () => {
      isDragging = true;
    });
    this.heroSprite.on('pointerup', () => {
      isDragging = false;
    });
    this.heroSprite.on('pointerupoutside', () => {
      isDragging = false;
    });

    this.ammoText = new PIXI.Text(`Ammo: ${initialAmmo}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: 30,
      fill: 0xFFFFFF,
      align: 'left',
      stroke: 0x000000,
      strokeThickness: 2
    });
    this.ammoText.x = 20;
    this.ammoText.y = 20;
    this.bonusContainer.addChild(this.ammoText);

    this.setupBonusWinDisplay();

    this.bonusContainer.interactive = true;
    let isFiring = false;
    this.bonusContainer.on('pointerdown', () => {
      isFiring = true;
    });
    this.bonusContainer.on('pointerup', () => {
      isFiring = false;
    });
    this.bonusContainer.on('pointerupoutside', () => {
      isFiring = false;
    });
    this.bonusContainer.on('pointermove', (event) => {
      const pos = event.data.getLocalPosition(this.bonusContainer);
      onInputCallback(pos.x, pos.y, isFiring, isDragging);
    });
    this.bonusContainer.on('pointerout', () => {
      onInputCallback(null, null, isFiring, isDragging);
      this.heroTargetRotation = 0;
    });

    this.zombieSprites.clear();
    this.zombieHealthBars.clear();
    this.bulletSprites.clear();
    this.isBonusSetupComplete = true;
    console.log('Bonus battle setup complete');
  }

  updateBonusBattle(hero, zombies, zombieTexture, bonusTotalWin, bullets) {
    if (!this.isBonusSetupComplete || !this.heroSprite || !hero) {
      console.warn('Cannot update bonus battle: Setup incomplete, heroSprite or hero data missing');
      return;
    }

    // Track previous hero position for movement detection
    const prevHeroX = this.heroSprite.x;
    const prevHeroY = this.heroSprite.y;

    this.heroSprite.x = hero.x;
    this.heroSprite.y = hero.y;

    if (this.bonusWinText) {
      this.bonusWinText.text = `Bonus Win: ${bonusTotalWin}`;
      this.bonusWinText.visible = true;
    }

    // Update hero animation based on movement or firing
    if (this.heroMoveSpineData || this.heroFireSpineData) {
      let animationSet = false;

      // Check if hero is firing
      if (hero.isFiring && this.heroFireSpineData && this.heroFireSpineData.animations.some(anim => anim.name === 'HeroFiring')) {
        if (this.heroSprite.state.getCurrent(0)?.animation.name !== 'HeroFiring') {
          this.heroSprite.state.setAnimation(0, 'HeroFiring', true);
          console.log('Playing HeroFiring animation');
        }
        animationSet = true;
      } else {
        // Determine movement direction
        const dx = hero.x - prevHeroX;
        const dy = hero.y - prevHeroY;
        const threshold = 1; // Small threshold to detect movement
        if (this.heroMoveSpineData && (Math.abs(dx) > threshold || Math.abs(dy) > threshold)) {
          let direction = null;
          if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal movement
            direction = dx > 0 ? 'HeroRight' : 'HeroLeft';
          } else {
            // Vertical movement
            direction = dy > 0 ? 'HeroDown' : 'HeroUp';
          }

          if (this.heroMoveSpineData.animations.some(anim => anim.name === direction)) {
            if (this.heroSprite.state.getCurrent(0)?.animation.name !== direction) {
              this.heroSprite.state.setAnimation(0, direction, true);
              console.log(`Playing ${direction} animation`);
            }
            animationSet = true;
          }
        }
      }

      // Fallback if no appropriate animation was set
      if (!animationSet) {
        if (this.heroMoveSpineData && this.heroMoveSpineData.animations.some(anim => anim.name === 'HeroRight')) {
          if (this.heroSprite.state.getCurrent(0)?.animation.name !== 'HeroRight') {
            this.heroSprite.state.setAnimation(0, 'HeroRight', true);
            console.log('Falling back to HeroRight animation');
          }
        } else if (this.heroSpineData && this.heroSpineData.animations.some(anim => anim.name === 'HeroFiring')) {
          if (this.heroSprite.state.getCurrent(0)?.animation.name !== 'HeroFiring') {
            this.heroSprite.state.setAnimation(0, 'HeroFiring', true);
            console.log('Falling back to HeroFiring from HeroAnim');
          }
        }
      }
    }

    // Update hero rotation
    if (hero.aimTarget) {
      const dx = hero.aimTarget.x - hero.x;
      const dy = hero.aimTarget.y - hero.y;
      this.heroTargetRotation = Math.atan2(dy, dx) + Math.PI / 2;
      const rotationSpeed = 0.1;
      const deltaRotation = this.heroTargetRotation - this.heroSprite.rotation;
      this.heroSprite.rotation += deltaRotation * rotationSpeed;
    }

    const activeZombies = new Set(zombies);
    for (let [zombie, sprite] of this.zombieSprites) {
      if (!activeZombies.has(zombie)) {
        this.bonusContainer.removeChild(sprite);
        const healthBar = this.zombieHealthBars.get(zombie);
        if (healthBar) {
          this.bonusContainer.removeChild(healthBar);
          this.zombieHealthBars.delete(zombie);
        }
        this.zombieSprites.delete(zombie);
      }
    }

    zombies.forEach(zombie => {
      let sprite = this.zombieSprites.get(zombie);
      if (!sprite) {
        let spineUsed = false;
        if (this.zombieMoveSpineData) {
          sprite = new PIXI.spine.Spine(this.zombieMoveSpineData);
          sprite.autoUpdate = true;
          // Default to ZombieMoveRight if available
          if (this.zombieMoveSpineData.animations.some(anim => anim.name === 'ZombieMoveRight')) {
            sprite.state.setAnimation(0, 'ZombieMoveRight', true);
            console.log('Using ZombieMoveRight animation as default');
            spineUsed = true;
          } else {
            // Use any available animation
            const availableAnimations = this.zombieMoveSpineData.animations.map(anim => anim.name);
            if (availableAnimations.length > 0) {
              sprite.state.setAnimation(0, availableAnimations[0], true);
              console.log(`Using fallback animation ${availableAnimations[0]} for zombie`);
              spineUsed = true;
            }
          }
        } else if (this.zombieSpineData) {
          sprite = new PIXI.spine.Spine(this.zombieSpineData);
          sprite.state.setAnimation(0, 'ZombieGrow', false);
          sprite.state.addAnimation(0, 'ZombieMoving', true, 0);
          sprite.autoUpdate = true;
          console.log('Using ZombieAnim spine animation for zombie');
          spineUsed = true;
        }

        if (!spineUsed) {
          if (zombieTexture && zombieTexture.valid) {
            sprite = new PIXI.Sprite(zombieTexture);
            console.log('Using zombie sprite from bonusAssets.json');
          } else {
            sprite = new PIXI.Sprite();
            console.warn('No valid zombie texture provided, using empty sprite');
          }
        }

        sprite.anchor.set(0.5);
        sprite.width = 60;
        sprite.height = 60;
        this.bonusContainer.addChild(sprite);
        this.zombieSprites.set(zombie, sprite);

        const healthBar = new PIXI.Graphics();
        healthBar.beginFill(0xFF0000);
        healthBar.drawRect(-30, -50, 60, 10);
        healthBar.endFill();
        healthBar.beginFill(0x00FF00);
        healthBar.drawRect(-30, -50, 60 * (zombie.energy / 100), 10);
        healthBar.endFill();
        this.bonusContainer.addChild(healthBar);
        this.zombieHealthBars.set(zombie, healthBar);
      }

      // Update zombie position and animation
      sprite.x = zombie.x;
      sprite.y = zombie.y;
      sprite.tint = zombie.energy > 50 ? 0xFFFFFF : zombie.energy > 25 ? 0xFF9999 : 0xFF3333;

      if (this.zombieMoveSpineData && sprite instanceof PIXI.spine.Spine) {
        // Determine direction relative to hero
        const dx = hero.x - zombie.x;
        const dy = hero.y - zombie.y;
        let direction = null;
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'ZombieMoveRight' : 'ZombieMoveLeft';
        } else {
          direction = dy > 0 ? 'ZombieMoveDown' : 'ZombieMoveUp';
        }

        if (this.zombieMoveSpineData.animations.some(anim => anim.name === direction)) {
          if (sprite.state.getCurrent(0)?.animation.name !== direction) {
            sprite.state.setAnimation(0, direction, true);
            console.log(`Playing zombie ${direction} animation`);
          }
        } else if (this.zombieMoveSpineData.animations.some(anim => anim.name === 'ZombieMoveRight')) {
          if (sprite.state.getCurrent(0)?.animation.name !== 'ZombieMoveRight') {
            sprite.state.setAnimation(0, 'ZombieMoveRight', true);
            console.log('Falling back to ZombieMoveRight animation');
          }
        }
      } else if (this.zombieSpineData && sprite instanceof PIXI.spine.Spine) {
        // Maintain existing behavior
        if (sprite.state.getCurrent(0)?.animation.name !== 'ZombieMoving') {
          sprite.state.setAnimation(0, 'ZombieGrow', false);
          sprite.state.addAnimation(0, 'ZombieMoving', true, 0);
        }
      }

      const healthBar = this.zombieHealthBars.get(zombie);
      if (healthBar) {
        healthBar.clear();
        healthBar.beginFill(0xFF0000);
        healthBar.drawRect(-30, -50, 60, 10);
        healthBar.endFill();
        healthBar.beginFill(0x00FF00);
        healthBar.drawRect(-30, -50, 60 * (zombie.energy / 100), 10);
        healthBar.endFill();
        healthBar.x = zombie.x;
        healthBar.y = zombie.y;
      }
    });

    const activeBullets = new Set(bullets);
    for (let [bullet, sprite] of this.bulletSprites) {
      if (!activeBullets.has(bullet)) {
        this.bonusContainer.removeChild(sprite);
        this.bulletSprites.delete(bullet);
      }
    }
    bullets.forEach(bullet => {
      let sprite = this.bulletSprites.get(bullet);
      if (!sprite) {
        sprite = new PIXI.Sprite(this.bulletTexture);
        sprite.anchor.set(0.5);
        sprite.width = 10;
        sprite.height = 5;
        sprite.rotation = Math.atan2(bullet.vy, bullet.vx);
        this.bonusContainer.addChild(sprite);
        this.bulletSprites.set(bullet, sprite);
      }
      sprite.x = bullet.x;
      sprite.y = bullet.y;
    });
  }

  cleanupBonusBattle() {
    this.isBonusSetupComplete = false;
    this.bonusContainer.removeChildren();
    this.zombieSprites.clear();
    this.zombieHealthBars.clear();
    this.bulletSprites.clear();
    this.heroSprite = null;
    this.ammoText = null;
    this.bonusWinText = null;
    this.heroTargetRotation = 0;
    this.zombieSpineData = null;
    this.heroSpineData = null;
    this.zombieMoveSpineData = null;
    this.heroMoveSpineData = null;
    this.heroFireSpineData = null;
    this.bonusBgTexture = null;
    this.bulletTexture = null;
    this.mapContainer.visible = true;
    this.symbolContainer.visible = true;
    console.log('Bonus battle cleanup complete');
  }

  updateBonusUI(isBonusMode, ammo) {
    this.bonusText.visible = isBonusMode;
    if (isBonusMode) {
      this.bonusText.text = '';
      if (this.spinButton) {
        this.spinButton.visible = false;
        this.spinButton.interactive = false;
      }
      if (this.bonusButton) {
        this.bonusButton.visible = false;
        this.bonusButton.interactive = false;
      }
      if (this.heroProgressBar) this.heroProgressBar.visible = false;
      if (this.heroProgressText) this.heroProgressText.visible = false;
      if (this.enemyProgressBar) this.enemyProgressBar.visible = false;
      if (this.enemyProgressText) this.enemyProgressText.visible = false;
      if (this.themeSelector) {
        this.themeSelector.style.display = 'none';
        this.themeSelector.disabled = true;
      }
      if (this.ammoText) {
        this.ammoText.text = `Ammo: ${ammo}`;
      }
    } else {
      this.bonusText.text = '';
      if (this.spinButton) {
        this.spinButton.visible = true;
        this.spinButton.interactive = true;
        this.spinButton.alpha = 1;
      }
      if (this.bonusButton) {
        this.bonusButton.visible = true;
        this.bonusButton.interactive = true;
        this.bonusButton.alpha = 1;
      }
      if (this.heroProgressBar) this.heroProgressBar.visible = true;
      if (this.heroProgressText) this.heroProgressText.visible = true;
      if (this.enemyProgressBar) this.enemyProgressBar.visible = true;
      if (this.enemyProgressText) this.enemyProgressText.visible = true;
      if (this.themeSelector) {
        this.themeSelector.style.display = 'block';
        this.themeSelector.disabled = false;
      }
      if (this.bonusWinText) {
        this.bonusWinText.visible = false;
      }
    }
  }

  startSpinAnimation() {
    if (this.spinSprite && this.spinAnimation) {
      this.spinSprite.visible = false;
      this.spinAnimation.visible = true;
      this.spinAnimation.x = -1400;
      this.spinAnimation.y = 20;
      this.spinAnimation.scale.set(0.8);
      console.log('Started spin button animation');
    }
  }

  stopSpinAnimation() {
    if (this.spinSprite && this.spinAnimation) {
      this.spinSprite.visible = true;
      this.spinAnimation.visible = false;
      console.log('Stopped spin button animation');
    }
  }

  showModeTransition(message, callback) {
    this.transitionContainer.removeChildren();
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.8);
    overlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.endFill();
    this.transitionContainer.addChild(overlay);

    const transitionText = new PIXI.Text(message, {
      fontFamily: 'Arial, sans-serif',
      fontSize: 60,
      fill: 0xFFFFFF,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 4
    });
    transitionText.x = this.app.screen.width / 2;
    transitionText.y = this.app.screen.height / 2;
    transitionText.anchor.set(0.5);
    this.transitionContainer.addChild(transitionText);

    gsap.fromTo(overlay, { alpha: 0 }, { alpha: 0.8, duration: 0.5 });
    gsap.fromTo(transitionText, { alpha: 0, scale: 0.5 }, { alpha: 1, scale: 1, duration: 0.5 });
    gsap.to([overlay, transitionText], {
      alpha: 0,
      duration: 0.5,
      delay: 1.5,
      onComplete: () => {
        this.transitionContainer.removeChildren();
        callback();
      }
    });
  }

  showBonusTriggerPopup(callback) {
    this.popupContainer.removeChildren();
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.8);
    overlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.endFill();
    this.popupContainer.addChild(overlay);

    const popup = new PIXI.Graphics();
    popup.beginFill(0x333333);
    popup.drawRoundedRect(400, 200, 400, 400, 20);
    popup.endFill();
    this.popupContainer.addChild(popup);

    const text = new PIXI.Text('Bonus Round Triggered!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 40,
      fill: 0xFFD700,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 4
    });
    text.x = 600;
    text.y = 300;
    text.anchor.set(0.5);
    this.popupContainer.addChild(text);

    const button = new PIXI.Graphics();
    button.beginFill(0xFFA500);
    button.drawRoundedRect(500, 450, 200, 60, 10);
    button.endFill();
    button.interactive = true;
    button.buttonMode = true;
    button.on('pointerdown', () => {
      this.popupContainer.removeChildren();
      callback();
    });
    this.popupContainer.addChild(button);

    const buttonText = new PIXI.Text('Skip to Bonus Round', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      fill: 0x000000,
      align: 'center'
    });
    buttonText.x = 600;
    buttonText.y = 480;
    buttonText.anchor.set(0.5);
    button.addChild(buttonText);

    gsap.fromTo(popup, { alpha: 0, scale: 0.5 }, { alpha: 1, scale: 1, duration: 0.5 });
    gsap.fromTo(text, { alpha: 0 }, { alpha: 1, duration: 0.5 });
    gsap.fromTo(button, { alpha: 0 }, { alpha: 1, duration: 0.5 });
  }

  showBonusEndPopup(totalWin, callback) {
    this.popupContainer.removeChildren();
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.8);
    overlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.endFill();
    this.popupContainer.addChild(overlay);

    const popup = new PIXI.Graphics();
    popup.beginFill(0x333333);
    popup.drawRoundedRect(400, 200, 400, 400, 20);
    popup.endFill();
    this.popupContainer.addChild(popup);

    const text = new PIXI.Text(`Total Bonus Win: ${totalWin}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: 40,
      fill: 0xFFD700,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 4
    });
    text.x = 600;
    text.y = 300;
    text.anchor.set(0.5);
    this.popupContainer.addChild(text);

    const button = new PIXI.Graphics();
    button.beginFill(0xFFA500);
    button.drawRoundedRect(500, 450, 200, 60, 10);
    button.endFill();
    button.interactive = true;
    button.buttonMode = true;
    button.on('pointerdown', () => {
      this.popupContainer.removeChildren();
      callback();
    });
    this.popupContainer.addChild(button);

    const buttonText = new PIXI.Text('Skip to Base Game', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      fill: 0x000000,
      align: 'center'
    });
    buttonText.x = 600;
    buttonText.y = 480;
    buttonText.anchor.set(0.5);
    button.addChild(buttonText);

    gsap.fromTo(popup, { alpha: 0, scale: 0.5 }, { alpha: 1, scale: 1, duration: 0.5 });
    gsap.fromTo(text, { alpha: 0 }, { alpha: 1, duration: 0.5 });
    gsap.fromTo(button, { alpha: 0 }, { alpha: 1, duration: 0.5 });
  }

  showBonusTotalWin(totalWin, callback) {
    // Deprecated, replaced by showBonusEndPopup
    callback();
  }

  updateProgressBars(heroProgress, enemyProgress) {
    this.heroProgressBar.scale.y = Math.min(heroProgress / 100, 1);
    this.heroProgressText.text = `${Math.round(heroProgress)}`;
    this.enemyProgressBar.scale.y = Math.min(enemyProgress / 100, 1);
    this.enemyProgressText.text = `${Math.round(enemyProgress)}`;
  }

  showWinResult(message) {
    this.winText.text = message;
    this.winText.visible = true;
    gsap.to(this.winText, {
      alpha: 0,
      duration: 2,
      delay: 2,
      onComplete: () => {
        this.winText.visible = false;
        this.winText.alpha = 1;
      }
    });
  }

  resetProgressBars() {
    this.heroProgressBar.scale.y = 0;
    this.enemyProgressBar.scale.y = 0;
    this.heroProgressText.text = '0';
    this.enemyProgressText.text = '0';
    this.winText.visible = false;
  }

  addReel(reelModel) {
    this.reelViews.push(reelModel);
    this.mapContainer.addChild(reelModel.getMapContainer());
    this.symbolContainer.addChild(reelModel.getSymbolContainer());
    console.log('Added reel to mapContainer and symbolContainer');
  }

  updateReel(reelModel) {
    this.mapContainer.removeChildren();
    this.symbolContainer.removeChildren();
    this.mapContainer.addChild(reelModel.getMapContainer());
    this.symbolContainer.addChild(reelModel.getSymbolContainer());
    console.log('Updated reel in mapContainer and symbolContainer');
  }

  setupUI(spinCallback, themeChangeCallback, bonusCallback) {
    this.uiContainer.removeChildren();
    if (this.themeSelector) {
      this.themeSelector.remove();
    }
    this.setupProgressBars();
    this.setupWinDisplay();
    this.setupBonusDisplay();
    this.setupBonusTotalWinDisplay();
    this.setupBonusWinDisplay();

    this.spinButton = new PIXI.Container();
    this.spinButton.x = 1100;
    this.spinButton.y = 610;
    this.spinButton.scale.set(0.3);
    this.spinButton.interactive = true;
    this.spinButton.buttonMode = true;
    this.spinButton.on('pointerdown', spinCallback);

    if (this.spinSprite) {
      this.spinSprite.anchor.set(0.5);
      this.spinSprite.x = 40;
      this.spinSprite.y = 20;
      this.spinButton.addChild(this.spinSprite);
    }

    if (this.spinAnimation) {
      this.spinAnimation.anchor = new PIXI.Point(0.5, 0.5);
      this.spinAnimation.x = 40;
      this.spinAnimation.y = 20;
      this.spinButton.addChild(this.spinAnimation);
    }

    this.uiContainer.addChild(this.spinButton);

    this.bonusButton = new PIXI.Graphics();
    this.bonusButton.beginFill(0xFFA500);
    this.bonusButton.drawRoundedRect(0, 0, 100, 50, 10);
    this.bonusButton.endFill();
    this.bonusButton.x = 10;
    this.bonusButton.y = 610;
    this.bonusButton.interactive = true;
    this.bonusButton.buttonMode = true;
    this.bonusButton.on('pointerdown', bonusCallback);

    const bonusText = new PIXI.Text('Bonus', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      fill: 0x000000,
      align: 'center'
    });
    bonusText.anchor.set(0.5);
    bonusText.x = 50;
    bonusText.y = 25;
    this.bonusButton.addChild(bonusText);
    this.uiContainer.addChild(this.bonusButton);

    const themeOptions = ['theme1', 'theme2', 'theme3', 'theme4'];
    this.themeSelector = document.createElement('select');
    this.themeSelector.id = 'theme-selector';
    themeOptions.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme;
      option.text = `Theme: ${theme}`;
      this.themeSelector.appendChild(option);
    });
    this.themeSelector.style.position = 'absolute';
    this.themeSelector.style.left = `${this.app.view.offsetLeft + 10}px`;
    this.themeSelector.style.top = `${this.app.view.offsetTop + 550}px`;
    this.themeSelector.style.width = '150px';
    this.themeSelector.style.height = '40px';
    this.themeSelector.style.fontFamily = 'Arial, sans-serif';
    this.themeSelector.style.fontSize = '16px';
    this.themeSelector.style.backgroundColor = '#ffffff';
    this.themeSelector.style.border = '2px solid #000000';
    this.themeSelector.style.borderRadius = '5px';
    this.themeSelector.style.padding = '5px';
    this.themeSelector.style.cursor = 'pointer';
    document.body.appendChild(this.themeSelector);

    this.themeSelector.addEventListener('change', () => {
      const selectedTheme = this.themeSelector.value;
      themeChangeCallback(selectedTheme);
      console.log(`Theme selected: ${selectedTheme}`);
    });

    console.log('UI setup complete');
  }

  hideSymbols() {
    this.symbolContainer.visible = false;
  }

  showSymbols() {
    this.symbolContainer.visible = true;
  }

  destroy() {
    if (this.themeSelector) {
      this.themeSelector.remove();
      this.themeSelector = null;
    }
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
  }
}