class ReelView {
  constructor(mapTextures, symbolTextures, spineData, symbolConfig, mapDimensions, mapNames, symbolNames) {
    this.mapTextures = mapTextures;
    this.symbolTextures = symbolTextures;
    this.spineData = spineData;
    this.symbolConfig = symbolConfig;
    this.mapDimensions = mapDimensions;
    this.mapNames = mapNames;
    this.symbolNames = symbolNames;
    this.mapContainer = new PIXI.Container();
    this.symbolContainer = new PIXI.Container();
    this.mapSprites = [];
    this.symbolSprites = [];
    this.currentSymbols = [];
    this.canvasWidth = 1200;
    this.canvasHeight = 800;
    // Predefined reelset with 5x4 matrices
    this.reelset = [
      [
        ['a', 'b1', 'b4', 'b', 'e'],
        ['f', 'a1', 'b2', 'c', 'd'],
        ['e', 'f', 'a', 'b3', 'c1'],
        ['d', 'e', 'f', 'c', 'b']
      ],
      [
        ['a', 'b1', 'b4', 'b', 'e'],
        ['f', 'a1', 'b2', 'c', 'd'],
        ['e', 'f', 'a', 'b3', 'c1'],
        ['d', 'e', 'f', 'c', 'b']
      ],
      [
        ['a', 'b1', 'b4', 'b', 'e'],
        ['f', 'a1', 'b2', 'c', 'd'],
        ['e', 'f', 'a', 'b3', 'c1'],
        ['d', 'e', 'f', 'c', 'b']
      ],
      [
        ['a', 'b1', 'b4', 'b', 'e'],
        ['f', 'a1', 'b2', 'c', 'd'],
        ['e', 'f', 'a', 'b3', 'c1'],
        ['d', 'e', 'f', 'c', 'b']
      ]
    ];
  }

  setup() {
    if (!this.mapTextures || this.mapTextures.length === 0 || !this.mapDimensions) {
      console.error('No map textures or dimensions available for setup');
      return;
    }
    this.mapSprites = [];
    this.mapContainer.removeChildren();
    // Scale maps to fit 1000x600 canvas, preserving aspect ratio
    const canvasAspect = this.canvasWidth / this.canvasHeight; // 1000/600 = 1.667
    const minHeight = Math.min(...this.mapDimensions.map(dim => dim?.height || 600));
    const numSprites = Math.ceil(this.canvasHeight / minHeight) + 4; // Increased for smoother cycling
    let cumulativeY = -(Math.max(...this.mapDimensions.map(dim => dim?.height || 600)));
    for (let i = -numSprites; i <= numSprites; i++) {
      const textureIndex = (i + this.mapTextures.length) % this.mapTextures.length;
      if (!this.mapTextures[textureIndex]) {
        console.warn(`Skipping sprite ${i} due to missing texture at index ${textureIndex}`);
        continue;
      }
      const sprite = new PIXI.Sprite(this.mapTextures[textureIndex]);
      const atlasWidth = this.mapDimensions[textureIndex]?.width || 600;
      const atlasHeight = this.mapDimensions[textureIndex]?.height || 600;
      const atlasAspect = atlasWidth / atlasHeight;
      let scale;
      if (atlasAspect > canvasAspect) {
        scale = this.canvasWidth / atlasWidth;
      } else {
        scale = this.canvasHeight / atlasHeight;
      }
      sprite.width = atlasWidth * scale;
      sprite.height = atlasHeight * scale;
      sprite.x = (this.canvasWidth - sprite.width) / 2;
      sprite.y = cumulativeY;
      sprite.anchor.set(0, 0);
      this.mapSprites.push(sprite);
      this.mapContainer.addChild(sprite);
      console.log(`Setup map sprite ${i} at x=${sprite.x}, y=${sprite.y}, width=${sprite.width}, height=${sprite.height}, texture=${this.mapNames[textureIndex]}`);
      cumulativeY += sprite.height;
    }
    this.mapContainer.x = 0;
    this.mapContainer.y = 0;
    console.log(`Map container setup at x=${this.mapContainer.x}, y=${this.mapContainer.y}`);

    // Initialize 5x4 grid with empty symbols
    for (let row = 0; row < 4; row++) {
      this.currentSymbols[row] = [];
      for (let col = 0; col < 5; col++) {
        this.symbolSprites.push(null);
        this.currentSymbols[row][col] = '';
      }
    }
  }

  getRandomSymbol() {
    const index = Math.floor(Math.random() * this.symbolNames.length);
    return this.symbolNames[index];
  }

