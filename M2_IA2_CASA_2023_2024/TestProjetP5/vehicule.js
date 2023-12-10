class Vehicule {

  constructor(x, y, isLeader, imageVaisseau, target) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.isLeader = isLeader;
    this.maxSpeed = 15;
    this.maxForce = 0.1;
    this.rayon = 100;
    this.path = [];
    this.nbMaxPointsChemin = 10;
    this.imageVaisseau = imageVaisseau;
    this.largeurZoneEvitementDevantVaisseau = this.rayon / 2;
    this.distanceAhead = 30;
    this.wanderTheta = 0;
    this.wanderRadius = 50;
    this.displaceRange = 0.3;
    this.distanceCercleWander = 100;
    this.target = target;

  }

  update() {
    vehicules.forEach((vehicule, index) => {
      let avoidForceObstacles = vehicule.avoid(obstacles);
      avoidForceObstacles.mult(0.9);
      vehicule.applyForce(avoidForceObstacles);
      let forceArrive;
      if (demo == "wander") {
        vehicule.checkScreenBoundaries();
        vehicule.wander();
      }
  
      if (vehicule.isLeader) vehicule.arrive(this.target);
      else {
        if (demo == "leader") {
          vehicule.followLeader(leader, 50, 40);
          vehicule.separate(vehicules);
        } else if (demo == "snake") {
          let precendent = vehicules[index - 1];
          forceArrive = vehicule.seek(precendent.position, 25);
          vehicule.applyForce(forceArrive);
        }
      }
    });
  
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.velocity.mult(0.98);
    if (this.path.length === 0 || this.position.dist(this.path[this.path.length - 1]) < 20) {
      this.path.push(this.position.copy());
    } else this.path = [];
    if (this.path.length > this.nbMaxPointsChemin) this.path.shift();
  }
  

  display() {
    if (this.isLeader) fill(0, 255, 0); else fill(255, 0, 0);
    stroke(0);
    strokeWeight(2);
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading());
    triangle(-16, -7, -16, 7, 16, 0);
    push();
    imageMode(CENTER);
    rotate(PI/2);
    image(this.imageVaisseau, 0, 0, 16 * 2, 16* 2);
    pop();
    pop();
  }

  displayPath() {
    noFill();
    stroke(255);
    beginShape();
    for (let point of this.path) {
      vertex(point.x, point.y);
    }
    endShape();
  }

  arrive(target) {
    let desired = p5.Vector.sub(this.target, this.position);
    let d = desired.mag();
    let speed = this.maxSpeed;
    if (d < 100) speed = map(d, 0, 100, 0, this.maxSpeed);
    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  followLeader(leader, behind, aheadLeader = 40, avoidanceRadius = 70) {
    let leaderBehind = p5.Vector.sub(leader.position, leader.velocity.copy().setMag(behind));
    let distanceToLeader = this.position.dist(leader.position);
    let avoidanceCircleCenter = leader.position.copy().add(leader.velocity.copy().setMag(aheadLeader))
    let distanceToAvoidanceCircle = this.position.dist(avoidanceCircleCenter);
  
    if (distanceToAvoidanceCircle < avoidanceRadius) {
      let avoidForce = p5.Vector.sub(this.position, avoidanceCircleCenter);
      avoidForce.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(avoidForce, this.velocity);
      steer.limit(this.maxForce);
      this.applyForce(steer);
    } else {
      let followForce = this.seek(leaderBehind, 25);
      this.applyForce(followForce);
    }
  }
  
  seek(target, distanceVisee) {
    let force = p5.Vector.sub(target, this.position);
    let desiredSpeed = this.maxSpeed;
    let distance = p5.Vector.dist(this.position, target);
    desiredSpeed = map(distance, distanceVisee, this.rayon + distanceVisee, 0, this.maxSpeed);
    force.setMag(desiredSpeed);
    force.sub(this.velocity);
    force.limit(this.maxForce);
    this.applyForce(force);
  }

  separate(others) {
    let desiredSeparation = 20;
    let sum = createVector();
    let count = 0;

    for (let other of others) {
      let d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.normalize();
        diff.div(d);
        sum.add(diff);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      sum.setMag(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      this.applyForce(steer);
    }
  }

  avoid(obstacles) {
    let ahead = this.velocity.copy().mult(this.distanceAhead);
    let endPointAhead = p5.Vector.add(this.position, ahead);
    let ahead2 = ahead.copy().mult(0.5);
    let midPointAhead = p5.Vector.add(this.position, ahead2);
    let nearestObstacle = this.getNearestObstacle(obstacles);
    if (nearestObstacle == undefined) return createVector(0, 0);
    let distanceToEnd = nearestObstacle.position.dist(endPointAhead);
    let distanceToMid = nearestObstacle.position.dist(midPointAhead);
    let distanceToStart = nearestObstacle.position.dist(this.position);
    let closestDistance = min(distanceToEnd, distanceToMid, distanceToStart);
    let nearestPointToObstacle;
    if (distanceToEnd == closestDistance) nearestPointToObstacle = endPointAhead;
    else if (distanceToMid == closestDistance) nearestPointToObstacle = midPointAhead;
    else if (distanceToStart == closestDistance) {
        nearestPointToObstacle = this.position;
        setColorBasedOnDistance(distanceToStart, nearestObstacle, nearestObstacle.r);
    }
    if (closestDistance >= nearestObstacle.r + this.largeurZoneEvitementDevantVaisseau) return createVector(0, 0);
    let force = p5.Vector.sub(nearestPointToObstacle, nearestObstacle.position);
    force.setMag(this.maxSpeed).sub(this.velocity).limit(this.maxForce);
    if (distanceToStart < nearestObstacle.r) return force.setMag(this.maxForce * 2); else return force;
    function setColorBasedOnDistance(distance, obstacle, threshold) {
      if (distance < threshold) obstacle.color = color("red"); else obstacle.color = "green";
    }
}

  getNearestObstacle(obstacles) {
    let plusPetiteDistance = 100000000;
    let obstacleLePlusProche = undefined;
    obstacles.forEach(o => {
      const distance = this.position.dist(o.position);
      if (distance < plusPetiteDistance) {
        plusPetiteDistance = distance;
        obstacleLePlusProche = o;
      }
    });
    return obstacleLePlusProche;
  }

  wander() {
    let wanderPoint = this.velocity.copy();
    wanderPoint.setMag(this.distanceCercleWander);
    wanderPoint.add(this.position);
    let theta = this.wanderTheta + this.velocity.heading();
    let x = this.wanderRadius * cos(theta);
    let y = this.wanderRadius * sin(theta);
    wanderPoint.add(x, y);
  
    let avoidForceObstacles = this.avoid(obstacles);
    avoidForceObstacles.mult(1.5);
    this.applyForce(avoidForceObstacles);
  
    let desiredSpeed = p5.Vector.sub(wanderPoint, this.position);
    let force = desiredSpeed.setMag(this.maxForce);
    this.applyForce(force);
    this.wanderTheta += random(-this.displaceRange, this.displaceRange);
    this.checkScreenBoundaries();
  }
  
  
  checkScreenBoundaries() {
    if (this.position.x < 0 || this.position.x > width) this.velocity.x *= -1;
    if (this.position.y < 0 || this.position.y > height)
    this.velocity.y *= -1;
    this.position.x = constrain(this.position.x, 0, width);
    this.position.y = constrain(this.position.y, 0, height);
  }
  
  
  
  

  applyForce(force) {
    this.velocity.add(force);
  }
}
