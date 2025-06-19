class WarzoneLighting {
  constructor(app) {
    this.app = app;
    this.container = new PIXI.Container();
    this.container.zIndex = 15; // Above other elements
    this.activeEffects = [];
    this.app.stage.addChild(this.container);
    this.flashIntensity = 0;
  }
 
  createEffect() {
    this.clearEffects();
 
    // Create 3-5 dramatic flashes
    const flashCount = 3 + Math.floor(Math.random() * 3);
 
    for (let i = 0; i < flashCount; i++) {
      // Random delay between flashes (0-1000ms)
      setTimeout(() => this.createLightningFlash(), Math.random() * 1000);
    }
  }
 
  createLightningFlash() {
    // Main bright flash
    const flash = new PIXI.Graphics();
    flash.beginFill(0xFFFFFF, 0.9);
    flash.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    flash.endFill();
    flash.blendMode = PIXI.BLEND_MODES.ADD;
    this.container.addChild(flash);
    this.activeEffects.push(flash);
 
    // Lightning bolts
    const boltCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < boltCount; i++) {
      this.createLightningBolt();
    }
 
    // Animate flash
    gsap.to(flash, {
      alpha: 0,
      duration: 0.3,
      delay: 0.1,
      onComplete: () => this.removeEffect(flash)
    });
 
    // Removed screen shake
    // this.shakeScreen();
  }
 
  createLightningBolt() {
    const bolt = new PIXI.Graphics();
    const startX = Math.random() * this.app.screen.width;
    const startY = 0;
    const endX = startX + (Math.random() * 200 - 100);
    const endY = this.app.screen.height;
 
    bolt.lineStyle(2 + Math.random() * 3, 0xFFFFFF, 0.8);
    this.drawZigzag(bolt, startX, startY, endX, endY, 8);
    bolt.blendMode = PIXI.BLEND_MODES.ADD;
    this.container.addChild(bolt);
    this.activeEffects.push(bolt);
 
    // Animate bolt
    gsap.to(bolt, {
      alpha: 0,
      duration: 0.2 + Math.random() * 0.3,
      onComplete: () => this.removeEffect(bolt)
    });
  }
 
  drawZigzag(graphics, x1, y1, x2, y2, segments) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    graphics.moveTo(x1, y1);
 
    for (let i = 1; i <= segments; i++) {
      const x = x1 + (dx * i / segments) + (Math.random() * 40 - 20);
      const y = y1 + (dy * i / segments) + (Math.random() * 40 - 20);
      graphics.lineTo(x, y);
    }
  }
 
  // The shakeScreen method is now unused but kept in case you need it later
  shakeScreen() {
    const initialX = this.app.stage.x;
    const initialY = this.app.stage.y;
    const intensity = 10 + Math.random() * 10;
 
    gsap.to(this.app.stage, {
      x: initialX + (Math.random() * intensity - intensity / 2),
      y: initialY + (Math.random() * intensity - intensity / 2),
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      onComplete: () => {
        this.app.stage.x = initialX;
        this.app.stage.y = initialY;
      }
    });
  }
 
  removeEffect(effect) {
    if (effect.parent) {
      effect.parent.removeChild(effect);
    }
    this.activeEffects = this.activeEffects.filter(e => e !== effect);
  }
 
  clearEffects() {
    this.activeEffects.forEach(effect => {
      this.removeEffect(effect);
    });
    this.activeEffects = [];
  }
}
 
 