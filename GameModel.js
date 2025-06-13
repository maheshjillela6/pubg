class GameModel {
  constructor() {
    this.reels = [];
    this.mapTextures = {};
    this.mapDimensions = {}; // Store width and height per theme
    this.symbolTextures = {};
    this.spineData = {};
    this.themes = {
      theme1: {
        mapNames: ['map1_theme1', 'map2_theme1', 'map3_theme1', 'map4_theme1', 'map5_theme1'],
        mapAtlas: 'maps_theme1.json',
        symbolAtlas: 'assets_theme1.json',
        spineAsset: 'a_theme1.json'
      },
      theme2: {
        mapNames: ['map1_theme2', 'map2_theme2', 'map3_theme2', 'map4_theme2', 'map5_theme2'],
        mapAtlas: 'maps_theme2.json',
        symbolAtlas: 'assets_theme2.json',
        spineAsset: 'a_theme2.json'
      },
      theme3: {
        mapNames: ['map1_theme3', 'map2_theme3', 'map3_theme3', 'map4_theme3', 'map5_theme3'],
        mapAtlas: 'maps_theme3.json',
        symbolAtlas: 'assets_theme3.json',
        spineAsset: 'a_theme3.json'
      },
      theme4: {
        mapNames: ['map1_theme4', 'map2_theme4', 'map3_theme4', 'map4_theme4', 'map5_theme4'],
        mapAtlas: 'maps_theme4.json',
        symbolAtlas: 'assets_theme4.json',
        spineAsset: 'a_theme4.json'
      }
    };
    this.symbolNames = ['a', 'b', 'c', 'd', 'e', 'f'];
    this.spinMapIndices = [0, 1, 2];
    this.spinDurationMs = 1000;
    this.currentMapIndex = 0;
    this.symbolConfig = {
      a: { width: 100, height: 100 },
      b: { width: 80, height: 80 },
      c: { width: 90, height: 90 },
      d: { width: 70, height: 70 },
      e: { width: 85, height: 85 },
      f: { width: 75, height: 75 }
    };
    this.mapNames = this.themes.theme1.mapNames;
  }

  async loadAssets(theme) {
    try {
      const themeConfig = this.themes[theme];
      if (!themeConfig) {
        console.error(`Invalid theme: ${theme}`);
        return false;
      }

      // Initialize theme-specific storage
      this.mapTextures[theme] = [];
      this.mapDimensions[theme] = [];
      this.symbolTextures[theme] = {};
      this.spineData[theme] = {};

      // Load map atlas
      const mapAtlas = await PIXI.Assets.load(themeConfig.mapAtlas);
      const atlasData = mapAtlas.data || mapAtlas.spritesheet?.data || (await fetch(themeConfig.mapAtlas).then(res => res.json()));
      themeConfig.mapNames.forEach((name, index) => {
        const texture = mapAtlas.textures[name];
        if (texture) {
          this.mapTextures[theme][index] = texture;
          const frame = atlasData.frames[name]?.frame;
          const width = frame ? frame.w : 600;
          const height = frame ? frame.h : 600;
          this.mapDimensions[theme][index] = { width, height };
          console.log(`Loaded map texture: ${name} for theme ${theme} at index ${index}, width=${width}, height=${height}`);
        } else {
          console.warn(`Map texture ${name} not found in ${themeConfig.mapAtlas}`);
          this.mapTextures[theme][index] = null;
          this.mapDimensions[theme][index] = { width: 600, height: 600 };
        }
      });
      if (this.mapTextures[theme].filter(t => t).length < this.spinMapIndices.length) {
        console.error(`Insufficient valid map textures for theme ${theme}: Required ${this.spinMapIndices.length}, Loaded ${this.mapTextures[theme].filter(t => t).length}`);
        return false;
      }

      // Load symbol sprite atlas
      const symbolAtlas = await PIXI.Assets.load(themeConfig.symbolAtlas);
      this.symbolNames.forEach((name) => {
        const textureName = `${name}_${theme}`;
        const texture = symbolAtlas.textures[textureName];
        if (texture) {
          this.symbolTextures[theme][name] = texture;
          console.log(`Loaded static texture for symbol: ${textureName}`);
        } else {
          console.warn(`Symbol texture ${textureName} not found in ${themeConfig.symbolAtlas}`);
        }
      });

      // Load Spine data for symbol 'a'
      try {
        const spineAtlas = await PIXI.Assets.load({
          src: themeConfig.spineAsset,
          data: { type: 'spine' }
        });
        const name = 'a';
        const spine = spineAtlas.spineData;
        if (spine) {
          const animationName = `${name}_land`;
          const hasAnimation = spine.animations.some((anim) => anim.name === animationName);
          if (hasAnimation) {
            this.spineData[theme][name] = spine;
            console.log(`Loaded Spine data for symbol: ${name} with animation: ${animationName} for theme ${theme}`);
          } else {
            console.warn(`Spine data for ${name} loaded, but animation ${animationName} not found in ${themeConfig.spineAsset}`);
          }
        } else {
          console.warn(`Spine data for ${name} not found in ${themeConfig.spineAsset}`);
        }
      } catch (error) {
        console.warn(`Failed to load Spine data for symbol a in theme ${theme}:`, error);
      }

      // Log no Spine data for other symbols
      this.symbolNames.filter((name) => name !== 'a').forEach((name) => {
        console.log(`No Spine animation available for symbol: ${name} in theme ${theme}`);
      });

      // Log symbols with no assets
      this.symbolNames.forEach((name) => {
        if (!this.symbolTextures[theme][name] && !this.spineData[theme][name]) {
          console.warn(`No assets (texture or Spine animation) loaded for symbol: ${name} in theme ${theme}`);
        }
      });

      if (this.mapTextures[theme].filter(t => t).length === 0) {
        console.error(`No valid map textures loaded for theme ${theme}`);
        return false;
      }

      // Update mapNames for the current theme
      this.mapNames = themeConfig.mapNames;
      console.log(`Updated mapNames for theme ${theme}:`, this.mapNames);
      return true;
    } catch (error) {
      console.error(`Failed to load assets for theme ${theme}:`, error);
      return false;
    }
  }

  setupReels(theme) {
    this.reels = [];
    const reel = new ReelModel(
      this.mapTextures[theme],
      this.symbolTextures[theme],
      this.spineData[theme],
      this.symbolConfig,
      this.mapDimensions[theme],
      this.mapNames,
      this.symbolNames
    );
    reel.setup();
    this.reels.push(reel);
  }

  canSpin() {
    return this.mapTextures[this.currentTheme]?.length >= this.spinMapIndices.length;
  }

  getNextMapIndex() {
    this.currentMapIndex = (this.currentMapIndex + 1) % this.spinMapIndices.length;
    return this.spinMapIndices[this.currentMapIndex];
  }
}