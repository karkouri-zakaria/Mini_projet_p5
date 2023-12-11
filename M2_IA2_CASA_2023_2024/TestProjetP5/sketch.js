let leader;
let vehicules = [];
let obstacles = [];
let demo = "snake";
let outerRadius = 100;
let number = 15;
let numberSlider;

function preload() {
  console.log("preload");
  imgVaisseau = loadImage('assets/images/vaisseau.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  numberSlider = createSlider(1, 50, number);
  numberSlider.position(20,20);
  let target = createVector(20, 20);
  leader = new Vehicule(width / 2, height / 2, true, imgVaisseau);
  leader.target = target;
  vehicules.push(leader);
  for (let i = 0; i < number; i++) {
    vehicules.push(new Vehicule(random(width), random(height), false, imgVaisseau));
  }
  obstacles.push(new Obstacle(width / 2, height / 2, 100));
}

function draw() {
  background(0);
  let newNumber = numberSlider.value();
  if (newNumber > number) {
    for (let i = number; i < newNumber; i++) vehicules.push(new Vehicule(random(width), random(height), false, imgVaisseau));
  } else if (newNumber < number) vehicules.splice(newNumber);
  number = newNumber;
  obstacles.forEach(o => {
    o.show();
  });
  let target;
  target = createVector(mouseX, mouseY);
  leader.target = target;
  fill(255, 0, 0);
  noStroke();
  ellipse(target.x, target.y, 32);
  noFill();
  stroke(255);
  ellipse(target.x, target.y, outerRadius);
  for (let vehicule of vehicules) {
    vehicule.displayPath();
    vehicule.update();
    vehicule.display();
  }
}

function mousePressed() {
  if (keyIsDown(79) || keyIsDown(111)) obstacles.push(new Obstacle(mouseX, mouseY, random(30, 100)));
}

function keyPressed() {
  if (key == "d") Vehicule.debug = !Vehicule.debug;
  else if (key == "l") demo = "leader";
  else if (key == "s") demo = "snake";
  else if (key == "w") demo = "wander";
}
