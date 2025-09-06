/**
 * Creating a starfield effect written in javascript using pixi.js
 * 
 * Author: Scott Ranken
 * Created: 2025-09-06
 *
 * Description
 * Overview: The starfield effect is achieved by creating 500 stars as circles/lines and moving them towards the viewer. 
 *           A slider is added to manipulate a warp speed value which is applied to determine the stars trail length.
 *
 * Star:     Creates a star and updates its position each frame. Resets the star when it passes the viewer.
 */

const { Application, Graphics, Container } = PIXI;

(async () => {
  // Create a new application
  const app = new Application();

  const canvasWidth = 360;
  const canvasHeight = 360;
  const maxStars = 500;

  const baseFPS = 60; 
  const targetFrameMS = 1000 / baseFPS;
  
  let warpSpeed = 1;
  let starfield = [];

  // Initialize the application
  await app.init({ background: '#000000', width: canvasWidth, height: canvasHeight });

  // Append the application canvas to the container div instead of the body
  document.getElementById("star-field-container").appendChild(app.canvas);

  // Create and add a container to the stage
  const container = new Container();
  let graphics = new Graphics();

  // Move the container to the center
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  // Helper functions
  function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function projectToScreen(axis, z, dimension){
	return (axis/z)*dimension;
  }
  
  // Slider UI
  const sliderContainer = document.createElement('div');
  sliderContainer.style.position = 'static';
  sliderContainer.style.marginTop = '0rem';
  sliderContainer.style.textAlign = 'center';
  sliderContainer.style.color = 'black';
  sliderContainer.style.fontFamily = 'sans-serif';
  document.getElementById("star-field-container").appendChild(sliderContainer);

  const label = document.createElement('label');
  label.innerText = 'Warp Speed: ';
  sliderContainer.appendChild(label);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '1';
  slider.max = '5';
  slider.step = '0.25';
  slider.value = '1';
  sliderContainer.appendChild(slider);

  slider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
	warpSpeed = ((val - 1) / (5 - 1)) * (11 - 1) +1; // Map the slider from 1-5 to 1-11 for warp speed value
  });
  
  class Star {
    constructor() {
      this.reset();
    }
  
    reset()
    {
      this.x = getRndInteger(-canvasWidth / 2, canvasWidth / 2);
      this.y = getRndInteger(-canvasHeight / 2, canvasHeight / 2);
      this.z = getRndInteger(canvasWidth / 2, canvasWidth); 
      this.prevZ = this.z;
    }

    update(deltaMS) {
	  // Where the star is projected before moving closer
      const prevStarX = projectToScreen(this.x, this.z, canvasWidth);
      const prevStarY = projectToScreen(this.y, this.z, canvasHeight);
	  
	  // Move the star closer to the screen each frame. Based on time (ms) and not frames.
      this.z -= warpSpeed * (deltaMS / targetFrameMS);
	  
	  // Reset the stars position to far away when it surpasses the viewer.
      if (this.z < 1) {
        this.reset();
        return; // Don't draw trail on reset
      }
	  
	  // Where the star is projected after moving closer
      const starX = projectToScreen(this.x, this.z, canvasWidth);
      const starY = projectToScreen(this.y, this.z, canvasHeight);
	  
	  // Calculate the difference between the prev position and current position.
	  // Multiply that by the warpSpeed to create the stars trail.
      let trailX = prevStarX + (starX - prevStarX) * warpSpeed;
      let trailY = prevStarY + (starY - prevStarY) * warpSpeed;
	  
	  // Stars are drawn as lines whose length depends on warpSpeed. When warpSpeed is 
	  // equal to one, stars are drawn as circles instead to avoid small unwanted trails.
      if (warpSpeed == 1){
        graphics.circle(prevStarX, prevStarY, 0.25).stroke({ color: 0xffffff, pixelLine: true });
      }else{
        graphics.moveTo(prevStarX, prevStarY).lineTo(trailX, trailY).stroke({ color: 0xffffff, pixelLine: true });
      }
	  
      this.prevZ = this.z;
    }
  }
  
  // Create stars
  for (let i = 0; i < maxStars; i++) {
    starfield.push(new Star());
  }
  
  // Draw
  function draw() {
    graphics.clear();

    for (let i = 0; i < maxStars; i++) {
      starfield[i].update(app.ticker.deltaMS);
    }
  }

  // Update
  app.ticker.add((time) => {
    draw()
  });

  container.addChild(graphics);
  app.stage.addChild(container);
})();
