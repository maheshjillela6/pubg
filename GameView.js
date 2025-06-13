class GameView {
  constructor() {
    this.app = new PIXI.Application({
      width: 1000, // Increased to accommodate buttons
      height: 600,
      backgroundColor: 0x000000,
    });
    this.reelContainer = new PIXI.Container();
    this.symbolContainer = new PIXI.Container();
  }

  async init() {
    document.body.appendChild(this.app.view);
    this.app.stage.addChild(this.reelContainer, this.symbolContainer);
    this.symbolContainer.visible = true;
  }

  setupUI(onSpin, onThemeChange) {
    // Spin button
    const button = new PIXI.Graphics()
      .beginFill(0xFF5722)
      .drawRect(0, 0, 150, 50)
      .endFill();
    button.x = 750; // Right of grid
    button.y = 250;
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const buttonText = new PIXI.Text('Spin', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xffffff,
    });
    buttonText.anchor.set(0.5);
    buttonText.x = 75;
    buttonText.y = 25;
    button.addChild(buttonText);
    button.on('pointerdown', onSpin);
    this.app.stage.addChild(button);

    // Theme selector (HTML element handled in GameController)
    const themeSelector = document.getElementById('themeSelector');
    themeSelector.addEventListener('change', (e) => onThemeChange(e.target.value));
  }

  addReel(reelModel) {
    this.reelContainer.addChild(reelModel.getMapContainer());
    this.symbolContainer.addChild(reelModel.getSymbolContainer());
  }

  updateReel(reelModel) {
    this.reelContainer.removeChildren();
    this.symbolContainer.removeChildren();
    this.reelContainer.addChild(reelModel.getMapContainer());
    this.symbolContainer.addChild(reelModel.getSymbolContainer());
  }

  hideSymbols() {
    this.symbolContainer.visible = false;
  }

  showSymbols() {
    this.symbolContainer.visible = true;
  }
}