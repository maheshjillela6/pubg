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
    // Predefined reelset with 5x4 matrices
    this.reelset = [
      [
        ['a', 'b', 'c', 'd', 'e'],
        ['f', 'a', 'b', 'c', 'd'],
        ['e', 'f', 'a', 'b', 'c'],
        ['d', 'e', 'f', 'a', 'b']
      ],
      [
        ['c', 'd', 'e', 'f', 'a'],
        ['b', 'c', 'd', 'e', 'f'],
        ['a', 'b', 'c', 'd', 'e'],
        ['f', 'a', 'b', 'c', 'd']
      ],
      [
        ['e', 'f', 'a', 'b', 'c'],
        ['d', 'e', 'f', 'a', 'b'],
        ['c', 'd', 'e', 'f', 'a'],
        ['b', 'c', 'd', 'e', 'f']
      ],
      [
        ['a', 'b', 'c', 'd', 'e'],
        ['f', 'a', 'b', 'c', 'd'],
        ['e', 'f', 'a', 'b', 'c'],
        ['d', 'e', 'f', 'a', 'b']
      ],
      [
        ['c', 'd', 'e', 'f', 'a'],
        ['b', 'c', 'd', 'e', 'f'],
        ['a', 'b', 'c', 'd', 'e'],
        ['f', 'a', 'b', 'c', 'd']
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
    // Create enough sprites to cover the canvas height (600) plus buffer
    const maxHeight = Math.max(...this.mapDimensions.map(dim => dim?.height || 600));
    const numSprites = Math.ceil(600 / maxHeight) + 2;
    let cumulativeY = -maxHeight;
    for (let i = -numSprites; i <= numSprites; i++) {
      const textureIndex = (i + this.mapTextures.length) % this.mapTextures.length;
      if (!this.mapTextures[textureIndex]) {
        console.warn(`Skipping sprite ${i} due to missing texture at index ${textureIndex}`);
        continue;
      }
      const sprite = new PIXI.Sprite(this.mapTextures[textureIndex]);
      sprite.y = cumulativeY;
      sprite.width = this.mapDimensions[textureIndex]?.width || 600;
      sprite.height = this.mapDimensions[textureIndex]?.height || 600;
      sprite.anchor.set(0, 0);
      this.mapSprites.push(sprite);
      this.mapContainer.addChild(sprite);
      console.log(`Setup map sprite ${i} at y=${sprite.y}, width=${sprite.width}, height=${sprite.height}, texture=${this.mapNames[textureIndex]}`);
      cumulativeY += this.mapDimensions[textureIndex]?.height || 600;
    }

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
          sprite.scale.set(scale);
          sprite.position.set(0, 0);
          console.log(`Created Spine animation for symbol: ${symbol}, animation: ${animationName}, size: ${config.width}x${config.height}, scale: ${scale}`);
          return spine;
        } catch (error) {
          console.error(`Failed to set animation ${animationName} for symbol ${symbol}:`, error);
        }
      }
    }
    if (this.symbolTextures[symbol]) {
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
          sprite.x = 150 + col * 120;
          sprite.y = 100 + row * 120;
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
    const totalHeight = this.mapDimensions.reduce((sum, dim) => sum + (dim?.height || 600), 0);
    const offsetY = currentY % totalHeight;

    if (targetIndex >= 0) {
      // Stopped: Show only the target map
      this.mapSprites.forEach((sprite, index) => {
        if (index === 0) {
          sprite.texture = this.mapTextures[targetIndex] || PIXI.Texture.EMPTY;
          sprite.width = this.mapDimensions[targetIndex]?.width || 600;
          sprite.height = this.mapDimensions[targetIndex]?.height || 600;
          sprite.y = (600 - sprite.height) / 2; // Center vertically
          sprite.visible = true;
          console.log(`Stopped on map: texture=${this.mapNames[targetIndex]}, y=${sprite.y}, width=${sprite.width}, height=${sprite.height}`);
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
        sprite.width = this.mapDimensions[textureIndex]?.width || 600;
        sprite.height = this.mapDimensions[textureIndex]?.height || 600;
        sprite.y = cumulativeY;
        sprite.visible = true;
        console.log(`Spinning map: sprite=${index}, texture=${this.mapNames[textureIndex]}, y=${sprite.y}, width=${sprite.width}, height=${sprite.height}`);
        cumulativeY += this.mapDimensions[textureIndex]?.height || 600;
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