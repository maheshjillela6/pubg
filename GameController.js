class GameController {
  constructor() {
    this.model = new GameModel();
    this.view = new GameView();
    this.isSpinning = false;
    this.currentTheme = 'theme1';
    this.lightingEffects = null;
    this.heroProgress = 0;
    this.enemyProgress = 0;
    this.gunfireAudio = null;
    this.isBonusMode = false;
    this.bonusSpinsRemaining = 0;
    this.bonusTotalWin = 0;
    this.bonusState = {
      hero: { x: 600, y: 700 },
      zombies: [],
      ammo: 50,
      zombieSpawnRate: 2,
      spawnDecreaseInterval: 10000,
      spawnDecreaseAmount: 0.4,
      lastSpawnTime: 0,
      lastSpawnDecreaseTime: 0,
      isHeroAlive: true,
      winPerZombie: 10,
      ammoPerZombie: 5,
      aimTarget: null,
      lastFireTime: 0,
      fireInterval: 200,
      bonusStartTime: 0,
      bullets: [],
      isFiring: false,
      isDraggingHero: false
    };
  }

  async init() {
    await this.view.init();
    const success = await this.model.loadAssets(this.currentTheme);
    if (!success) {
      console.error('Failed to load game assets.');
      return;
    }

    this.gunfireAudio = new Audio();
    this.gunfireAudio.preload = 'auto';
    const mp3Source = document.createElement('source');
    mp3Source.src = 'assets/audio/gunfire.mp3';
    mp3Source.type = 'audio/mpeg';
    const oggSource = document.createElement('source');
    oggSource.src = 'assets/audio/gunfire.ogg';
    oggSource.type = 'audio/ogg';
    this.gunfireAudio.appendChild(mp3Source);
    this.gunfireAudio.appendChild(oggSource);
    this.gunfireAudio.load();
    console.log('Gunfire audio loaded with fallback');

    this.lightingEffects = new WarzoneLighting(this.view.app);
    this.model.setupReels(this.currentTheme);
    this.view.addReel(this.model.reels[0]);
    this.view.setupUI(
      () => this.startSpin(),
      (theme) => this.changeTheme(theme),
      () => this.startBonusFeature()
    );
    this.view.app.ticker.add(() => this.update());
  }

  async changeTheme(theme) {
    if (this.isSpinning || this.isBonusMode) {
      console.warn('Cannot change theme: Spin or bonus mode in progress.');
      return;
    }
    if (theme === this.currentTheme) {
      console.log(`Theme already set to ${theme}`);
      return;
    }
    console.log(`Changing theme to: ${theme}`);
    this.currentTheme = theme;
    this.view.hideSymbols();
    const success = await this.model.loadAssets(theme);
    if (!success) {
      console.error(`Failed to load assets for theme ${theme}`);
      this.view.showSymbols();
      return;
    }
    this.model.setupReels(theme);
    this.model.reels[0].reelView = new ReelView(
      this.model.mapTextures[theme],
      this.model.symbolTextures[theme],
      this.model.spineData[theme],
      this.model.symbolConfig,
      this.model.mapDimensions[theme],
      this.model.mapNames,
      this.model.symbolNames.filter(name => name.includes(theme) || !name.includes('_t')),
      this.model.themes[theme].reelset
    );
    this.model.reels[0].setup();
    this.view.updateReel(this.model.reels[0]);
    this.view.showSymbols();
    console.log(`Theme change completed: ${theme}`);
    console.log(`Loaded map textures:`, this.model.mapTextures[theme]);
    console.log(`Loaded symbol textures:`, this.model.symbolTextures[theme]);
    console.log(`Loaded spine data:`, this.model.spineData[theme]);
  }

  startBonusFeature() {
    if (this.isBonusMode || this.isSpinning) {
      console.warn('Cannot start bonus feature: Already in bonus mode or spinning.');
      return;
    }
    console.log('Bonus feature triggered');
    this.view.showBonusTriggerPopup(async () => {
      this.isBonusMode = true;
      this.bonusTotalWin = 0;
      this.bonusState.ammo = 50;
      this.bonusState.zombieSpawnRate = 2;
      this.bonusState.zombies = [];
      this.bonusState.bullets = [];
      this.bonusState.isHeroAlive = true;
      this.bonusState.hero = { x: 600, y: 700 };
      this.bonusState.lastSpawnTime = performance.now();
      this.bonusState.lastSpawnDecreaseTime = performance.now();
      this.bonusState.bonusStartTime = performance.now();
      this.bonusState.aimTarget = null;
      this.bonusState.lastFireTime = 0;
      this.bonusState.isFiring = false;
      this.bonusState.isDraggingHero = false;
      const success = await this.model.loadBonusAssets();
      if (!success || !this.model.bonusTextures['l'] || !this.model.bonusTextures['zombie']) {
        console.error('Failed to load bonus assets');
        this.isBonusMode = false;
        this.view.showModeTransition('Bonus Feature Failed: Assets Missing', () => {
          this.view.showSymbols();
        });
        return;
      }
      this.view.showModeTransition('Entering Bonus Battle', () => {
        this.view.setupBonusBattle(
          this.bonusState.ammo,
          this.model.bonusTextures['l'],
          this.model.bonusTextures['zombie'],
          (targetX, targetY, isFiring, isDragging) => this.handlePlayerInput(targetX, targetY, isFiring, isDragging)
        );
        this.view.updateBonusUI(true, this.bonusState.ammo);
      });
    });
  }

  handlePlayerInput(targetX, targetY, isFiring, isDragging) {
    if (!this.isBonusMode || !this.bonusState.isHeroAlive) return;
    if (targetX === null || targetY === null) {
      this.bonusState.aimTarget = null;
    } else {
      this.bonusState.aimTarget = { x: targetX, y: targetY };
    }
    this.bonusState.isFiring = isFiring;
    this.bonusState.isDraggingHero = isDragging;
    if (isDragging && targetX !== null && targetY !== null) {
      this.bonusState.hero.x = Math.max(40, Math.min(1160, targetX));
      this.bonusState.hero.y = Math.max(40, Math.min(760, targetY));
    }
  }

  update() {
    if (!this.isBonusMode) {
      this.model.reels.forEach((reel) => reel.update(this.view.app.ticker.deltaMS));
    }
    if (this.isBonusMode && this.bonusState.isHeroAlive) {
      this.updateBonusBattle();
    }
  }

  updateBonusBattle() {
    if (!this.bonusState.isHeroAlive || !this.bonusState.hero) {
      console.warn('Bonus battle update skipped: Hero is dead or not initialized');
      return;
    }

    const currentTime = performance.now();

    // Check ammo first
    if (this.bonusState.ammo <= 0) {
      this.bonusState.isHeroAlive = false;
      this.endBonusFeature();
      return;
    }

    // Handle firing (only if not dragging hero)
    if (this.bonusState.isFiring && !this.bonusState.isDraggingHero && this.bonusState.aimTarget && currentTime - this.bonusState.lastFireTime >= this.bonusState.fireInterval) {
      this.bonusState.ammo--;
      this.view.updateBonusUI(true, this.bonusState.ammo);

      if (this.gunfireAudio) {
        this.gunfireAudio.currentTime = 0;
        this.gunfireAudio.play().catch(error => console.error('Failed to play gunfire audio:', error));
      }

      // Create bullet
      const dx = this.bonusState.aimTarget.x - this.bonusState.hero.x;
      const dy = this.bonusState.aimTarget.y - this.bonusState.hero.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0) {
        const speed = 10;
        this.bonusState.bullets.push({
          x: this.bonusState.hero.x,
          y: this.bonusState.hero.y,
          vx: (dx / distance) * speed,
          vy: (dy / distance) * speed
        });
      }

      this.bonusState.lastFireTime = currentTime;

      // Re-check ammo after firing
      if (this.bonusState.ammo <= 0) {
        this.bonusState.isHeroAlive = false;
        this.endBonusFeature();
        return;
      }
    }

    // Update bullets and check collisions
    this.bonusState.bullets = this.bonusState.bullets.filter(bullet => {
      bullet.x += bullet.vx * (this.view.app.ticker.deltaMS / 16.67);
      bullet.y += bullet.vy * (this.view.app.ticker.deltaMS / 16.67);

      // Remove bullets that go out of bounds
      if (bullet.x < 0 || bullet.x > 1200 || bullet.y < 0 || bullet.y > 800) {
        return false;
      }

      // Check collisions with zombies
      for (let zombie of this.bonusState.zombies) {
        const dx = zombie.x - bullet.x;
        const dy = zombie.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 30) {
          zombie.energy -= 20;
          if (zombie.energy <= 0) {
            this.bonusTotalWin += this.bonusState.winPerZombie;
            this.bonusState.ammo += this.bonusState.ammoPerZombie;
            this.view.updateBonusUI(true, this.bonusState.ammo);
            this.bonusState.zombies = this.bonusState.zombies.filter(z => z !== zombie);
          }
          return false;
        }
      }
      return true;
    });

    // Update zombie spawn rate
    if (currentTime - this.bonusState.lastSpawnDecreaseTime >= this.bonusState.spawnDecreaseInterval) {
      this.bonusState.zombieSpawnRate = Math.max(0.2, this.bonusState.zombieSpawnRate - this.bonusState.spawnDecreaseAmount);
      this.bonusState.lastSpawnDecreaseTime = currentTime;
      console.log(`Zombie spawn rate decreased to ${this.bonusState.zombieSpawnRate} zombies/sec`);
    }

    // Spawn new zombies
    const spawnInterval = 1000 / this.bonusState.zombieSpawnRate;
    if (currentTime - this.bonusState.lastSpawnTime >= spawnInterval) {
      this.spawnZombie();
      this.bonusState.lastSpawnTime = currentTime;
    }

    // Update zombie movement toward hero
    this.bonusState.zombies.forEach(zombie => {
      const dx = this.bonusState.hero.x - zombie.x;
      const dy = this.bonusState.hero.y - zombie.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 30) {
        this.bonusState.isHeroAlive = false;
        this.endBonusFeature();
        return;
      }
      const speed = zombie.speed * 0.3;
      zombie.x += (dx / distance) * speed * (this.view.app.ticker.deltaMS / 16.67);
      zombie.y += (dy / distance) * speed * (this.view.app.ticker.deltaMS / 16.67);
    });

    // Update view with hero, zombies, and bullets
    this.view.updateBonusBattle(
      this.bonusState.hero,
      this.bonusState.zombies,
      this.model.bonusTextures['zombie'],
      this.bonusTotalWin,
      this.bonusState.bullets
    );
  }

  spawnZombie() {
    const edge = Math.floor(Math.random() * 3);
    let x, y;
    const playerX = this.bonusState.hero.x;
    const playerY = this.bonusState.hero.y;
    switch (edge) {
      case 0: // Top
        do {
          x = Math.random() * 1200;
        } while (x >= playerX - 100 && x <= playerX + 100);
        y = 0;
        break;
      case 1: // Left
        x = 0;
        y = Math.random() * (playerY - 100);
        break;
      case 2: // Right
        x = 1200;
        y = Math.random() * (playerY - 100);
        break;
    }
    this.bonusState.zombies.push({
      x,
      y,
      energy: 100,
      speed: 0.5 + Math.random() * 0.5,
    });
    console.log(`Spawned zombie at (${x}, ${y})`);
  }

  startSpin(isBonusSpin = false) {
    if (this.isSpinning) {
      console.warn('Cannot spin: Already spinning.');
      return;
    }
    this.isSpinning = true;
    this.view.startSpinAnimation();
    this.view.hideSymbols();
    this.view.resetProgressBars();

    const mapTextureIndex = this.model.getNextMapIndex();
    console.log(`Spinning to map: ${this.model.mapNames[mapTextureIndex]} (index: ${mapTextureIndex})`);
    this.model.reels[0].spin(mapTextureIndex, this.model.spinDurationMs);
    setTimeout(() => this.stopSpin(isBonusSpin), this.model.spinDurationMs);
  }

  stopSpin(isBonusSpin = false) {
    this.model.reels[0].stop();
    this.isSpinning = false;
    this.view.stopSpinAnimation();
    const mapTextureIndex = this.model.spinMapIndices[this.model.currentMapIndex];
    console.log(`Stopped on map: ${this.model.mapNames[mapTextureIndex]}`);
    const symbols = this.model.reels[0].getCurrentSymbols();
    console.log('Landed symbols:', symbols);
    this.model.reels[0].updateSymbols(symbols);
    this.view.showSymbols();
    this.lightingEffects.createEffect(this.currentTheme);

    setTimeout(() => {
      if (this.gunfireAudio) {
        this.gunfireAudio.currentTime = 0;
        this.gunfireAudio.play().then(() => {
          console.log('Gunfire audio playing');
          setTimeout(() => {
            this.gunfireAudio.pause();
            this.gunfireAudio.currentTime = 0;
            console.log('Gunfire audio stopped after 3 seconds');
          }, 3000);
        }).catch(error => {
          console.error('Failed to play gunfire audio:', error);
        });
      } else {
        console.warn('Gunfire audio not loaded');
      }

      this.startProgressBars();
    }, 1000);
  }

  startProgressBars() {
    this.heroProgress = 0;
    this.enemyProgress = 0;
    const duration = 3;
    const steps = 60;
    const interval = (duration * 1000) / steps;

    let step = 0;
    const progressInterval = setInterval(() => {
      this.heroProgress += Math.random() * 1.5 + 0.5;
      this.enemyProgress += Math.random() * 1.5 + 0.5;
      this.heroProgress = Math.min(this.heroProgress, 100);
      this.enemyProgress = Math.min(this.enemyProgress, 100);
      this.view.updateProgressBars(this.heroProgress, this.enemyProgress);

      step++;
      if (step >= steps) {
        clearInterval(progressInterval);
        this.calculateWin();
      }
    }, interval);
  }

  calculateWin() {
    const heroScore = Math.round(this.heroProgress);
    const enemyScore = Math.round(this.enemyProgress);
    const difference = heroScore - enemyScore;

    if (this.isBonusMode) {
      this.view.showWinResult(`Hero Wins!\n+${heroScore}`);
      console.log(`Bonus mode: Hero wins with ${heroScore} (enemy ${enemyScore} ignored)`);
    } else if (difference > 0) {
      this.view.showWinResult(`Heroes Win!\n+${difference}`);
      console.log(`Heroes win with ${heroScore} vs Enemies ${enemyScore}`);
    } else if (difference < 0) {
      this.view.showWinResult(`Enemies Win!\n${-difference}`);
      console.log(`Enemies win with ${enemyScore} vs Heroes ${heroScore}`);
    } else {
      this.view.showWinResult('Tie!');
      console.log(`Tie: Heroes ${heroScore} vs Enemies ${enemyScore}`);
    }
  }

  endBonusFeature() {
    if (!this.isBonusMode) return;
    console.log('Ending bonus feature');
    this.isBonusMode = false;
    this.view.showBonusEndPopup(this.bonusTotalWin, () => {
      this.bonusState.zombies = [];
      this.bonusState.hero = null;
      this.bonusState.ammo = 0;
      this.bonusState.aimTarget = null;
      this.bonusState.bullets = [];
      this.bonusState.bonusStartTime = 0;
      this.view.cleanupBonusBattle();
      this.view.updateBonusUI(false, 0);
      this.view.showSymbols();
    });
  }
}