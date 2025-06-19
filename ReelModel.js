class ReelModel {
  constructor(mapTextures, symbolTextures, spineData, symbolConfig, mapDimensions, mapNames, symbolNames, reelset) {
    this.mapTextures = mapTextures;
    this.symbolTextures = symbolTextures;
    this.spineData = spineData;
    this.symbolConfig = symbolConfig;
    this.mapDimensions = mapDimensions;
    this.mapNames = mapNames;
    this.symbolNames = symbolNames;
    this.reelset = reelset;
   // this.animateCameraMove = this.animateCameraMove.bind(this);
    this.reelView = new ReelView(
      mapTextures,
      symbolTextures,
      spineData,
      symbolConfig,
      mapDimensions,
      mapNames,
      symbolNames,
      reelset
    );
  }
 
  setup() {
    this.reelView.setup();
  }
 
  spin(targetIndex, duration, onStopCallback) {
    this.reelView.startScrollToMap(targetIndex, duration);
    this.reelView.selectRandomSymbols();
    this.onStopCallback = onStopCallback;

    this.spinStartTime = performance.now();

    PIXI.Ticker.shared.add(this.animateCameraMove);
   
    // Call stop callback after animation completes
    setTimeout(() => {
      if (this.onStopCallback) {
        this.onStopCallback();
      }
    }, duration);



  }
 
  stop() {
    // Handled in spin() with timeout
  }
 
  update() {
    // Animation is handled by GSAP
  }
 
  updateSymbols(symbols) {
    this.reelView.renderSymbols(symbols);
  }
 
  getMapContainer() {
    return this.reelView.getMapContainer();
  }
 
  getSymbolContainer() {
    return this.reelView.getSymbolContainer();
  }
 
  getCurrentSymbols() {
    return this.reelView.getCurrentSymbols();
  }



}
 