  createSymbolSprite(symbol) {
    const config = this.symbolConfig[symbol] || { width: 100, height: 100 };
    if (this.spineData[symbol]) {
      const spine = new PIXI.spine.Spine(this.spineData[symbol]);
      const animationName = `${symbol}_land`;
      if (spine.state.hasAnimation(animationName)) {
        try {
          spine.state.setAnimation(0, animationName, true);
          spine.autoUpdate = true;
          spine.update(0);
          const bounds = spine.getLocalBounds();
          const scaleX = config.width / (bounds.width || config.width);
          const scaleY = config.height / (bounds.height || config.height);
          const scale = Math.min(scaleX, scaleY);
          spine.scale.set(scale);
          spine.position.set(0, 0);
          console.log(`Created Spine animation for symbol: ${symbol}, animation: ${animationName}, size: ${config.width}x${config.height}, scale: ${scale}`);
          return spine;
        } catch (error) {
          console.error(`Failed to set animation ${animationName} for symbol ${symbol}:`, error);
        }
      }
    }
    if (this.symbolTextures[symbol]) {
      console.log('symbol Name : ' + symbol);
      const sprite = new PIXI.Sprite(this.symbolTextures[symbol]);
      sprite.width = config.width;
      sprite.height = config.height;
      console.log(`Created static sprite for symbol: ${symbol}, size: ${config.width}x${config.height}`);
      return sprite;
    }
    console.warn(`No valid asset (Spine animation or texture) for symbol: ${symbol}`);
    return null;
  }

  selectRandomSymbols() {
    const matrixIndex = Math.floor(Math.random() * this.reelset.length);
    const selectedMatrix = this.reelset[matrixIndex];
    console.log(`Selected reelset matrix index: ${matrixIndex}`, selectedMatrix);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        this.currentSymbols[row][col] = selectedMatrix[row][col];
      }
    }
  }

  renderSymbols(symbols) {
    this.symbolSprites.forEach((sprite) => {
      if (sprite) {
        this.symbolContainer.removeChild(sprite);
      }
    });
    this.symbolSprites = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const symbol = symbols[row][col];
        const sprite = this.createSymbolSprite(symbol);
        if (sprite) {
          sprite.x = 300 + col * 120;
          sprite.y = 260 + row * 120;
          if (sprite instanceof PIXI.Sprite) {
            sprite.anchor.set(0.5);
          }
          this.symbolContainer.addChild(sprite);
          console.log(`Rendered symbol ${symbol} at row ${row}, col ${col} with ${sprite instanceof PIXI.spine.Spine ? 'Spine' : 'Sprite'}`);
        }
        this.symbolSprites.push(sprite);
      }
    }
  }

  updatePosition(currentY, targetIndex) {
    if (!this.mapTextures || this.mapTextures.length === 0 || !this.mapDimensions) {
      console.error('No map textures or dimensions available for updatePosition');
      return;
    }
    const canvasAspect = this.canvasWidth / this.canvasHeight;
    const totalHeight = this.mapDimensions.reduce((sum, dim) => {
      const atlasWidth = dim?.width || 600;
      const atlasHeight = dim?.height || 600;
      const atlasAspect = atlasWidth / atlasHeight;
      const scale = atlasAspect > canvasAspect ? this.canvasWidth / atlasWidth : this.canvasHeight / atlasHeight;
      return sum + atlasHeight * scale;
    }, 0);
    const offsetY = currentY % totalHeight;

    if (targetIndex >= 0) {
      // Stopped: Show only the target map, scaled to fit canvas
      this.mapSprites.forEach((sprite, index) => {
        if (index === 0) {
          sprite.texture = this.mapTextures[targetIndex] || PIXI.Texture.EMPTY;
          const atlasWidth = this.mapDimensions[targetIndex]?.width || 600;
          const atlasHeight = this.mapDimensions[targetIndex]?.height || 600;
          const atlasAspect = atlasWidth / atlasHeight;
          let scale;
          if (atlasAspect > canvasAspect) {
            scale = this.canvasWidth / atlasWidth;
          } else {
            scale = this.canvasHeight / atlasHeight;
          }
          sprite.width = atlasWidth * scale;
          sprite.height = atlasHeight * scale;
          sprite.x = (this.canvasWidth - sprite.width) / 2;
          sprite.y = (this.canvasHeight - sprite.height) / 2;
          sprite.visible = true;
          console.log(`Stopped on map: texture=${this.mapNames[targetIndex]}, x=${sprite.x}, y=${sprite.y}, width=${sprite.width}, height=${sprite.height}`);
        } else {
          sprite.visible = false;
        }
      });
    } else {
      // Spinning: Cycle through maps smoothly
      let cumulativeY = -offsetY;
      this.mapSprites.forEach((sprite, index) => {
        const textureIndex = (index + Math.floor(offsetY / totalHeight) * this.mapTextures.length) % this.mapTextures.length;
        if (!this.mapTextures[textureIndex]) {
          sprite.visible = false;
          console.warn(`Hiding sprite ${index} due to missing texture at index ${textureIndex}`);
          return;
        }
        sprite.texture = this.mapTextures[textureIndex];
        const atlasWidth = this.mapDimensions[textureIndex]?.width || 600;
        const atlasHeight = this.mapDimensions[textureIndex]?.height || 600;
        const atlasAspect = atlasWidth / atlasHeight;
        let scale;
        if (atlasAspect > canvasAspect) {
          scale = this.canvasWidth / atlasWidth;
        } else {
          scale = this.canvasHeight / atlasHeight;
        }
        sprite.width = atlasWidth * scale;
        sprite.height = atlasHeight * scale;
        sprite.x = (this.canvasWidth - sprite.width) / 2;
        sprite.y = cumulativeY;
        sprite.visible = true;
        console.log(`Spinning map: sprite=${index}, texture=${this.mapNames[textureIndex]}, x=${sprite.x}, y=${sprite.y}, width=${sprite.width}, height=${sprite.height}`);
        cumulativeY += sprite.height;
      });
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
}