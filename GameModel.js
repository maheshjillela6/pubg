  class GameModel {
    constructor() {
      this.reels = [];
      this.mapTextures = {};
      this.mapDimensions = {};
      this.symbolTextures = {};
      this.spineData = {};
      this.lightingTextures = {};
      this.bonusTextures = {};
      this.bgTextures = {}; // Added to store background textures
      this.themes = {
        theme1: {
          mapNames: ['map1_theme1', 'map2_theme1', 'map3_theme1', 'map4_theme1', 'map5_theme1','map6_theme1','map7_theme1','map8_theme1'],
          mapAtlas: 'maps_theme1.json',
          symbolAtlas: 'assets_theme1.json',
          spineAsset: 'animations/a_theme1.json',
          bgAtlas: 'BgAsset.json', // Added background atlas
          reelset: [
            [
              ['b1', 'a', 'b3', 'c', 'o1'],
              ['t1', 'b5', 'a', 'b2', 't'],
              ['b6', 'c', 'o', 'a', 'b7'],
              ['p', 't1', 'b', 'o1', 'n']
            ],
            [
              ['b2', 'o1', 'b7', 'a', 'c'],
              ['t1', 'a', 'p', 'b3', 'o'],
              ['b', 'c', 'b6', 't', 'b1'],
              ['a', 'b5', 'o1', 'n', 't1']
            ],
            [
              ['b3', 't1', 'a', 'b', 'o1'],
              ['c', 'b2', 't', 'a', 'b7'],
              ['o', 'a', 'b5', 'c', 'p'],
              ['b1', 'o1', 'n', 't1', 'b6']
            ],
            [
              ['b7', 'o', 'b1', 'a', 't1'],
              ['p', 'b3', 'c', 'b6', 'o1'],
              ['a', 't', 'b2', 'n', 'b5'],
              ['c', 'a', 'o1', 'b', 't1']
            ]
          ]
        },
        theme2: {
          mapNames: ['map1_theme2', 'map2_theme2', 'map3_theme2', 'map4_theme2', 'map5_theme2'],
          mapAtlas: 'maps_theme2.json',
          symbolAtlas: 'assets_theme2.json',
          spineAsset: 'animations/a_theme1.json',
          bgAtlas: 'BgAsset.json', // Added background atlas
          reelset: [
            [
              ['b1', 'a', 'p', 'b6', 'n'],
              ['t', 'o1', 'b3', 'c', 'b7'],
              ['b2', 'o', 'b5', 'a', 'p'],
              ['n', 'b6', 't', 'o1', 'b2']
            ],
            [
              ['c', 'b5', 'n', 'o', 'b3'],
              ['p', 'a', 'b7', 't', 'b1'],
              ['o1', 'b6', 'a', 'p', 'b2'],
              ['b3', 'n', 't', 'o1', 'b5']
            ],
            [
              ['t', 'b2', 'o', 'b1', 'c'],
              ['n', 'b7', 'a', 'p', 'b6'],
              ['o1', 'b3', 't', 'b5', 'a'],
              ['p', 'n', 'b2', 'o', 'b7']
            ],
            [
              ['b6', 'p', 't', 'o1', 'a'],
              ['t', 'b5', 'n', 'b2', 'c'],
              ['o', 'b7', 'a', 'p', 'b1'],
              ['n', 'b2', 'b6', 'o1', 'b3']
            ]
          ]
        },
        theme3: {
          mapNames: ['map1_theme3', 'map2_theme3', 'map3_theme3', 'map4_theme3', 'map5_theme3'],
          mapAtlas: 'maps_theme3.json',
          symbolAtlas: 'assets_theme3.json',
          spineAsset: 'a_theme3.json',
          bgAtlas: 'BgAsset.json', // Added background atlas
          reelset: [
            [
              ['a', 'b1', 'o1', 'b', 'c'],
              ['o1', 'c', 't1', 'a', 'o1'],
              ['a', 't1', 'a', 'b3', 'b2'],
              ['b1', 'o1', 't1', 'c', 'b']
            ],
            [
              ['a', 'b1', 'o1', 'b', 'c'],
              ['o1', 'c', 't1', 'a', 'o1'],
              ['a', 't1', 'a', 'b3', 'b2'],
              ['b1', 'o1', 't1', 'c', 'b']
            ]
          ]
        },
        theme4: {
          mapNames: ['map1_theme4', 'map2_theme4', 'map3_theme4', 'map4_theme4', 'map5_theme4'],
          mapAtlas: 'maps_theme4.json',
          symbolAtlas: 'assets_theme4.json',
          spineAsset: 'a_theme4.json',
          bgAtlas: 'BgAsset.json', // Added background atlas
          reelset: [
            [
              ['a', 'b1', 'o1', 'b', 'c'],
              ['o1', 'c', 't1', 'a', 'o1'],
              ['a', 't1', 'a', 'b3', 'b2'],
              ['b1', 'o1', 't1', 'c', 'b']
            ],
            [
              ['a', 'b1', 'o1', 'b', 'c'],
              ['o1', 'c', 't1', 'a', 'o1'],
              ['a', 't1', 'a', 'b3', 'b2'],
              ['b1', 'o1', 't1', 'c', 'b']
            ]
          ]
        }
      };
      this.symbolNames = [
        'a', 'b1', 'b2', 'b3', 'b5', 'b6', 'b7', 'b', 'c', 'n', 'o1', 'o', 'p', 't1', 't',
        'a', 'b1', 'b2', 'b3', 'b5', 'b6', 'b7', 'c', 'n', 'o1', 'o', 'p', 't',
        'a3', 'b_t3', 'c_t3', 'd_t3', 'b1_t3', 'b2_t3', 'b3_t3', 'b4_t3', 't_t3',
        'a4', 'b_t4', 'c_t4', 'd_t4', 'b1_t4', 'b2_t4', 'b3_t4', 'b4_t4', 't_t4'
      ];
      this.spinMapIndices = [0, 1, 2, 4];
      this.spinDurationMs = 2000;
      this.currentMapIndex = 0;
      this.symbolConfig = {
        a: { width: 80, height: 80 },
        b: { width: 300, height: 300 },
        c: { width: 80, height: 80 },
        d: { width: 70, height: 70 },
        e: { width: 85, height: 85 },
        f: { width: 75, height: 75 },
        b1: { width: 210, height: 210 },
        b2: { width: 220, height: 180 },
        b3: { width: 200, height: 180 },
        b9: { width: 75, height: 30 },
        t1: { width: 230, height: 200 },
        a2: { width: 80, height: 80 },
        b_t2: { width: 80, height: 80 },
        c_t2: { width: 80, height: 80 },
        d_t2: { width: 70, height: 70 },
        b1_t2: { width: 75, height: 30 },
        b2_t2: { width: 75, height: 30 },
        b3_t2: { width: 75, height: 30 },
        b4_t2: { width: 75, height: 30 },
        t_t2: { width: 80, height: 80 },
        a3: { width: 80, height: 80 },
        b_t3: { width: 80, height: 80 },
        c_t3: { width: 80, height: 80 },
        d_t3: { width: 70, height: 70 },
        b1_t3: { width: 75, height: 30 },
        b2_t3: { width: 75, height: 30 },
        b3_t3: { width: 75, height: 30 },
        b4_t3: { width: 75, height: 30 },
        t_t3: { width: 80, height: 80 },
        a4: { width: 80, height: 80 },
        b_t4: { width: 80, height: 80 },
        c_t4: { width: 80, height: 80 },
        d_t4: { width: 70, height: 70 },
        b1_t4: { width: 75, height: 30 },
        b2_t4: { width: 75, height: 30 },
        b3_t4: { width: 75, height: 30 },
        b4_t4: { width: 75, height: 30 },
        t_t4: { width: 80, height: 80 },
        o1: { width: 80, height: 80 },
        b5: { width: 230, height: 210 },
        p: { width: 180, height: 130 },
        b6: { width: 230, height: 210 },
        b7: { width: 200, height: 110 },
        l: { width: 80, height: 80 },
        zombie: { width: 60, height: 60 }
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

        PIXI.Assets.cache.reset();
        console.log(`Cleared PIXI assets cache for theme ${theme}`);

        this.mapTextures[theme] = [];
        this.mapDimensions[theme] = [];
        this.symbolTextures[theme] = {};
        this.spineData[theme] = {};
        this.lightingTextures[theme] = {};
        this.bgTextures[theme] = null; // Initialize background texture

        // Load background atlas
        try {
          const bgAtlas = await PIXI.Assets.load(themeConfig.bgAtlas);
          if (bgAtlas.textures && bgAtlas.textures['BgAsset']) {
            this.bgTextures[theme] = bgAtlas.textures['BgAsset'];
            console.log(`Loaded background texture: BgAsset for theme ${theme}`);
          } else {
            console.warn(`Background texture BgAsset not found in ${themeConfig.bgAtlas}`);
          }
        } catch (error) {
          console.warn(`Failed to load background atlas ${themeConfig.bgAtlas} for theme ${theme}:`, error);
        }

        const mapAtlas = await PIXI.Assets.load(themeConfig.mapAtlas);
        const atlasData = mapAtlas.data || mapAtlas.spritesheet?.data || await fetch(themeConfig.mapAtlas).then(res => res.json());
        themeConfig.mapNames.forEach((name, index) => {
          const texture = mapAtlas.textures[name];
          if (texture) {
            this.mapTextures[theme][index] = texture;
            const frame = atlasData.frames?.[name]?.frame;
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
          console.error(`Insufficient valid map textures for theme ${theme}`);
          return false;
        }

        const symbolAtlas = await PIXI.Assets.load(themeConfig.symbolAtlas);
        const themeSymbolNames = this.symbolNames.filter(name => name.includes(theme) || !name.includes('_t'));
        themeSymbolNames.forEach((name) => {
          const textureName = name.includes(theme) ? name : `${name}_${theme}`;
          const texture = symbolAtlas.textures[textureName];
          if (texture) {
            this.symbolTextures[theme][name] = texture;
            console.log(`Loaded static texture for symbol: ${textureName}`);
          } else {
            console.warn(`Symbol texture ${textureName} not found in ${themeConfig.symbolAtlas}`);
          }
        });

        try {
          const spineAtlas = await PIXI.Assets.load({
            src: themeConfig.spineAsset,
            data: { type: 'spine' }
          });
          const name = theme === 'theme1' ? 'a' : `a${theme.slice(-1)}`;
          const spine = spineAtlas.spineData;
          if (spine) {
            const animationName = `${name}_land`;
            const hasAnimation = spine.animations.some((anim) => anim.name === animationName);
            if (hasAnimation) {
              this.spineData[theme][name] = spine;
              console.log(`Loaded Spine data for symbol: ${name} with animation: ${animationName} for theme ${theme}`);
            } else {
              console.warn(`Spine data for ${name} loaded, but animation ${animationName} not found`);
            }
          } else {
            console.warn(`Spine data for ${name} not found in ${themeConfig.spineAsset}`);
          }
        } catch (error) {
          console.warn(`Failed to load Spine data for symbol a in theme ${theme}:`, error);
        }

        try {
          const lightingAtlas = await PIXI.Assets.load(themeConfig.lightingAtlas);
          this.lightingTextures[theme] = lightingAtlas.textures;
          console.log(`Successfully loaded lighting textures for theme ${theme}:`, Object.keys(this.lightingTextures[theme]));
        } catch (error) {
          console.warn(`Failed to load lighting effects for theme ${theme}:`, error);
          this.lightingTextures[theme] = {};
        }

        themeSymbolNames.forEach((name) => {
          if (!this.symbolTextures[theme][name] && !this.spineData[theme][name]) {
            console.warn(`No assets (texture or Spine animation) loaded for symbol: ${name} in theme ${theme}`);
          }
        });

        if (this.mapTextures[theme].filter(t => t).length === 0) {
          console.error(`No valid map textures loaded for theme ${theme}`);
          return false;
        }

        this.mapNames = themeConfig.mapNames;
        console.log(`Updated mapNames for theme ${theme}:`, this.mapNames);
        return true;
      } catch (error) {
        console.error(`Failed to load assets for theme ${theme}:`, error);
        return false;
      }
    }

    async loadBonusAssets() {
      try {
        const bonusAtlas = await PIXI.Assets.load('bonusAssets.json');
        ['l', 'zombie'].forEach(name => {
          const texture = bonusAtlas.textures[name];
          if (texture) {
            this.bonusTextures[name] = texture;
            console.log(`Loaded bonus texture: ${name}`);
          } else {
            console.warn(`Bonus texture ${name} not found in bonusAssets.json`);
          }
        });
        return true;
      } catch (error) {
        console.error('Failed to load bonus assets:', error);
        return false;
      }
    }

    setupReels(theme) {
      this.reels = [];
      const themeConfig = this.themes[theme];
      const reel = new ReelModel(
        this.mapTextures[theme],
        this.symbolTextures[theme],
        this.spineData[theme],
        this.symbolConfig,
        this.mapDimensions[theme],
        this.mapNames,
        this.symbolNames.filter(name => name.includes(theme) || !name.includes('_t')),
        themeConfig.reelset,
        this.bgTextures[theme] // Pass background texture
      );
      reel.setup();
      this.reels.push(reel);
    }

    canSpin() {
      return this.mapTextures[this.currentTheme]?.length >= this.spinMapIndices.length;
    }

    getNextMapIndex() {
      this.currentMapIndex = Math.round((this.currentMapIndex + 1) % this.spinMapIndices.length);
      return this.spinMapIndices[this.currentMapIndex];
    }
  }