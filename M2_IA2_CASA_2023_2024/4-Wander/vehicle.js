class Vehicle {
  static debug = false;

  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(1, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 4;
    this.maxForce = 0.2;
    this.r = 16;
    // Pour comportement arrive
    this.rayonZoneDeFreinage = 100;

    // pour comportement wander
    this.wanderTheta = 0;
    this.wanderRadius = 50;
    this.displaceRange = 0.3;
    this.distanceCercleWander = 100;

    this.path = [];
    this.nbMaxPointsChemin = 40;
  }

  wander() {
    // point devant le véhicule
    let wanderPoint = this.vel.copy();
    wanderPoint.setMag(this.distanceCercleWander);
    wanderPoint.add(this.pos);

    if (Vehicle.debug) {
      // on le dessine sous la forme d'une petit cercle rouge
      fill(255, 0, 0);
      noStroke();
      circle(wanderPoint.x, wanderPoint.y, 8);

      // Cercle autour du point
      noFill();
      stroke(255);
      circle(wanderPoint.x, wanderPoint.y, this.wanderRadius * 2);

      // on dessine une lige qui relie le vaisseau à ce point
      // c'est la ligne blanche en face du vaisseau
      line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);
    }
    // On va s'occuper de calculer le point vert SUR LE CERCLE
    // il fait un angle wanderTheta avec le centre du cercle
    // l'angle final par rapport à l'axe des X c'est l'angle du vaisseau
    // + cet angle
    let theta = this.wanderTheta + this.vel.heading();

    let x = this.wanderRadius * cos(theta);
    let y = this.wanderRadius * sin(theta);

    // maintenant wanderPoint c'est un point sur le cercle
    wanderPoint.add(x, y);

    if (Vehicle.debug) {
      // on le dessine sous la forme d'un cercle vert
      fill("green");
      noStroke();
      circle(wanderPoint.x, wanderPoint.y, 16);

      // on dessine le vecteur desiredSpeed qui va du vaisseau au point vert
      stroke("yellow");
      line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);
    }
    // On a donc la vitesse désirée que l'on cherche qui est le vecteur
    // allant du vaisseau au cercle vert. On le calcule :
    // ci-dessous, steer c'est la desiredSpeed directement !
    let desiredSpeed = wanderPoint.sub(this.pos);

    // Ce que dit Craig Reynolds, c'est que uniquement pour ce
    // comportement, la force à appliquer au véhicule est
    // desiredSpeed et pas desiredSpeed - vitesse actuelle !
    let force = desiredSpeed;

    force.setMag(this.maxForce);
    this.applyForce(force);

    // On déplace le point vert sur le cerlcle (en radians)
    this.wanderTheta += random(-this.displaceRange, this.displaceRange);
  }

  /* Poursuite d'un point devant la target !
      cette methode renvoie la force à appliquer au véhicule
   */

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    // on rajoute la position courante dans le tableau du chemin
    this.path.push(this.pos.copy());

    // si le tableau a plus de 50 éléments, on vire le plus ancien
    if (this.path.length > this.nbMaxPointsChemin) {
      this.path.shift();
    }

  }

  show() {
    // dessin du chemin
    this.path.forEach((p, index) => {
      if (!(index % 3)) {
        stroke(255);
        fill(255);
        circle(p.x, p.y, 1);
      }
    });

    // dessin du vaisseau
    console.log("show")
    stroke(255);
    strokeWeight(2);
    fill(255);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
    pop();


  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}
