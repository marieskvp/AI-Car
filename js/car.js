class Car{
  constructor(x,y,width,height,controlType,maxSpeed=3,color='blue',direction=0){
    this.x = x;
    this.y = y;
    this.width = width ;
    this.height = height ;

    this.speed = 0 ;
    this.accelaration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.05 ;
    this.angle = 0;
    this.damaged = false;

    this.useBrian = controlType=='AI';

    if(controlType != 'BOTS'){
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork( [this.sensor.rayCount,6,4] );
    }
    this.controls = new Controls(controlType,direction);

    this.img = new Image();
    this.img.src = direction != 1 ? "./assets/car.png" :"./asserts/reversecar.png" ;

    this.mask = document.createElement("canvas");
    this.mask.width = width;
    this.mask.height = height;

    const maskCtx = this.mask.getContext("2d");
    this.img.onload=()=>{
      maskCtx.fillStyle = color;
      maskCtx.rect(0,0,this.width,this.height);
      maskCtx.fill();

      maskCtx.globalCompositeOperation = "destination-atop" ;
      maskCtx.drawImage(this.img,0,0,this.width,this.height);
    }
  }

  update(roadBorders,traffic){
    if(!this.damaged){
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders,traffic);
    }
    if(this.sensor){
      this.sensor.update(roadBorders,traffic);
      const offsets = this.sensor.readings.map(
        s=>s==null?0:1-s.offset
      );
      const outputs = NeuralNetwork.feedForward(offsets,this.brain);
      // console.log(outputs);

      if(this.useBrian){
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  #assessDamage(roadBorders,traffic){
    for(let i=0; i<roadBorders.length;i++){
      if(polyIntersect(this.polygon,roadBorders[i])){
        return true;
      }
    }
    for(let i=0; i<traffic.length;i++){
      if(polyIntersect(this.polygon,traffic[i].polygon)){
        return true;
      }
    }
    return false;
  }

  #createPolygon(){
    const  points = [];
    const rad = Math.hypot(this.width,this.height) / 2;
    const alpha = Math.atan2(this.width,this.height) ;
    points.push(
      { // top right point 
        x: this.x - Math.sin(this.angle-alpha)*rad,
        y: this.y - Math.cos(this.angle-alpha)*rad
      }
    );
    points.push(
      { // top left point
        x: this.x - Math.sin(this.angle+alpha)*rad,
        y: this.y - Math.cos(this.angle+alpha)*rad
      }
    );
    points.push(
      { // PI for 180deg 
        x : this.x - Math.sin(Math.PI+this.angle-alpha)*rad,
        y: this.y - Math.cos(Math.PI+this.angle-alpha)*rad
      }
    );
    points.push(
      { // PI for 180deg 
        x : this.x - Math.sin(Math.PI+this.angle+alpha)*rad,
        y: this.y - Math.cos(Math.PI+this.angle+alpha)*rad
      }
    );
    return points;
  }

  #move(){
    if(this.controls.forward){
      // this.y -= 2;
      this.speed += this.accelaration;
      
    }
    if(this.controls.reverse){
      // this.y += 2;
      this.speed -= this.accelaration;
    }
    if(this.speed > this.maxSpeed){
      this.speed = this.maxSpeed ;
    }
    if(this.speed < -this.maxSpeed/2){
      this.speed =-this.maxSpeed/2;
    }
    if(this.speed>0){
      this.speed -= this.friction ;
    }
    if(this.speed<0){
      this.speed += this.friction ;
    }
    if(Math.abs(this.speed)<this.friction){
      this.speed = 0;
    }
    if(this.speed != 0){
      const flip = this.speed>0 ? 1 : -1;
      if(this.controls.left){
        this.angle += 0.03*flip;
      }
      if(this.controls.right){
        this.angle -= 0.03*flip;
      }
    }
    
    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
    // console.log(this.speed)
  }
  draw(ctx,drawSensor=false){
    ctx.save();
    ctx.translate(this.x,this.y);
    ctx.rotate(-this.angle);
    if(!this.damaged){
      ctx.drawImage(
        this.mask,
        -this.width/2 , 
        -this.height/2 ,
        this.width,
        this.height
      );
      ctx.globalCompositeOperation = "multiply" ;
    }
    ctx.drawImage(
      this.img,
      -this.width/2 , 
      -this.height/2 ,
      this.width,
      this.height
    );
    ctx.restore();

    if(this.sensor && drawSensor){
      this.sensor.draw(ctx);
    }

  }
}