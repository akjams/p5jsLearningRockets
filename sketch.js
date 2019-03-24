// Learning rockets.
// A hacky attempt at a simple version of https://www.youtube.com/watch?v=bGz7mv2vD6g.

'use strict';
const POPULATION_SIZE = 100;
const LIFESPAN_MAX = 200;
const MUTATION_RATE = 0.02;

let target = createTarget();
let population = createRandomPopulation();

let lifeSpanIndex = 0;
let lifeSpanIterations = 0;

let slider;

// Doesn't work with let setup = ...
var setup = () => {
  console.log('setup');
  createCanvas(600, 400);
  slider = createSlider(0, 20, 1);
};

var draw = () => {
  background(0);
  target.draw();
  population.draw();


  for (let n = 0; n < slider.value(); n++) {
    population.tick();
    lifeSpanIndex++;
    if (lifeSpanIndex >= LIFESPAN_MAX) {
      lifeSpanIndex = 0;
      lifeSpanIterations++;
      population = evolve(population);
    }
  }

  stroke('white');
  textSize(20);
  strokeWeight(1);
  text('lifeSpanIndex: ' + lifeSpanIndex + ', lifeSpanIterations: ' + lifeSpanIterations, 180, 80);

};

function createTarget() {
  return {
    xpos: 80,
    ypos: 80,
    radius: 50,
    draw: function() {
      stroke('red');
      strokeWeight(5);
      fill('red');
      ellipse(this.xpos, this.ypos, this.radius, this.radius);
    }
  };
}

function evolve(population) {
  let rocketArray = population.rocketArray;
  // Sort in increasing order of dist to target.
  rocketArray.sort((r1, r2) => r1.getDistanceToTarget() - r2.getDistanceToTarget());
  
  // for (let i = 0; i < rocketArray.length; i++) {
  //   console.log(rocketArray[i].getDistanceToTarget());
  // }

  // Create a new population of 2x every rocket in the better half.
  // Also add some mutations.
  let newRocketArray = [];

  for (let i = 0; i < POPULATION_SIZE / 2; i++) {
    let currRocket = rocketArray[i];
    newRocketArray.push(cloneAndMutate(currRocket));
    newRocketArray.push(cloneAndMutate(currRocket));
  }

  return createPopulationFromRocketArray(newRocketArray);
}

function cloneAndMutate(rocket) {
  let xStrategyArray = rocket.xBoostStrategy.strategyArray.slice(0);
  let yStrategyArray = rocket.yBoostStrategy.strategyArray.slice(0);
  mutate(xStrategyArray);
  mutate(yStrategyArray);

  let xStrat = createBoostStrategyFromArray(xStrategyArray);
  let yStrat = createBoostStrategyFromArray(yStrategyArray);
  return createRocketFromStrategy(xStrat, yStrat);
}

function mutate(strategyArray) {
  for (let i = 0; i < strategyArray.length; i++) {
    if (Math.random() < MUTATION_RATE) {
      strategyArray[i] += getRandomBoost();
    }
  }
}

function createRandomPopulation() {
  let rocketArray = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    rocketArray.push(createRandomRocket());
  }
  return createPopulationFromRocketArray(rocketArray);
}

function createPopulationFromRocketArray(rocketArray) {

  let draw = () => {
    for (let i = 0; i < POPULATION_SIZE; i++) {
      rocketArray[i].draw();
    }
  };

  let tick = () => {
    for (let i = 0; i < POPULATION_SIZE; i++) {
      rocketArray[i].tick();
    }
  }

  return {
    rocketArray: rocketArray,
    draw: draw,
    tick: tick
  };
}

function createRandomRocket() {
  let xBoostStrategy = createRandomBoostStrategy();
  let yBoostStrategy = createRandomBoostStrategy();
  return createRocketFromStrategy(xBoostStrategy, yBoostStrategy);
}

function createRocketFromStrategy(xBoostStrategy, yBoostStrategy) {
  let xpos = 300;
  let ypos = 350;
  let width = 5;
  let height = 10;
  let xvel = 0;
  let yvel = 0;
  let xacl = 0;
  let yacl = 0;
  let distanceToTarget = 100000; // close to 0 is good.
  let win = false;

  let draw = () => {
    //stroke(0, 0, 255, 200); // slightly transparent blue
    stroke('blue');
    strokeWeight(3);  
    noFill();  
    rect(xpos, ypos, width, height);
  };

  let tick = () => {
    if (!win) {
      doStrategy();
      doPhysics();
      updateDistanceToTarget();
      checkWin();
    }
  };

  let doStrategy = () => {
    xacl += xBoostStrategy.nextBoost();
    yacl += yBoostStrategy.nextBoost();
  };

  let doPhysics = () => {
    xvel += xacl;
    yvel += yacl;
    xpos += xvel;
    ypos += yvel;
  };

  let updateDistanceToTarget = () => {
    let dx = target.xpos - xpos;
    let dy = target.ypos - ypos;
    //console.log(distanceToTarget);
    distanceToTarget = Math.sqrt(dx * dx + dy * dy);
  }

  let checkWin = () => {
    if (distanceToTarget < target.radius / 2) {
      distanceToTarget = -1;
      win = true;
    }
  };  

  return {
    getDistanceToTarget: () => distanceToTarget,
    xBoostStrategy: xBoostStrategy,
    yBoostStrategy: yBoostStrategy,
    draw: draw,
    tick: tick
  };
}

function createRandomBoostStrategy() {
  let boostArray = [];
  for (let i = 0; i < LIFESPAN_MAX; i++)  {
    boostArray.push(getRandomBoost());
  }
  return createBoostStrategyFromArray(boostArray);
}

function createBoostStrategyFromArray(ar) {
  let index = 0;
  let nextBoost = () => {
    index = (index + 1) % ar.length;
    return ar[index];
  };

  return {
    strategyArray: ar,
    nextBoost: nextBoost
  };
}

function getRandomBoost() {
  return (Math.random() - 0.5) / 100;
}

// https://www.w3schools.com/js/js_random.asp
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}