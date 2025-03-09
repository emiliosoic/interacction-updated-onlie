let vid;
let shapeSize = 150;
let cornerRadius = shapeSize / 2;
let noiseOffset = 0;
let noiseAmp = 2;
let targetNoiseAmp = 2;
let shapeFactor = 1.0;
let easing = 0.1;
let isHovering = false;
let vidGraphics; // Off-screen buffer for processing video

function preload() {
  vid = createVideo("Comp 1.mp4", videoLoaded);
  vid.style('display', 'none');  // Hide but still usable
}

function videoLoaded() {
  vid.autoplay(true);
  vid.loop();
  vid.volume(0);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  noStroke();

  // Create an off-screen graphics buffer for video
  vidGraphics = createGraphics(width * 0.65, height * 0.65);
}

function mousePressed() {
  if (vid.elt.paused) {
    vid.play();
  }
}

function draw() {
  background(20, 20, 30);

  // Draw vertical noise lines
  stroke(100, 100, 150, 100);
  strokeWeight(2);
  noiseOffset += 0.005;
  noiseAmp = lerp(noiseAmp, targetNoiseAmp, 0.05);
  
  for (let x = 0; x <= width; x += 10) {
    let noiseVal = noise(x * 0.1, noiseOffset);
    let offset = map(noiseVal, 0, 1, -noiseAmp, noiseAmp);
    line(x + offset, 0, x + offset, height);
  }

  // Mouse hover detection
  let distToCenter = dist(mouseX, mouseY, width / 2, height / 2);
  isHovering = distToCenter < shapeSize / 2;

  // Shape morphing logic
  let targetFactor = isHovering ? 0.0 : 1.0;
  shapeFactor = lerp(shapeFactor, targetFactor, easing);
  targetNoiseAmp = isHovering ? 5 : 2;

  let shapeOpacity = map(shapeFactor, 0, 1, 0, 255);

  push();
  translate(width / 2, height / 2);
  
  // Draw shape
  if (shapeFactor > 0.1) {
    let currentRadius = map(shapeFactor, 0, 1, 0, shapeSize / 2);
    fill(200, 220, 255, shapeOpacity);
    rect(0, 0, shapeSize, shapeSize, currentRadius);
  }

  // Process video to only show white areas
  if (shapeFactor < 0.9) {
    processVideo();
    tint(255, 255 - shapeOpacity);
    image(vidGraphics, -vidGraphics.width / 2, -vidGraphics.height / 2);
    noTint();
  }

  pop();
}

// Process video to keep only white parts
function processVideo() {
  vidGraphics.image(vid, 0, 0, vidGraphics.width, vidGraphics.height);
  vidGraphics.loadPixels();

  for (let i = 0; i < vidGraphics.pixels.length; i += 4) {
    let r = vidGraphics.pixels[i];
    let g = vidGraphics.pixels[i + 1];
    let b = vidGraphics.pixels[i + 2];

    // Convert to grayscale
    let brightness = (r + g + b) / 3;

    // If the brightness is below a threshold, make it fully transparent
    if (brightness < 200) {
      vidGraphics.pixels[i + 3] = 0; // Set alpha to 0 (transparent)
    }
  }

  vidGraphics.updatePixels();
}
