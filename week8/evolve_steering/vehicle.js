// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

// Evolutionary "Steering Behavior" Simulation

// Create a new vehicle
class Vehicle {
  constructor(x, y, dna) {

    // All the physics stuff
    this.acceleration = createVector();
    this.velocity = p5.Vector.random2D();
    this.position = createVector(x, y);
    this.r = 3;
    this.maxforce = 0.5;
    this.maxspeed = 3;
    this.velocity.setMag(this.maxspeed);

    // Did it receive DNA to copy?
    if (dna instanceof Array) {
      this.dna = [];
      // Copy all the DNA
      for (let i = 0; i < dna.length; i++) {
        // 10% chance of mutation
        if (random(1) < 0.1) {
          if (i < 2) {
            // Adjust steering force weights
            this.dna[i] = dna[i] + random(-0.2, 0.2);

          } else {
            // Adjust perception radius
            this.dna[i] = dna[i] + random(-10, 10);
          }
          // Copy DNA
        } else {
          this.dna[i] = dna[i];
        }
      }
    } else {
      let maxf = 3;
      // DNA
      // 0: Attraction/Repulsion to food
      // 1: Attraction/Repulsion to poison
      // 2: Radius to sense food
      // 3: Radius to sense poison
      this.dna = [random(-maxf, maxf), random(-maxf, maxf), random(5, 100), random(5, 100)];
    }

    // Health
    this.health = 1;
  }


  // Method to update location
  update() {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);

    // Slowly die unless you eat
    this.health -= 0.002;

  };

  // Return true if health is less than zero
  dead() {
    return (this.health < 0);
  }

  // Small chance of returning a new child vehicle
  birth() {
    let r = random(1);
    if (r < 0.001) {
      // Same location, same DNA
      return new Vehicle(this.position.x, this.position.y, this.dna);
    }
  }

  // Check against array of food or poison
  // index = 0 for food, index = 1 for poison
  eat(list, index) {

    // What's the closest?
    let closest = null;
    let closestD = Infinity;
    // Look at everything
    for (let i = list.length - 1; i >= 0; i--) {
      // Calculate distance
      let d = p5.Vector.dist(list[i], this.position);

      // If it's within perception radius and closer than pervious
      if (d < this.dna[2 + index] && d < closestD) {
        closestD = d;
        // Save it
        closest = list[i];

        // If we're withing 5 pixels, eat it!
        if (d < 5) {
          list.splice(i, 1);
          // Add or subtract from health based on kind of food
          this.health += nutrition[index];
        }
      }
    }

    // If something was close
    if (closest) {
      // Seek
      let seek = this.seek(closest, index);
      // Weight according to DNA
      seek.mult(this.dna[index]);
      // Limit
      seek.limit(this.maxforce);
      this.applyForce(seek);
    }
  }

  // Add force to acceleration
  applyForce(force) {
    this.acceleration.add(force);
  }

  // A method that calculates a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  seek(target, index) {

    let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
    let d = desired.mag();

    // Scale to maximum speed
    desired.setMag(this.maxspeed);

    // Steering = Desired minus velocity
    let steer = p5.Vector.sub(desired, this.velocity);

    // Not limiting here
    // steer.limit(this.maxforce);

    return steer;
  }


  display() {

    // Color based on health
    let green = color(0, 255, 0);
    let red = color(255, 0, 0);
    let col = lerpColor(red, green, this.health)

    // Draw a triangle rotated in the direction of velocity
    let theta = this.velocity.heading() + PI / 2;
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);

    // Extra info
    if (debug.checked()) {
      noFill();

      // Circle and line for food
      stroke(0, 255, 0, 100);
      ellipse(0, 0, this.dna[2] * 2);
      line(0, 0, 0, -this.dna[0] * 25);

      // Circle and line for poison
      stroke(255, 0, 0, 100);
      ellipse(0, 0, this.dna[3] * 2);
      line(0, 0, 0, -this.dna[1] * 25);
    }

    // Draw the vehicle itself
    fill(col);
    stroke(col);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    pop();
  }

  // A force to keep it on screen
  boundaries() {
    let d = 10;
    let desired = null;
    if (this.position.x < d) {
      desired = createVector(this.maxspeed, this.velocity.y);
    } else if (this.position.x > width - d) {
      desired = createVector(-this.maxspeed, this.velocity.y);
    }

    if (this.position.y < d) {
      desired = createVector(this.velocity.x, this.maxspeed);
    } else if (this.position.y > height - d) {
      desired = createVector(this.velocity.x, -this.maxspeed);
    }

    if (desired !== null) {
      desired.setMag(this.maxspeed);
      let steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);
    }
  }
}