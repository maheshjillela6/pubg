class GameView {
  constructor() {
    this.app = new PIXI.Application({
      width: 1000,
      height: 600,
      backgroundColor: 0x000000
    });
    this.reelViews = [];
    this.uiContainer = new PIXI.Container();
    this.mapContainer = new PIXI.Container();
    this.symbolContainer = new PIXI.Container();
    this.app.stage.addChild(this.mapContainer, this.symbolContainer, this.uiContainer);
    this.themeSelector = null; // Reference to HTML dropdown
  }

  async init() {
    document.body.appendChild(this.app.view);
    await this.loadFonts();
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

  setupUI(spinCallback, themeChangeCallback) {
    this.uiContainer.removeChildren();
    if (this.themeSelector) {
      this.themeSelector.remove(); // Clean up existing dropdown
    }

    // Spin button
    const spinButton = new PIXI.Graphics();
    spinButton.beginFill(0x00ff00);
    spinButton.drawRoundedRect(0, 0, 100, 50, 10);
    spinButton.endFill();
    spinButton.x = 400; // Centered below grid
    spinButton.y = 480; // Below grid (grid ends at y=460)
    spinButton.interactive = true;
    spinButton.buttonMode = true;
    spinButton.on('pointerdown', spinCallback);

    const spinText = new PIXI.Text('Spin', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      fill: 0x000000,
      align: 'center'
    });
    spinText.anchor.set(0.5);
    spinText.x = 50;
    spinText.y = 25;
    spinButton.addChild(spinText);

    this.uiContainer.addChild(spinButton);

    // Theme selector dropdown (HTML)
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
    this.themeSelector.style.left = `${this.app.view.offsetLeft + 510}px`; // Beside spin button
    this.themeSelector.style.top = `${this.app.view.offsetTop + 480}px`; // Below grid
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

    console.log('UI setup: Spin button at x=400, y=480, size=100x50; Theme dropdown at x=510, y=480, size=150x40');
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