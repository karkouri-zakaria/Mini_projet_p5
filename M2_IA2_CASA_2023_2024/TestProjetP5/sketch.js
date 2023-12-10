let leader;
let vehicules = [];
let obstacles = [];
let demo = "snake";

function preload() {
  console.log("preload")
  imgVaisseau = loadImage('assets/images/vaisseau.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  let target = createVector(20 , 20);
  leader = new Vehicule(width / 2, height / 2, true, imgVaisseau);
  leader.target = target;
  vehicules.push(leader);
  for (let i = 0; i < 15; i++) {
    vehicules.push(new Vehicule(random(width), random(height), false, imgVaisseau));
  }
  obstacles.push(new Obstacle(width / 2, height / 2, 100));
}

function draw() {
  background(0);

  obstacles.forEach(o => {
    o.show();
  });

  let target;

    target = createVector(mouseX, mouseY);
    leader.target = target;
    console.log(target);


  fill(255, 0, 0);
  noStroke();
  ellipse(target.x, target.y, 32);

  noFill();
  stroke(255);
  ellipse(target.x, target.y, 72);


  for (let vehicule of vehicules) {
    vehicule.displayPath();
    vehicule.update();
    vehicule.display();
  }
}


function mousePressed() {
  obstacles.push(new Obstacle(mouseX, mouseY, random(30, 100)));
}

function keyPressed() {
  if (key == "d") {
    Vehicule.debug = !Vehicule.debug;
  } else if (key == "l") {
    demo = "leader";
  } else if (key == "s") {
    demo = "snake";
  }
  else if (key == "w") {
    demo = "wander";
  }
}
