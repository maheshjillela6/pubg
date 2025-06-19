class ReelView {
  constructor(mapTextures, symbolTextures, spineData, symbolConfig, mapDimensions, mapNames, symbolNames, reelset) {
    this.mapTextures = mapTextures;
    this.symbolTextures = symbolTextures;
    this.spineData = spineData;
    this.symbolConfig = symbolConfig;
    this.mapDimensions = mapDimensions;
    this.mapNames = mapNames;
    this.symbolNames = symbolNames;
    this.reelset = reelset;
   
    // Containers
    this.mapContainer = new PIXI.Container();
    this.symbolContainer = new PIXI.Container();
   
    // Background sprite
    this.backgroundSprite = new PIXI.Sprite();
    this.mapContainer.addChild(this.backgroundSprite);
   
    // Map display - we'll use two sprites but manage visibility carefully
    this.currentMapSprite = new PIXI.Sprite();
    this.nextMapSprite = new PIXI.Sprite();
    this.nextMapSprite.visible = false;
    this.mapContainer.addChild(this.currentMapSprite, this.nextMapSprite);
   
    // Mask to prevent partial map visibility, adjusted to crop top 100px
    this.mapMask = new PIXI.Graphics();
    this.mapMask.beginFill(0xFFFFFF);
    this.mapMask.drawRect(0, 100, 1200, 700); // Start at y=100 to crop top 100px
    this.mapMask.endFill();
    this.mapContainer.addChild(this.mapMask);
    this.mapContainer.mask = this.mapMask;
   
    // Symbols
    this.symbolSprites = [];
    this.currentSymbols = [];
    for (let row = 0; row < 4; row++) {
      this.currentSymbols[row] = [];
      for (let col = 0; col < 5; col++) {
        this.symbolSprites.push(null);
        this.currentSymbols[row][col] = '';
      }
    }
   
    // Display properties
    this.canvasWidth = 1200;
    this.canvasHeight = 800;
    this.currentMapIndex = 0;
    this.scrollDirection = 1;
    this.isScrolling = false;
  }
 
  async setup() {
    if (!this.mapTextures || this.mapTextures.length === 0 || !this.mapDimensions) {
      console.error('No map textures or dimensions available');
      return;
    }
    // Load background texture
    try {
      const bgAtlas = await PIXI.Assets.load('assets/BgAsset.json');
      if (bgAtlas.textures && bgAtlas.textures['BgAsset']) {
        this.backgroundSprite.texture = bgAtlas.textures['BgAsset'];
        this.backgroundSprite.width = this.canvasWidth;
        this.backgroundSprite.height = this.canvasHeight;
        this.backgroundSprite.x = 0;
        this.backgroundSprite.y = 0;
        console.log('Loaded background texture: BgAsset');
      } else {
        console.warn('Background texture BgAsset not found in BgAsset.json');
      }
    } catch (error) {
      console.error('Failed to load background texture BgAsset.json:', error);
    }
    this.updateCurrentMap();
  }
 
  updateCurrentMap() {
    const canvasAspect = this.canvasWidth / this.canvasHeight;
    const currentTexture = this.mapTextures[this.currentMapIndex];
    const currentDim = this.mapDimensions[this.currentMapIndex];
   
    if (currentTexture && currentDim) {
      const currentAspect = currentDim.width / currentDim.height;
      const currentScale = currentAspect > canvasAspect ?
        this.canvasWidth / currentDim.width :
        (this.canvasHeight - 100) / currentDim.height; // Adjust for 100px crop
     
      this.currentMapSprite.texture = currentTexture;
      this.currentMapSprite.width = currentDim.width * currentScale;
      this.currentMapSprite.height = currentDim.height * currentScale;
      this.currentMapSprite.x = (this.canvasWidth - this.currentMapSprite.width) / 2;
      this.currentMapSprite.y = 100 + (this.canvasHeight - 100 - this.currentMapSprite.height) / 2; // Shift down by 100px
    }
  }
 
  prepareNextMap(direction) {
    const canvasAspect = this.canvasWidth / this.canvasHeight;
    const nextIndex = (this.currentMapIndex + direction + this.mapTextures.length) % this.mapTextures.length;
    const nextTexture = this.mapTextures[nextIndex];
    const nextDim = this.mapDimensions[nextIndex];
   
    if (nextTexture && nextDim) {
      const nextAspect = nextDim.width / nextDim.height;
      const nextScale = nextAspect > canvasAspect ?
        this.canvasWidth / nextDim.width :
        (this.canvasHeight - 100) / nextDim.height; // Adjust for 100px crop
     
      this.nextMapSprite.texture = nextTexture;
      this.nextMapSprite.width = nextDim.width * nextScale;
      this.nextMapSprite.height = nextDim.height * nextScale;
      this.nextMapSprite.x = (this.canvasWidth - this.nextMapSprite.width) / 2;
     
      // Position next map above or below current based on direction
      if (direction > 0) {
        this.nextMapSprite.y = this.currentMapSprite.y - this.nextMapSprite.height;
      } else {
        this.nextMapSprite.y = this.currentMapSprite.y + this.currentMapSprite.height;
      }
     
      this.nextMapSprite.visible = true;
    }
  }
 
  startScrollToMap(targetIndex, duration = 2000) {
    if (this.isScrolling || targetIndex === this.currentMapIndex) return;
   
    // Determine scroll direction (shortest path)
    const diff = (targetIndex - this.currentMapIndex + this.mapTextures.length) % this.mapTextures.length;
    this.scrollDirection = diff <= this.mapTextures.length / 2 ? 1 : -1;
   
    // Prepare the next map
    this.prepareNextMap(this.scrollDirection);
    this.isScrolling = true;
   
    // Calculate animation properties
    const startY = this.currentMapSprite.y;
    const nextStartY = this.nextMapSprite.y;
    const currentEndY = this.scrollDirection > 0 ?
      startY + this.currentMapSprite.height :
      startY - this.currentMapSprite.height;
    const nextEndY = 100 + (this.canvasHeight - 100 - this.nextMapSprite.height) / 2; // Shift down by 100px

    // 1. Setup pivot and position for zoom effect
    this.mapContainer.pivot.set(this.canvasWidth / 2, this.canvasHeight / 2);
    this.mapContainer.position.set(this.canvasWidth / 2, this.canvasHeight / 2);
    this.mapContainer.scale.set(1); // Reset before zooming

    // 2. Zoom in slightly to create camera effect
    gsap.to(this.mapContainer.scale, {
      x: 1.15,
      y: 1.15,
      duration: 0.5,
      ease: "power1.inOut"
    });

    // 3. Optional camera drift
    gsap.to(this.mapContainer.position, {
      x: "+=5",
      y: "-=5",
      duration: 0.5,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut"
    });

    // 2. Scroll Backgrounds
    gsap.to(this.currentMapSprite, {
      y: currentEndY,
      duration: duration / 1000,
      ease: "power2.inOut"
    });

    gsap.to(this.nextMapSprite, {
      y: nextEndY,
      duration: duration / 1000,
      ease: "power2.inOut"
    });

    // 3. Zoom Out and settle camera after scroll
    gsap.to(this.mapContainer.scale, {
      x: 1,
      y: 1,
      duration: 0.5,
      ease: "power1.inOut",
      delay: (duration - 500) / 1000
    });

    gsap.delayedCall(duration / 1000, () => {
      this.completeScroll(targetIndex);
    });

    this.selectRandomSymbols();
  }
 
  completeScroll(targetIndex) {
    // Update current map index
    this.currentMapIndex = targetIndex;
   
    // Swap sprites
    this.currentMapSprite.texture = this.nextMapSprite.texture;
    this.currentMapSprite.width = this.nextMapSprite.width;
    this.currentMapSprite.height = this.nextMapSprite.height;
    this.currentMapSprite.y = 100 + (this.canvasHeight - 100 - this.currentMapSprite.height) / 2; // Shift down by 100px
    this.currentMapSprite.x = (this.canvasWidth - this.currentMapSprite.width) / 2;
   
    // Hide next map sprite
    this.nextMapSprite.visible = false;
    this.isScrolling = false;

    this.currentMapSprite.alpha = 1;
    this.nextMapSprite.alpha = 1;
    this.mapContainer.scale.set(1); // Reset zoom
  }
 
  createSymbolSprite(symbol) {
    const config = this.symbolConfig[symbol] || { width: 100, height: 100 };
   
    // Try Spine animation first
    if (this.spineData[symbol]) {
      try {
        const spine = new PIXI.spine.Spine(this.spineData[symbol]);
        const animationName = `${symbol}_land`;
        if (spine.state.hasAnimation(animationName)) {
          spine.state.setAnimation(0, animationName, true);
          spine.autoUpdate = true;
          const bounds = spine.getLocalBounds();
          const scale = Math.min(
            config.width / (bounds.width || config.width),
            config.height / (bounds.height || config.height)
          );
          spine.scale.set(scale);
          return spine;
        }
      } catch (error) {
        console.error(`Spine error for ${symbol}:`, error);
      }
    }
   
    // Fall back to static texture
    if (this.symbolTextures[symbol]) {
      const sprite = new PIXI.Sprite(this.symbolTextures[symbol]);
      sprite.width = config.width;
      sprite.height = config.height;
      sprite.anchor.set(0.5);
      return sprite;
    }
   
    console.warn(`No assets for symbol: ${symbol}`);
    return null;
  }
 
  selectRandomSymbols() {
    const matrixIndex = Math.floor(Math.random() * this.reelset.length);
    const selectedMatrix = this.reelset[matrixIndex];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        this.currentSymbols[row][col] = selectedMatrix[row][col];
      }
    }
  }
 
  renderSymbols(symbols) {
    // Clear existing symbols
    this.symbolContainer.removeChildren();
    this.symbolSprites = [];
   
    // Create new symbols
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const symbol = symbols[row][col];
        const sprite = this.createSymbolSprite(symbol);
        if (sprite) {
          sprite.x = 260 + col * 200;
          sprite.y = 240 + row * 130;
         
          // Add slight random offset for certain symbols
          if (symbol.startsWith('a') || symbol.startsWith('o')) {
            sprite.x += Math.random() * 160 - 80;
            sprite.y += Math.random() * 60 - 30;
          }
         
          this.symbolContainer.addChild(sprite);
          this.symbolSprites.push(sprite);
        }
      }
    }
  }
 
  getMapContainer() {
    return this.mapContainer;
  }
 
  getSymbolContainer() {
    return this.symbolContainer;
  }
 
  getCurrentSymbols() {
    return this.currentSymbols;
  }
 
  destroy() {
    this.mapContainer.destroy({ children: true });
    this.symbolContainer.destroy({ children: true });
  }
}