class GameController {
  constructor() {
    this.model = new GameModel();
    this.view = new GameView();
    this.isSpinning = false;
    this.currentTheme = 'theme1'; // Default theme
  }

  async init() {
    await this.view.init();
    const success = await this.model.loadAssets(this.currentTheme);
    if (!success) {
      console.error('Failed to load game assets.');
      return;
    }
    this.model.setupReels(this.currentTheme);
    this.view.addReel(this.model.reels[0]);
    this.view.setupUI(
      () => this.startSpin(),
      (theme) => this.changeTheme(theme)
    );
    this.view.app.ticker.add(() => this.update());
  }

  async changeTheme(theme) {
    if (this.isSpinning) {
      console.warn('Cannot change theme: Spin in progress.');
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
      return;
    }
    this.model.setupReels(theme);
    this.view.updateReel(this.model.reels[0]);
    this.view.showSymbols();
  }

  startSpin() {
    if (this.isSpinning) {
      console.warn('Cannot spin: Already spinning.');
      return;
    }
    this.isSpinning = true;
    this.view.hideSymbols();
    const mapTextureIndex = this.model.getNextMapIndex();
    console.log(`Spinning to map: ${this.model.mapNames[mapTextureIndex]} (index: ${mapTextureIndex})`);
    this.model.reels[0].spin(mapTextureIndex, this.model.spinDurationMs);
    setTimeout(() => this.stopSpin(), this.model.spinDurationMs);
  }

  stopSpin() {
    this.model.reels[0].stop();
    this.isSpinning = false;
    const mapTextureIndex = this.model.spinMapIndices[this.model.currentMapIndex];
    console.log(`Stopped on map: ${this.model.mapNames[mapTextureIndex]}`);

    // Get current symbols and update rendering
    const symbols = this.model.reels[0].getCurrentSymbols();
    console.log('Landed symbols:', symbols);
    this.model.reels[0].updateSymbols(symbols);
    this.view.showSymbols();
  }

  update() {
    this.model.reels.forEach((reel) => reel.update(this.view.app.ticker.deltaMS));
  }
}