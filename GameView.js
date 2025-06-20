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
    this.heroAnimationData = null;
    this.heroAnimationSprite = null;
    this.currentHeroAnimation = '';
    this.zombieSprites = new Map();
    this.zombieHealthBars = new Map();
    this.zombieCurrentAnimations = new Map();
    this.bulletSprites = new Map();
    this.bulletTexture = null;
    this.ammoText = null;
    this.isBonusSetupComplete = false;
    this.heroTargetRotation = 0;
    this.bonusBgTexture = null;
    this.zombieAnimationDataLeft = null;
    this.zombieAnimationDataRight = null;
    this.zombieAnimationDataUp = null;
    this.zombieAnimationDataDown = null;
    this.zombieRewardTexture = null;
    this.winValueAnimationData = null;
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
    this.bonusBgTexture = null;
    this.bulletTexture = null;
    this.heroAnimationData = null;
    this.zombieAnimationDataLeft = null;
    this.zombieAnimationDataRight = null;
    this.zombieAnimationDataUp = null;
    this.zombieAnimationDataDown = null;
    this.zombieRewardTexture = null;
    this.winValueAnimationData = null;

    try {
      const bgAtlas = await PIXI.Assets.load('assets/BonusBg.json');
      if (bgAtlas.textures && bgAtlas.textures['BonusBg']) {
        this.bonusBgTexture = bgAtlas.textures['BonusBg'];
        console.log('Loaded BonusBg texture from BonusBg.json');
      } else {
        console.warn('BonusBg texture not found in BonusBg.json');
      }
    } catch (error) {
      console.error('Failed to load BonusBg.json:', error);
    }

    try {
      const bonusAtlas = await PIXI.Assets.load('assets/bonusAssets1.json');
      if (bonusAtlas.textures && bonusAtlas.textures['bullet']) {
        this.bulletTexture = bonusAtlas.textures['bullet'];
        console.log('Loaded bullet texture from bonusAssets.json');
      } else {
        console.warn('Bullet texture not found in bonusAssets.json, using fallback');
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF);
        graphics.drawRect(0, 0, 30, 15);
        graphics.endFill();
        this.bulletTexture = this.app.renderer.generateTexture(graphics);
      }
    } catch (error) {
      console.error('Failed to load bullet texture:', error);
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0xFFFFFF);
      graphics.drawRect(0, 0, 30, 15);
      graphics.endFill();
      this.bulletTexture = this.app.renderer.generateTexture(graphics);
    }

    try {
      const heroSpineData = await PIXI.Assets.load({
        src: 'animations/HeroMoveAnim.json',
        data: { type: 'spine' }
      });
      if (heroSpineData.spineData) {
        const animations = heroSpineData.spineData.animations.map(anim => anim.name);
        const requiredAnimations = ['HeroLeft', 'HeroRight', 'HeroUp', 'HeroDown'];
        const hasAllAnimations = requiredAnimations.every(anim => animations.includes(anim));
        if (hasAllAnimations) {
          this.heroAnimationData = heroSpineData.spineData;
          console.log('Loaded hero animations:', animations);
        } else {
          console.warn(`HeroMoveAnim.json missing some required animations. Available: [${animations.join(', ')}]`);
        }
      } else {
        console.warn('No spineData in HeroMoveAnim.json');
      }
    } catch (error) {
      console.error('Failed to load HeroMoveAnim.json:', error);
    }

    try {
      const rewardAtlas = await PIXI.Assets.load('assets/bonusassets1.json');
      if (rewardAtlas.textures && rewardAtlas.textures['ZombieReward']) {
        this.zombieRewardTexture = rewardAtlas.textures['ZombieReward'];
        console.log('Loaded ZombieReward texture from ZombieReward.json');
      } else {
        console.warn('ZombieReward texture not found in ZombieReward.json, using fallback');
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFD700);
        graphics.drawRect(0, 0, 60, 60);
        graphics.endFill();
        this.zombieRewardTexture = this.app.renderer.generateTexture(graphics);
      }
    } catch (error) {
      console.error('Failed to load ZombieReward.json:', error);
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0xFFD700);
      graphics.drawRect(0, 0, 60, 60);
      graphics.endFill();
      this.zombieRewardTexture = this.app.renderer.generateTexture(graphics);
    }

    try {
      const winValueData = await PIXI.Assets.load({
        src: 'animations/WinValue@2x.json',
        data: { type: 'spine' }
      });
      if (winValueData.spineData && winValueData.spineData.animations.some(anim => anim.name === 'totalWinValue')) {
        this.winValueAnimationData = winValueData.spineData;
        console.log('Loaded WinValue@2x animation: totalWinValue');
      } else {
        console.warn('totalWinValue animation not found in WinValue@2x.json');
      }
    } catch (error) {
      console.error('Failed to load WinValue@2x.json:', error);
    }

    const loadSpineAnimation = async (file, animName) => {
      try {
        const spineData = await PIXI.Assets.load({
          src: `animations/${file}`,
          data: { type: 'spine' }
        });
        if (spineData.spineData) {
          const animations = spineData.spineData.animations.map(anim => anim.name);
          console.log(`Loaded ${file}: Available animations: [${animations.join(', ')}]`);
          if (animations.includes(animName)) {
            return spineData.spineData;
          } else {
            console.warn(`${animName} not found in ${file}. Available animations: [${animations.join(', ')}]`);
            return null;
          }
        } else {
          console.warn(`No spineData in ${file}`);
          return null;
        }
      } catch (error) {
        console.error(`Failed to load ${file}:`, error);
        return null;
      }
    };

    this.zombieAnimationDataLeft = await loadSpineAnimation('ZombieMoveLeft.json', 'ZombieMoveLeft');
    this.zombieAnimationDataRight = await loadSpineAnimation('ZombieMoveRight.json', 'ZombieMoveRight');
    this.zombieAnimationDataUp = await loadSpineAnimation('ZombieMoveUp.json', 'ZombieMoveUp');
    this.zombieAnimationDataDown = await loadSpineAnimation('ZombieMoveDown.json', 'ZombieMoveDown');

    const animationStatus = {
      ZombieMoveLeft: !!this.zombieAnimationDataLeft,
      ZombieMoveRight: !!this.zombieAnimationDataRight,
      ZombieMoveUp: !!this.zombieAnimationDataUp,
      ZombieMoveDown: !!this.zombieAnimationDataDown,
      ZombieReward: !!this.zombieRewardTexture,
      WinValue: !!this.winValueAnimationData,
      HeroAnimations: !!this.heroAnimationData
    };
    console.log('Animation data status:', animationStatus);

    if (!this.zombieAnimationDataUp) {
      console.warn('ZombieMoveUp animation unavailable. Using ZombieMoveLeft/Right as fallback for upward movement.');
    }
    if (!this.zombieAnimationDataDown) {
      console.warn('ZombieMoveDown animation unavailable. Using ZombieMoveLeft/Right as fallback for downward movement.');
    }
  }

  setupProgressBars() {
    this.heroProgressBar = new PIXI.Graphics();
    this.heroProgressBar.beginFill(0x00FF00);
    this.heroProgressBar.drawRect(20, 100, 30, 400);
    this.heroProgressBar.endFill();
    this.heroProgressBar.scale.y = 0;
    this.uiContainer.addChild(this.heroProgressBar);

    this.heroProgressText = new PIXI.Text('0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      fill: 0xFFFFFF,
      align: 'center'
    });
    this.heroProgressText.x = 35;
    this.heroProgressText.y = 80;
    this.heroProgressText.anchor.set(0.5);
    this.uiContainer.addChild(this.heroProgressText);

    this.enemyProgressBar = new PIXI.Graphics();
    this.enemyProgressBar.beginFill(0xFF0000);
    this.enemyProgressBar.drawRect(1150, 100, 30, 400);
    this.enemyProgressBar.endFill();
    this.enemyProgressBar.scale.y = 0;
    this.uiContainer.addChild(this.enemyProgressBar);

    this.enemyProgressText = new PIXI.Text('0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      fill: 0xFFFFFF,
      align: 'center'
    });
    this.enemyProgressText.x = 1165;
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

    // Prioritize hero animation over texture
    if (this.heroAnimationData) {
      try {
        this.heroAnimationSprite = new PIXI.spine.Spine(this.heroAnimationData);
        const bounds = this.heroAnimationSprite.getLocalBounds();
        const scale = Math.min(160 / (bounds.width || 160), 160 / (bounds.height || 160)); // Increased size to 160x160
        this.heroAnimationSprite.scale.set(scale);
        this.heroAnimationSprite.x = 600;
        this.heroAnimationSprite.y = 700;
        this.heroAnimationSprite.rotation = 0;
        this.heroAnimationSprite.anchor = new PIXI.Point(0.5, 0.5);
        this.heroAnimationSprite.interactive = true;
        this.heroAnimationSprite.buttonMode = true;
        this.bonusContainer.addChild(this.heroAnimationSprite);
        console.log('Initialized hero animation sprite from HeroMoveAnim.json with increased size (160x160) and added to bonusContainer');

        // Initialize hero sprite as fallback but don't add to container
        if (heroTexture && heroTexture.valid) {
          this.heroSprite = new PIXI.Sprite(heroTexture);
          console.log('Initialized hero sprite from bonusAssets.json as fallback');
        } else {
          this.heroSprite = new PIXI.Sprite();
          console.warn('No valid hero texture provided, initialized empty sprite as fallback');
        }
        this.heroSprite.anchor.set(0.5);
        this.heroSprite.x = 600;
        this.heroSprite.y = 700;
        this.heroSprite.width = 80;
        this.heroSprite.height = 80;
        this.heroSprite.rotation = 0;
        this.heroSprite.interactive = true;
        this.heroSprite.buttonMode = true;
      } catch (error) {
        console.error('Failed to create hero animation Spine sprite:', error);
        this.heroAnimationSprite = null;
        // Fall back to hero texture
        if (heroTexture && heroTexture.valid) {
          this.heroSprite = new PIXI.Sprite(heroTexture);
          console.log('Using hero sprite from bonusAssets.json due to animation failure');
        } else {
          this.heroSprite = new PIXI.Sprite();
          console.warn('No valid hero texture provided, using empty sprite');
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
        console.log('Added hero sprite to bonusContainer as fallback');
      }
    } else {
      console.warn('No hero animation data available, using hero texture');
      if (heroTexture && heroTexture.valid) {
        this.heroSprite = new PIXI.Sprite(heroTexture);
        console.log('Using hero sprite from bonusAssets.json');
      } else {
        this.heroSprite = new PIXI.Sprite();
        console.warn('No valid hero texture provided, using empty sprite');
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
      console.log('Added hero sprite to bonusContainer');
      this.heroAnimationSprite = null;
    }

    // Set up interaction events on the active sprite (animation or texture)
    const activeSprite = this.heroAnimationSprite || this.heroSprite;
    let isDragging = false;
    activeSprite.on('pointerdown', () => {
      isDragging = true;
    });
    activeSprite.on('pointerup', () => {
      isDragging = false;
    });
    activeSprite.on('pointerupoutside', () => {
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
    this.zombieCurrentAnimations.clear();
    this.bulletSprites.clear();
    this.isBonusSetupComplete = true;
    console.log('Bonus battle setup complete');
  }

  showZombieReward(x, y, callback) {
    let rewardSprite;
    try {
      if (this.zombieRewardTexture && this.zombieRewardTexture.valid) {
        rewardSprite = new PIXI.Sprite(this.zombieRewardTexture);
        rewardSprite.anchor.set(0.5);
        rewardSprite.width = 60;
        rewardSprite.height = 60;
        console.log('Using ZombieReward sprite from ZombieReward.json');
      } else {
        rewardSprite = new PIXI.Graphics();
        rewardSprite.beginFill(0xFFD700);
        rewardSprite.drawRect(-30, -30, 60, 60);
        rewardSprite.endFill();
        console.warn('No valid ZombieReward texture, using fallback graphics');
      }
      rewardSprite.x = x;
      rewardSprite.y = y;
      this.bonusContainer.addChild(rewardSprite);
    } catch (error) {
      console.error('Failed to create or add ZombieReward sprite:', error);
      callback();
      return;
    }

    if (this.winValueAnimationData) {
      try {
        const winAnimation = new PIXI.spine.Spine(this.winValueAnimationData);
        winAnimation.x = x;
        winAnimation.y = y;
        if (winAnimation.state && winAnimation.state.hasAnimation('totalWinValue')) {
          winAnimation.state.setAnimation(0, 'totalWinValue', false);
          winAnimation.state.addListener({
            complete: () => {
              try {
                if (rewardSprite && rewardSprite.parent) {
                  this.bonusContainer.removeChild(rewardSprite);
                }
                if (winAnimation && winAnimation.parent) {
                  this.bonusContainer.removeChild(winAnimation);
                }
                callback();
              } catch (error) {
                console.error('Failed to clean up ZombieReward animation:', error);
                callback();
              }
            }
          });
          this.bonusContainer.addChild(winAnimation);
          console.log('Playing totalWinValue animation at', x, y);
        } else {
          console.warn('totalWinValue animation not available, skipping');
          if (rewardSprite && rewardSprite.parent) {
            this.bonusContainer.removeChild(rewardSprite);
          }
          callback();
        }
      } catch (error) {
        console.error('Failed to play totalWinValue animation:', error);
        if (rewardSprite && rewardSprite.parent) {
          this.bonusContainer.removeChild(rewardSprite);
        }
        callback();
      }
    } else {
      console.warn('No winValueAnimationData, skipping animation');
      setTimeout(() => {
        try {
          if (rewardSprite && rewardSprite.parent) {
            this.bonusContainer.removeChild(rewardSprite);
          }
          callback();
        } catch (error) {
          console.error('Failed to clean up ZombieReward sprite:', error);
          callback();
        }
      }, 1000);
    }
  }

  updateBonusBattle(hero, zombies, zombieTexture, bonusTotalWin, bullets) {
    if (!this.isBonusSetupComplete) {
      console.warn('Cannot update bonus battle: Setup not complete');
      return;
    }
    if (!this.heroSprite || !hero || !hero.x || !hero.y) {
      console.warn('Cannot update bonus battle: heroSprite or hero data missing or invalid', { heroSprite: !!this.heroSprite, hero: hero });
      return;
    }

    try {
      // Update hero position
      this.heroSprite.x = hero.x;
      this.heroSprite.y = hero.y;
      if (this.heroAnimationSprite) {
        this.heroAnimationSprite.x = hero.x;
        this.heroAnimationSprite.y = hero.y;
      }

      if (this.bonusWinText) {
        this.bonusWinText.text = `Bonus Win: ${bonusTotalWin}`;
        this.bonusWinText.visible = true;
      }

      // Handle hero animation
      if (this.heroAnimationSprite && this.heroAnimationData) {
        let newAnimation = ''; // Default to no animation
        if (bullets && bullets.length > 0) {
          // Use the first bullet's velocity to determine firing direction
          const bullet = bullets[0];
          if (bullet && bullet.vx !== undefined && bullet.vy !== undefined) {
            console.log('Hero is firing, selecting firing animation based on bullet direction');
            const vx = bullet.vx;
            const vy = bullet.vy;
            const absVx = Math.abs(vx);
            const absVy = Math.abs(vy);
            if (absVx >= absVy) {
              newAnimation = vx > 0 ? 'HeroRight' : 'HeroLeft';
            } else {
              newAnimation = vy > 0 ? 'HeroUp' : 'HeroDown';
            }
            console.log(`Selected firing animation: ${newAnimation}, vx=${vx}, vy=${vy}`);
          } else {
            console.warn('Bullet data invalid, no animation selected');
          }
        }

        if (newAnimation !== this.currentHeroAnimation) {
          console.log(`Attempting to update hero animation from ${this.currentHeroAnimation} to ${newAnimation}`);
          try {
            if (newAnimation && this.heroAnimationSprite.state.hasAnimation(newAnimation)) {
              if (this.heroSprite.parent) {
                this.bonusContainer.removeChild(this.heroSprite);
                console.log('Removed hero sprite from bonusContainer');
              }
              if (!this.heroAnimationSprite.parent) {
                this.bonusContainer.addChild(this.heroAnimationSprite);
                console.log('Added hero animation sprite to bonusContainer');
              }
              this.heroAnimationSprite.state.setAnimation(0, newAnimation, true);
              this.currentHeroAnimation = newAnimation;
              console.log(`Successfully set hero animation to ${newAnimation}`);
            } else {
              if (this.heroAnimationSprite.parent) {
                this.bonusContainer.removeChild(this.heroAnimationSprite);
                console.log('Removed hero animation sprite');
              }
              if (!this.heroSprite.parent) {
                this.bonusContainer.addChild(this.heroSprite);
                console.log('Added hero sprite as fallback');
              }
              this.currentHeroAnimation = '';
              console.log('Reverted to static hero sprite');
            }
          } catch (error) {
            console.error(`Failed to set hero animation ${newAnimation}:`, error);
            if (this.heroAnimationSprite && this.heroAnimationSprite.parent) {
              this.bonusContainer.removeChild(this.heroAnimationSprite);
              console.log('Removed hero animation sprite due to error');
            }
            if (!this.heroSprite.parent) {
              this.bonusContainer.addChild(this.heroSprite);
              console.log('Added hero sprite as fallback');
            }
            this.currentHeroAnimation = '';
            console.log('Reverted to static hero sprite due to animation error');
          }
        } else {
          console.log(`No animation change needed, current: ${this.currentHeroAnimation}`);
        }
      } else {
        console.warn('No hero animation data or sprite available, using static sprite');
        if (this.heroAnimationSprite && this.heroAnimationSprite.parent) {
          this.bonusContainer.removeChild(this.heroAnimationSprite);
          console.log('Removed hero animation sprite');
        }
        if (!this.heroSprite.parent) {
          this.bonusContainer.addChild(this.heroSprite);
          console.log('Added hero sprite');
        }
        this.currentHeroAnimation = '';
      }

      // Update hero rotation
      if (hero.aimTarget) {
        const dx = hero.aimTarget.x - hero.x;
        const dy = hero.aimTarget.y - hero.y;
        this.heroTargetRotation = Math.atan2(dy, dx) + Math.PI / 2;
        const rotationSpeed = 0.1;
        const deltaRotation = this.heroTargetRotation - (this.heroAnimationSprite && this.heroAnimationSprite.parent ? this.heroAnimationSprite.rotation : this.heroSprite.rotation);
        try {
          if (this.heroAnimationSprite && this.heroAnimationSprite.parent) {
            this.heroAnimationSprite.rotation += deltaRotation * rotationSpeed;
          } else {
            this.heroSprite.rotation += deltaRotation * rotationSpeed;
          }
        } catch (error) {
          console.error('Failed to update hero rotation:', error);
        }
      }

      // Update zombies
      const activeZombies = new Set(zombies);
      for (let [zombie, sprite] of this.zombieSprites) {
        if (!activeZombies.has(zombie)) {
          try {
            if (sprite && sprite.parent && sprite.transform) {
              this.bonusContainer.removeChild(sprite);
              console.log('Removed zombie sprite from bonusContainer');
            }
            const healthBar = this.zombieHealthBars.get(zombie);
            if (healthBar && healthBar.parent && healthBar.transform) {
              this.bonusContainer.removeChild(healthBar);
              console.log('Removed zombie health bar from bonusContainer');
            }
            this.zombieHealthBars.delete(zombie);
            this.zombieSprites.delete(zombie);
            this.zombieCurrentAnimations.delete(zombie);
          } catch (error) {
            console.error('Failed to remove zombie sprite or health bar:', error);
            this.zombieHealthBars.delete(zombie);
            this.zombieSprites.delete(zombie);
            this.zombieCurrentAnimations.delete(zombie);
          }
        }
      }

      zombies.forEach(zombie => {
        if (!zombie || !zombie.x || !zombie.y) {
          console.warn('Invalid zombie data:', zombie);
          return;
        }

        let sprite = this.zombieSprites.get(zombie);
        let isSpine = false;

        const dx = hero.x - zombie.x;
        const dy = hero.y - zombie.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        let animationData = null;
        let animationName = '';
        let direction = '';

        try {
          if (absDx >= absDy) {
            if (dx > 0) {
              animationData = this.zombieAnimationDataRight;
              animationName = 'ZombieMoveRight';
              direction = 'right';
            } else if (dx < 0) {
              animationData = this.zombieAnimationDataLeft;
              animationName = 'ZombieMoveLeft';
              direction = 'left';
            } else {
              if (dy > 0) {
                animationData = this.zombieAnimationDataUp || (dx >= 0 ? this.zombieAnimationDataRight : this.zombieAnimationDataLeft);
                animationName = this.zombieAnimationDataUp ? 'ZombieMoveUp' : (dx >= 0 ? 'ZombieMoveRight' : 'ZombieMoveLeft');
                direction = this.zombieAnimationDataUp ? 'up' : (dx >= 0 ? 'right (up fallback)' : 'left (up fallback)');
              } else if (dy < 0) {
                animationData = this.zombieAnimationDataDown || (dx >= 0 ? this.zombieAnimationDataRight : this.zombieAnimationDataLeft);
                animationName = this.zombieAnimationDataDown ? 'ZombieMoveDown' : (dx >= 0 ? 'ZombieMoveRight' : 'ZombieMoveLeft');
                direction = this.zombieAnimationDataDown ? 'down' : (dx >= 0 ? 'right (down fallback)' : 'left (down fallback)');
              } else {
                animationData = this.zombieAnimationDataRight || this.zombieAnimationDataLeft;
                animationName = this.zombieAnimationDataRight ? 'ZombieMoveRight' : 'ZombieMoveLeft';
                direction = this.zombieAnimationDataRight ? 'right (default)' : 'left (default)';
                console.warn(`Zombie and hero at same position, defaulting to ${animationName}`);
              }
            }
          } else {
            if (dy > 0) {
              animationData = this.zombieAnimationDataUp || (dx >= 0 ? this.zombieAnimationDataRight : this.zombieAnimationDataLeft);
              animationName = this.zombieAnimationDataUp ? 'ZombieMoveUp' : (dx >= 0 ? 'ZombieMoveRight' : 'ZombieMoveLeft');
              direction = this.zombieAnimationDataUp ? 'up' : (dx >= 0 ? 'right (up fallback)' : 'left (up fallback)');
            } else if (dy < 0) {
              animationData = this.zombieAnimationDataDown || (dx >= 0 ? this.zombieAnimationDataRight : this.zombieAnimationDataLeft);
              animationName = this.zombieAnimationDataDown ? 'ZombieMoveDown' : (dx >= 0 ? 'ZombieMoveRight' : 'ZombieMoveLeft');
              direction = this.zombieAnimationDataDown ? 'down' : (dx >= 0 ? 'right (down fallback)' : 'left (down fallback)');
            }
          }

          if (!animationData) {
            console.warn(`No animation data for ${animationName} (direction: ${direction}), dx=${dx}, dy=${dy}`);
            if (this.zombieAnimationDataRight) {
              animationData = this.zombieAnimationDataRight;
              animationName = 'ZombieMoveRight';
              direction = 'right (fallback)';
            } else if (this.zombieAnimationDataLeft) {
              animationData = this.zombieAnimationDataLeft;
              animationName = 'ZombieMoveLeft';
              direction = 'left (fallback)';
            } else if (this.zombieAnimationDataUp) {
              animationData = this.zombieAnimationDataUp;
              animationName = 'ZombieMoveUp';
              direction = 'up (fallback)';
            } else if (this.zombieAnimationDataDown) {
              animationData = this.zombieAnimationDataDown;
              animationName = 'ZombieMoveDown';
              direction = 'down (fallback)';
            } else if (zombieTexture && zombieTexture.valid) {
              sprite = new PIXI.Sprite(zombieTexture);
              sprite.anchor.set(0.5);
              console.log('Using zombie sprite from bonusAssets.json as fallback');
            } else {
              sprite = new PIXI.Sprite();
              sprite.anchor.set(0.5);
              console.warn('No valid zombie texture or animation, using empty sprite');
            }
          }

          if (!sprite && animationData) {
            sprite = new PIXI.spine.Spine(animationData);
            if (sprite.state && sprite.state.hasAnimation(animationName)) {
              sprite.state.setAnimation(0, animationName, true);
              sprite.autoUpdate = true;
              isSpine = true;

              const bounds = sprite.getLocalBounds();
              console.log(`Created Spine sprite for ${animationName}: Bounds (x=${bounds.x}, y=${bounds.y}, width=${bounds.width}, height=${bounds.height})`);

              sprite.pivot.set(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
              console.log(`Using ${animationName} animation for zombie at (${zombie.x}, ${zombie.y}) moving ${direction}`);
            } else {
              console.warn(`Animation ${animationName} not available in spine data, falling back to static sprite`);
              sprite = new PIXI.Sprite(zombieTexture && zombieTexture.valid ? zombieTexture : null);
              sprite.anchor.set(0.5);
            }
          }

          if (sprite) {
            let healthBar = this.zombieHealthBars.get(zombie);
            if (!healthBar && isSpine) {
              healthBar = new PIXI.Graphics();
              this.bonusContainer.addChild(healthBar);
              this.zombieHealthBars.set(zombie, healthBar);
            }

            if (!this.zombieSprites.has(zombie)) {
              sprite.width = 60;
              sprite.height = 60;
              this.bonusContainer.addChild(sprite);
              this.zombieSprites.set(zombie, sprite);
              this.zombieCurrentAnimations.set(zombie, animationName);
            }

            sprite.x = zombie.x;
            sprite.y = zombie.y;
            sprite.tint = zombie.energy > 50 ? 0xFFFFFF : zombie.energy > 25 ? 0xFF9999 : 0xFF3333;
            sprite.rotation = 0;

            const currentAnimation = this.zombieCurrentAnimations.get(zombie);
            if (isSpine && currentAnimation !== animationName) {
              if (sprite.state && sprite.parent && sprite.state.hasAnimation(animationName)) {
                sprite.state.setAnimation(0, animationName, true, 0.2);
                this.zombieCurrentAnimations.set(zombie, animationName);
                console.log(`Updated zombie animation to ${animationName} for zombie at (${zombie.x}, ${zombie.y}) moving ${direction}`);
              } else {
                console.warn(`Animation ${animationName} not available for update or sprite invalid, skipping`);
              }
            }

            if (healthBar) {
              healthBar.clear();
              healthBar.beginFill(0xFF0000);
              const bounds = isSpine ? sprite.getLocalBounds() : { x: -30, y: -30, width: 60, height: 60 };
              healthBar.drawRect(bounds.x, bounds.y - 20, bounds.width, 10);
              healthBar.endFill();
              healthBar.beginFill(0x00FF00);
              healthBar.drawRect(bounds.x, bounds.y - 20, bounds.width * (zombie.energy / 100), 10);
              healthBar.endFill();
              healthBar.x = zombie.x;
              healthBar.y = zombie.y;
            }
          }
        } catch (error) {
          console.error(`Failed to update zombie at (${zombie.x}, ${zombie.y}):`, error);
          if (sprite && sprite.parent) {
            this.bonusContainer.removeChild(sprite);
          }
          this.zombieSprites.delete(zombie);
          this.zombieHealthBars.delete(zombie);
          this.zombieCurrentAnimations.delete(zombie);
        }
      });

      // Update bullets
      const activeBullets = new Set(bullets);
      for (let [bullet, sprite] of this.bulletSprites) {
        if (!activeBullets.has(bullet)) {
          try {
            if (sprite && sprite.parent && sprite.transform) {
              this.bonusContainer.removeChild(sprite);
              console.log('Removed bullet sprite from bonusContainer');
            }
            this.bulletSprites.delete(bullet);
          } catch (error) {
            console.error('Failed to remove bullet sprite:', error);
            this.bulletSprites.delete(bullet);
          }
        }
      }

      bullets.forEach(bullet => {
        try {
          let sprite = this.bulletSprites.get(bullet);
          if (!sprite) {
            sprite = new PIXI.Sprite(this.bulletTexture);
            sprite.anchor.set(0.5);
            sprite.width = 50;
            sprite.height = 25;
            sprite.rotation = Math.atan2(bullet.vy, bullet.vx);
            this.bonusContainer.addChild(sprite);
            this.bulletSprites.set(bullet, sprite);

            // Calculate offset position from hero
            const offsetDistance = 50; // Distance from hero to start bullet
            const magnitude = Math.sqrt(bullet.vx * bullet.vx + bullet.vy * bullet.vy);
            if (magnitude > 0) {
              const offsetX = (bullet.vx / magnitude) * offsetDistance;
              const offsetY = (bullet.vy / magnitude) * offsetDistance;
              sprite.x = hero.x + offsetX;
              sprite.y = hero.y + offsetY;
              console.log(`New bullet created at (${sprite.x}, ${sprite.y}) with offset ${offsetDistance} from hero (${hero.x}, ${hero.y})`);
            } else {
              sprite.x = hero.x;
              sprite.y = hero.y;
              console.warn('Bullet velocity magnitude is zero, placing bullet at hero position');
            }
          } else {
            sprite.x = bullet.x;
            sprite.y = bullet.y - 40;
          }
        } catch (error) {
          console.error('Failed to update or create bullet sprite:', error);
        }
      });
    } catch (error) {
      console.error('Unexpected error in updateBonusBattle:', error);
    }
  }

  cleanupBonusBattle() {
    this.isBonusSetupComplete = false;
    try {
      this.bonusContainer.removeChildren();
    } catch (error) {
      console.error('Failed to remove bonus container children:', error);
    }
    this.zombieSprites.clear();
    this.zombieHealthBars.clear();
    this.zombieCurrentAnimations.clear();
    this.bulletSprites.clear();
    this.heroSprite = null;
    this.heroAnimationSprite = null;
    this.heroAnimationData = null;
    this.currentHeroAnimation = '';
    this.ammoText = null;
    this.bonusWinText = null;
    this.heroTargetRotation = 0;
    this.bonusBgTexture = null;
    this.bulletTexture = null;
    this.zombieAnimationDataLeft = null;
    this.zombieAnimationDataRight = null;
    this.zombieAnimationDataUp = null;
    this.zombieAnimationDataDown = null;
    this.zombieRewardTexture = null;
    this.winValueAnimationData = null;
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
      this.spinAnimation.x = -2700;
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

    const text = new PIXI.Text('Bonus Triggered!', {
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

    const buttonText = new PIXI.Text('Start Bonus', {
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

  showBonusEndPopup(totalWin, message, callback) {
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

    const text = new PIXI.Text(`${message}\nTotal Win: ${totalWin}`, {
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

    const buttonText = new PIXI.Text('Continue', {
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
    this.spinButton.y = 650;
    this.spinButton.scale.set(0.3);
    this.spinButton.interactive = true;
    this.spinButton.buttonMode = true;
    this.spinButton.on('pointerdown', spinCallback);

    if (this.spinSprite) {
      this.spinSprite.anchor.set(0.5);
      this.spinSprite.x = 40;
      this.spinSprite.y = 100;
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
    this.bonusButton.drawRoundedRect(0, 0, 80, 40);
    this.bonusButton.endFill();
    this.bonusButton.x = 20;
    this.bonusButton.y = 70;
    this.bonusButton.interactive = true;
    this.bonusButton.buttonMode = true;
    this.bonusButton.on('pointerdown', bonusCallback);

    const bonusText = new PIXI.Text('Bonus', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      fill: 0x000000,
      align: 'center'
    });
    bonusText.anchor.set(0.5);
    bonusText.x = 40;
    bonusText.y = 20;
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
    this.themeSelector.style.left = `${this.app.view.offsetLeft + 20}px`;
    this.themeSelector.style.top = `${this.app.view.offsetTop + 30}px`;
    this.themeSelector.style.width = '120px';
    this.themeSelector.style.height = '32px';
    this.themeSelector.style.fontFamily = 'Arial, sans-serif';
    this.themeSelector.style.fontSize = '14px';
    this.themeSelector.style.backgroundColor = '#ffffff';
    this.themeSelector.style.border = '2px solid #000000';
    this.themeSelector.style.borderRadius = '5px';
    this.themeSelector.style.padding = '3px';
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