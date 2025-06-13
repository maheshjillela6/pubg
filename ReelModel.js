class ReelModel {
  constructor(mapTextures, symbolTextures, spineData, symbolConfig, mapDimensions, mapNames, symbolNames) {
    this.mapTextures = mapTextures;
    this.symbolTextures = symbolTextures;
    this.spineData = spineData;
    this.symbolConfig = symbolConfig;
    this.mapDimensions = mapDimensions;
    this.mapNames = mapNames;
    this.symbolNames = symbolNames;
    this.velocity = 0;
    this.currentY = 0;
    this.targetY = 0;
    this.targetIndex = 0;
    this.spinStartY = 0;
    this.spinProgress = 0;
    this.spinDuration = 0;
    this.reelView = new ReelView(mapTextures, symbolTextures, spineData, symbolConfig, mapDimensions, mapNames, symbolNames);
  }

  setup() {
    this.reelView.setup();
  }

  spin(targetIndex, duration) {
    this.spinStartY = this.currentY;
    this.targetIndex = targetIndex;
    // Calculate targetY based on cumulative heights up to targetIndex
    let targetY = 0;
    for (let i = 0; i < targetIndex; i++) {
      targetY += this.mapDimensions[i]?.height || 600;
    }
    this.targetY = targetY;
    const totalHeight = this.mapDimensions.reduce((sum, dim) => sum + (dim?.height || 600), 0);
    // Adjust for upward movement (bottom-up)
    if (this.targetY > this.spinStartY) {
      this.targetY -= totalHeight * Math.ceil((this.targetY - this.spinStartY) / totalHeight);
    }
    this.spinDuration = duration;
    this.spinProgress = 0;
    this.velocity = (this.targetY - this.spinStartY) / duration;
    console.log(`Spinning bottom-up: startY=${this.spinStartY}, targetY=${this.targetY}, targetIndex=${targetIndex}, velocity=${this.velocity}`);
    this.reelView.selectRandomSymbols();
  }

  stop() {
    this.velocity = 0;
    const totalHeight = this.mapDimensions.reduce((sum, dim) => sum + (dim?.height || 600), 0);
    this.currentY = this.targetY % totalHeight;
    if (this.currentY < 0) this.currentY += totalHeight;
    console.log(`Stopped at currentY=${this.currentY}, targetIndex=${this.targetIndex}`);
    this.reelView.updatePosition(this.currentY, this.targetIndex);
  }

  update(delta) {
    if (this.velocity === 0) return;
    this.spinProgress += delta;
    if (this.spinProgress >= this.spinDuration) {
      this.stop();
      return;
    }
    // Smooth interpolation
    const t = Math.min(this.spinProgress / this.spinDuration, 1);
    const ease = t * t * (3 - 2 * t); // Ease-in-out
    this.currentY = this.spinStartY + (this.targetY - this.spinStartY) * ease;
    const totalHeight = this.mapDimensions.reduce((sum, dim) => sum + (dim?.height || 600), 0);
    this.currentY = this.currentY % totalHeight;
    if (this.currentY < 0) this.currentY += totalHeight;
    console.log(`Updating spin: currentY=${this.currentY}, progress=${this.spinProgress}/${this.spinDuration}`);
    this.reelView.updatePosition(this.currentY, -1);
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