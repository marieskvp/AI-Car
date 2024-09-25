class Controls{
  constructor(type,direction=1){
    this.forward = false ;
    this.left = false ; 
    this.right = false ;
    this.reverse = false ;

    switch(type){
      case 'KEYS':  this.#addKeyboardListeners(); 
                    break;
      case 'BOTS':  if(direction!=1){ this.forward = true}
                    else{ this.reverse=true }
                    break;
      case 'RCIR': this.forward = true;
                   this.right = true;
                   break;
    }
  }
  #addKeyboardListeners(){
    document.onkeydown = (event)=>{
      switch(event.key){
        case 'ArrowLeft' : 
          this.left = true ;
          break;
        case 'ArrowRight' :
          this.right = true ;
          break;
        case 'ArrowUp' :
          this.forward = true ;
          break ;
        case 'ArrowDown' :
          this.reverse = true ;
          break;
      }
    }
    document.onkeyup = (event)=>{
      switch(event.key){
        case 'ArrowLeft' : 
          this.left = false ;
          break;
        case 'ArrowRight' :
          this.right = false ;
          break;
        case 'ArrowUp' :
          this.forward = false ;
          break ;
        case 'ArrowDown' :
          this.reverse = false ;
          break;
      }

    }
  }
}