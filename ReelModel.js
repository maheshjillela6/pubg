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
    this.spinStartTime = 0;
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
    const totalHeight = this.mapDimensions.reduce((sum, dim) => {
      const atlasWidth = dim?.width || 600;
      const atlasHeight = dim?.height || 600;
      const atlasAspect = atlasWidth / atlasHeight;
      const canvasAspect = 1000 / 600;
      const scale = atlasAspect > canvasAspect ? 1000 / atlasWidth : 600 / atlasHeight;
      return sum + atlasHeight * scale;
    }, 0);
    // Add extra cycles to maintain speed
    const baseDuration = 1200; // Original duration
    const extraCycles = Math.floor(duration / baseDuration); // 1 cycle for 2000ms
    targetY += totalHeight * extraCycles;
    this.targetY = targetY;
    // Adjust for upward movement (bottom-up)
    if (this.targetY > this.spinStartY) {
      this.targetY -= totalHeight * Math.ceil((this.targetY - this.spinStartY) / totalHeight);
    }
    this.spinDuration = duration;
    this.spinStartTime = performance.now();
    this.velocity = (this.targetY - this.spinStartY) / duration;
    console.log(`Spinning bottom-up: startY=${this.spinStartY}, targetY=${this.targetY}, targetIndex=${targetIndex}, velocity=${this.velocity}, extraCycles=${extraCycles}`);
    this.reelView.selectRandomSymbols();
  }

  stop() {
    this.velocity = 0;
    const totalHeight = this.mapDimensions.reduce((sum, dim) => {
      const atlasWidth = dim?.width || 600;
      const atlasHeight = dim?.height || 600;
      const atlasAspect = atlasWidth / atlasHeight;
      const canvasAspect = 1000 / 600;
      const scale = atlasAspect > canvasAspect ? 1000 / atlasWidth : 600 / atlasHeight;
      return sum + atlasHeight * scale;
    }, 0);
    this.currentY = this.targetY % totalHeight;
    if (this.currentY < 0) this.currentY += totalHeight;
    console.log(`Stopped at currentY=${this.currentY}, targetIndex=${this.targetIndex}`);
    this.reelView.updatePosition(this.currentY, this.targetIndex);
  }

  update() {
    if (this.velocity === 0) return;
    const currentTime = performance.now();
    const elapsed = currentTime - this.spinStartTime;
    if (elapsed >= this.spinDuration) {
      this.stop();
      return;
    }
    // Smooth interpolation with quintic ease-in-out
    const t = Math.min(elapsed / this.spinDuration, 1);
    const ease = t * t * t * (t * (t * 6 - 15) + 10); // Quintic ease-in-out
    this.currentY = this.spinStartY + (this.targetY - this.spinStartY) * ease;
    const totalHeight = this.mapDimensions.reduce((sum, dim) => {
      const atlasWidth = dim?.width || 600;
      const atlasHeight = dim?.height || 600;
      const atlasAspect = atlasWidth / atlasHeight;
      const canvasAspect = 1000 / 600;
      const scale = atlasAspect > canvasAspect ? 1000 / atlasWidth : 600 / atlasHeight;
      return sum + atlasHeight * scale;
    }, 0);
    this.currentY = this.currentY % totalHeight;
    if (this.currentY < 0) this.currentY += totalHeight;
    console.log(`Updating spin: currentY=${this.currentY}, elapsed=${elapsed}/${this.spinDuration}`);
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