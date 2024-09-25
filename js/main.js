const carCanvas = document.getElementById("carCanvas") ;
carCanvas.width = 275;

const networkCanvas = document.getElementById("networkCanvas") ;
networkCanvas.width = 300;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(carCanvas.width/2,carCanvas.width * 0.9);

const N=100;

const cars = generateCars(N);
const traffic = generateTraffic(N);

let bestCar=cars[0];

if(localStorage.getItem("bestBrain")){
  for(let i=0; i<cars.length; i++){
    cars[i].brain = JSON.parse(
      localStorage.getItem("bestBrain")
    );
    if(i!=0){
      NeuralNetwork.mutate(cars[i].brain,0.2);
    }
  }
}

animate();

function save(){
  localStorage.setItem("bestBrain",
    JSON.stringify(bestCar.brain)
  );
}

function discord(){
  localStorage.removeItem("bestBrain");
}

function generateTraffic(num){
    const traffic = [];
    let y = yAxies(-100);
    let laneNo = getLaneNUM();
    for(let i=0;i<=num;i++){
      traffic.push(
        new Car(
          road.getLaneCenter(laneNo),
          y,
          30,50,
          'BOTS',
          2, //speed
          getRandomColor(),
          2//direction 1 means downwards
        )
      );
      y=yAxies(y);
      laneNo = getLaneNUM(laneNo);
    }
    return traffic;
}


function generateCars(N){
  const cars =[];
  for(let i=1;i<=N;i++){
    cars.push(
      new Car(road.getLaneCenter(Math.floor(Math.random()*4)),0,30,50,'AI',5)
    );
  }
  return cars;
}

function animate(time){

  for(let i=0;i<traffic.length;i++){
    traffic[i].update(road.borders,[]);
  }

  for(let i=0;i<cars.length;i++){
    cars[i].update(road.borders,traffic);
  }

  bestCar = cars.find(
    c=>c.y==Math.min(
      ...cars.map(c=>c.y)
    ));

  carCanvas.height = window.innerHeight ;
  networkCanvas.height = window.innerHeight ;

  carCtx.save();
  carCtx.translate(0,-bestCar.y+carCanvas.height*0.75);

  road.draw(carCtx);
  for(let i=0;i<traffic.length;i++){
    traffic[i].draw(carCtx);
  }

  carCtx.globalAlpha = 0.2;

  for(let i=0;i<cars.length;i++){
    cars[i].draw(carCtx,'blue');
  }
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx,'blue',true);
  carCtx.restore();

  networkCtx.lineDashOffset = -time/50;
  Visualizer.drawNetwork(networkCtx,bestCar.brain);
  requestAnimationFrame(animate);
}