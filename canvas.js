let flag=true;
function executeInInterval(cb,force){
    if(flag || force){
        flag=false;
    setTimeout(()=>{
       flag=true;
       cb()
    },50)
   }
}
const CONTEXT_SHAPE_TYPE={
    RECT:"RECT",
    LINE:"LINE",
    TEXT:"TEXT",
    COLOR:"COLOR",
    BG_COLOR:"BG_COLOR",
    OPACITY:"OPACITY",
    FILL_RECT:"FILL_RECT"
}
class CanvasUtil{
    static geidSize=1;
    static scale=1;
    static getUpperAndLowerPoint(x,y,width,height){
      const xMax=Math.max(x,x+width)
      const xMin=Math.min(x,x+width)
      const yMax = Math.max(y,y+height)
      const yMin = Math.min(y,y+height);
      return {
        x:xMin,
        y:yMin,
        width:xMax-xMin,
        height:yMax-yMin
      }
    }
    static getAllPoint({x,y,width,height}){
     const p1={x,y}
     const p2={
        x:(x+width),
        y
     }
    const p3={
        x,
        y:y+height
    }
    const p4={
        x:(x+width),
        y:y+height
    }
    return [p1,p2,p3,p4] 
    }
    static checkPoinIsInsideRect(rectPoint,p){
       return (rectPoint.x<= p.x && (rectPoint.x+rectPoint.width)>= p.x) && (rectPoint.y<=p.y && (rectPoint.y+rectPoint.height)>=p.y)
    }

    static checkRectisInsideRect(selectionRect,shapRect){
        const selrectPoint = this.getUpperAndLowerPoint(selectionRect.x,selectionRect.y,selectionRect.width,selectionRect.height)
        const rectPoint=this.getUpperAndLowerPoint(shapRect.x,shapRect.y,shapRect.width,shapRect.height)
        if(selrectPoint.x<=rectPoint.x && selrectPoint.y <= rectPoint.y && selrectPoint.width>=rectPoint.width && selrectPoint.height>=rectPoint.height){
           return rectPoint 
        }
        return null;
    //   const pList = this.getAllPoint({...shapRect})
    //   console.log("pList==>",pList)
    //   return pList.filter((p)=>{
    //     const status =  this.checkPoinIsInsideRect({...selectionRect},p)
    //      console.log(status,p,selectionRect)
    //      return status;
    //   }).length==4
    }

    static getScalePoint(disX,disY,scale,p){
      const x = (p.x/scale)+disX;
      const y = (p.y/scale)+disY; 
      return {
        x,y
      }
    }

    static getPointinGrid(num,gridSize){
        const rem=num%gridSize;
        return num-rem;
    }
    

}
class ContextShap{
    list=[];
    rect(x,y,width,height){
      this.list.push({
        type:CONTEXT_SHAPE_TYPE.RECT,
        x,
        y,
        width,
        height
      })
    }
    line(x1,y1,x2,y2){
        this.list.push({
            type:CONTEXT_SHAPE_TYPE.LINE,
            x1,
            y1,
            x2,
            y2
          })
    }
   color(color){
    this.list.push({
        type:CONTEXT_SHAPE_TYPE.COLOR,
        color
    })
   }
   bgColor(color){
    this.list.push({
        type:CONTEXT_SHAPE_TYPE.BG_COLOR,
        color
    })
   }
   opacity(num){
    this.list.push({
        type:CONTEXT_SHAPE_TYPE.OPACITY,
        val:num
    })
   }
   fillRect(x,y,width,height,color){
       if(color){
        this.bgColor(color)
       }
       this.list.push({
        type:CONTEXT_SHAPE_TYPE.FILL_RECT,
        x,
        y,
        width,
        height
      })
   }
   drawShap(ctx){
    this.list.forEach((d)=>{
        switch(d.type){
            case CONTEXT_SHAPE_TYPE.RECT:
                ctx.rect(d.x,d.y,d.width,d.height)
            break;
            case CONTEXT_SHAPE_TYPE.FILL_RECT:
                ctx.fillRect(d.x,d.y,d.width,d.height)
            break;
            case CONTEXT_SHAPE_TYPE.COLOR:
                ctx.rect(d.x,d.y,d.width,d.height)
            break;
            case CONTEXT_SHAPE_TYPE.BG_COLOR:
                ctx.fillStyle = d.color;
               // ctx.rect(d.x,d.y,d.width,d.height)
            break;
            case CONTEXT_SHAPE_TYPE.OPACITY:
                ctx.globalAlpha = d.val;
               // ctx.rect(d.x,d.y,d.width,d.height)
            break;
            case CONTEXT_SHAPE_TYPE.LINE:
                ctx.moveTo(d.x1,d.y1);
                ctx.lineTo(d.x2,d.y2);
            break;
        }
    })
   }

}

class MouseEvent{
    isMouseDown=false;
    mouseDown=null;
    mouseMoveWithDown=null;
    mouseMoveWithoutDown=null;
    mouseUp=null;
    mouseWheel=null;
    downEvent=null;
    clickEvent=null;
    constructor(canvas){
        canvas.addEventListener("mousedown",this.onMouseDown)
        canvas.addEventListener("mousemove",this.onMouseMove)
        canvas.addEventListener("mouseup",this.onMouseUp)
        canvas.addEventListener("wheel",this.onwheel)
        canvas.addEventListener("click",this.onCLick)
    }
    getPointByEvent=(ev)=>{
        return {x:ev.offsetX,y:ev.offsetY}
    }
    onCLick=(ev)=>{
        if(this.clickEvent){
            const p=this.getPointByEvent(ev);
            this.clickEvent(p,ev) 
        }
    }
    onwheel=(ev)=>{
       if(this.mouseWheel){
        const p=this.getPointByEvent(ev);
        this.mouseWheel(p,ev)
       }  
    }
    onMouseDown=(ev)=>{
       this.isMouseDown=true;
       this.downEvent=ev;
       if(this.mouseDown){
        const p=this.getPointByEvent(ev);
        this.mouseDown(p,ev)
       }
    }
    onMouseMove=(ev)=>{
        const p=this.getPointByEvent(ev);
        if(this.isMouseDown){
            const p2=this.getPointByEvent(this.downEvent)
            if(this.mouseMoveWithDown && (p.x!==p2.x || p.y!=p2.y)){
                this.mouseMoveWithDown(p2,p,ev);
            }
        }
        else{
             if(this.mouseMoveWithoutDown){
                this.mouseMoveWithoutDown(p,ev)
             }
        }
    }
    onMouseUp=(ev)=>{
        const p=this.getPointByEvent(ev);
        const p2=this.getPointByEvent(this.downEvent);
        if(this.mouseUp){
            this.mouseUp(p2,p,ev)
        }
        this.isMouseDown=false;
    }

    addMouseDownEvent(cb){
      this.mouseDown=cb;
    }
    addMouseMoveWithDownEvent(cb){
     this.mouseMoveWithDown=cb;
    }
    addMouseMoveWithoutDown(cb){
         this.mouseMoveWithoutDown=cb;
    }
    addMouseUpEvent(cb){
       this.mouseUp=cb;
    }
    addMouseWeelEvent(cb){
        this.mouseWheel=cb;
    }
    addMouseClickEvent(cb){
        this.clickEvent=cb;
    }
}
class Shape{
    x;
    y;
    width;
    height;
    color;
    bgColor;
    opacity;
    rotation;
    id;
    name;
    tagName;
    attribute;
    isSelected;
    permission={
        rotation:true,
        drag:true,
        selection:true
    }
    render=null;
    vartualCOntext=new ContextShap();
    constructor(x,y,width,height){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
    }
    renderEle(){
        this.vartualCOntext.list=[];
        if(this.opacity){
           this.vartualCOntext.opacity(this.opacity)
        }
         this.render(this, this.vartualCOntext)
         //return vartualCOntext.list;   
    }
    draw(ctx){
        this.renderEle()
        this.vartualCOntext.drawShap(ctx)
    }
}


class SelectionPanel{
    selectionShape=null;
    isActive=false;
    shapeList=[];
    borderOffset=8;
    boundry={
        xmin:0,
        ymin:0,
        xmax:0,
        ymax:0
    }
    isSelected=false
    selectionEdge=null;
    initBounry(){
       this.boundry={
            xmin:null,
            ymin:null,
            xmax:null,
            ymax:null
        } 
    }
    tempBoundry=null;
    setSelectionShap(zoomUtil,shapList){
        this.initBounry()
        this.shapeList=shapList.filter((s)=>{
           const rectPoint = CanvasUtil.checkRectisInsideRect(this.shap,s)
           if(rectPoint){
               if(this.boundry.xmin==null){
                this.boundry={
                    xmin:rectPoint.x,
                    ymin:rectPoint.y,
                    xmax:rectPoint.x+rectPoint.width,
                    ymax:rectPoint.y+rectPoint.height
                }
               }
               else{
                    if(this.boundry.xmin>rectPoint.x){
                        this.boundry.xmin=rectPoint.x;
                    }

                    if(this.boundry.ymin>rectPoint.y){
                        this.boundry.ymin=rectPoint.y;
                    }


                    if(this.boundry.xmax<(rectPoint.x+rectPoint.width)){
                        this.boundry.xmax=rectPoint.x+rectPoint.width;
                    }

                    if(this.boundry.ymax<(rectPoint.y+rectPoint.height)){
                        this.boundry.ymax=rectPoint.y+rectPoint.height;
                    }
               }
              s.isSelected=true 
              return true 
           }
           else{
            s.isSelected=false 
            return false;
           }
        })
        // if(this.boundry.xmin!=null){
        //     this.boundry.xmin=this.boundry.xmin
        //     this.boundry.ymin=this.boundry.ymin
        //     this.boundry.xmax=this.boundry.xmax
        //     this.boundry.ymax=this.boundry.ymax
        // }
        console.log(this.shapeList,this.boundry,shapList)
    }

    checkPointIsInBorder(p){
      const midOffet=this.borderOffset/2;  
      const {xmin,ymin,xmax,ymax} = this.boundry;
      const top= CanvasUtil.checkPoinIsInsideRect({x:(xmin),y:(ymin-midOffet),width:(xmax-xmin),height:this.borderOffset},p)
      const bottom=CanvasUtil.checkPoinIsInsideRect({x:(xmin),y:(ymax-midOffet),width:(xmax-xmin),height:this.borderOffset},p)
      const left = CanvasUtil.checkPoinIsInsideRect({x:(xmin-midOffet),y:ymin,width:this.borderOffset,height:(ymax-ymin)},p)
      const right = CanvasUtil.checkPoinIsInsideRect({x:xmax-midOffet,y:ymin,width:this.borderOffset,height:(ymax-ymin)},p)

      const inSide = CanvasUtil.checkPoinIsInsideRect({x:xmin,y:ymin,width:(xmax-xmin),height:(ymax-ymin)},p)

      return {
        top,
        bottom,
        left,right,
        inSide
      }
    }
    setTemparyBoundry(){
         this.tempBoundry={...this.boundry};
    }
    updateSelectionShape(p1,p2,gridSize){
                console.log(this.selectionEdge)
                if(this.selectionEdge==SHAPE_SELECTION_EDGE_TYPE.LEFT){
                    const disX=p2.x-this.boundry.xmin;
                //  const disY=p2.y-this.boundry.ymin;
                    this.boundry.xmin+=disX;
                    this.shapeList=this.shapeList.map((s)=>{
                        s.x+=disX;
                        s.width-=disX
                        return s;
                    })
                    console.log(this.boundry)
                }
                else if(this.selectionEdge==SHAPE_SELECTION_EDGE_TYPE.RIGHT){
                    const disX=p2.x-this.boundry.xmax;
                //    const disY=p2.y-this.boundry.ymin;
                    this.boundry.xmax+=disX;
                    this.shapeList=this.shapeList.map((s)=>{
                    // s.x+=disX;
                        s.width+=disX
                        return s;
                    })
                }

                else if(this.selectionEdge==SHAPE_SELECTION_EDGE_TYPE.TOP){
                // const disX=p2.x-this.boundry.xmin;
                    const disY=p2.y-this.boundry.ymin;
                    this.boundry.ymin+=disY;
                    console.log("without grid==>",this.boundry.ymin)
                  //  this.boundry.ymin=CanvasUtil.getPointinGrid(this.boundry.ymin,gridSize)
                    console.log("with grid==>",this.boundry.ymin)

                    this.shapeList=this.shapeList.map((s)=>{
                    // s.x+=disX;
                        s.y+=disY
                        //s.y=CanvasUtil.getPointinGrid(s.y,gridSize)
                        s.height-=disY
                       // s.height=CanvasUtil.getPointinGrid(s.height,gridSize)
                        return s;
                    })
                }
                else if(this.selectionEdge==SHAPE_SELECTION_EDGE_TYPE.BOTTOM){
                // const disX=p2.x-this.boundry.xmin;
                    const disY=p2.y-this.boundry.ymax;
                    this.boundry.ymax+=disY;
                    this.shapeList=this.shapeList.map((s)=>{
                        s.height+=disY
                        return s;
                    })
                }
                else if(this.selectionEdge==SHAPE_SELECTION_EDGE_TYPE.INSIDE){
                const disXB= this.boundry.xmin - this.tempBoundry.xmin
                const disYB= this.boundry.ymin - this.tempBoundry.ymin    
                const disX=(p2.x-p1.x) - disXB
                const disY=(p2.y-p1.y) - disYB



                this.boundry.xmin+=disX;
                this.boundry.xmax+=disX;
                this.boundry.ymin+=disY;
                this.boundry.ymax+=disY;
                this.shapeList=this.shapeList.map((s)=>{
                    s.x+=disX
                    s.y+=disY
                    return s;
                })
                }
               
            }
    
}


class ZoomUtil{
    zoomIntensity = 0.0125;
    constructor(width,height,scale,cameraStartPos){
        this.width=width;
        this.height=height;
        this.scale=scale;
        this.cameraPos=cameraStartPos;
        this.visibleWidth = width; 
        this.visibleHeight = height;
        this.orgnx=cameraStartPos.x;
        this.orgny=cameraStartPos.y
    }

    zoom(ev,mousePosRaw,context){
        var scroll = ev.deltaY < 0 ? 1 : -2; 
        var zoom = Math.exp(scroll * this.zoomIntensity); 
        context.translate(this.orgnx, this.orgny); 
        this.orgnx -= mousePosRaw.x / (this.scale * zoom) - mousePosRaw.x / this.scale; 
        this.orgny -= mousePosRaw.y / (this.scale * zoom) - mousePosRaw.y / this.scale; 
        // Updating scale and visisble width and height 
        this.scale *= zoom; 
        context.scale(zoom, zoom); 
        context.translate(-this.orgnx, -this.orgny); 
        this.visibleWidth = this.width / this.scale; 
        this.visibleHeight = this.height / this.scale
    }
    getDivisiable(num,gridSize){
        num=parseInt(num+"");
        const rem=num%gridSize;
        if((gridSize/2)>rem){
           num=num-rem;
        }
        else{
            num=num+gridSize-rem
        }
        return num;
    }

    drawGrid(context,gridSize){
        const sWidth = CanvasUtil.getPointinGrid(this.width / this.scale,gridSize); 
        const sHeight =CanvasUtil.getPointinGrid(this.height / this.scale,gridSize);
        let x1= CanvasUtil.getPointinGrid(this.orgnx,gridSize)
        let y1=CanvasUtil.getPointinGrid(this.orgny,gridSize)
        let x2=sWidth+x1
        let y2=sHeight+y1
        let countY=(y2-y1)/gridSize;
        context.beginPath();
        context.globalAlpha = 0.1;
        for(let i=0;i<countY;i++){
            context.moveTo(x1,y1+(i*gridSize));
            context.lineTo(x2,y1+(i*gridSize));
        }
        let countX=(x2-x1)/gridSize;
        for(let i=0;i<countX;i++){
            context.moveTo(x1+(i*gridSize),y1);
            context.lineTo(x1+(i*gridSize),y2);
        }
        context.closePath();
        context.stroke();
    }

    getCanvasVartualPoint({x,y}){
      const x1= (x/this.scale)+this.orgnx;
      const y1=(y/this.scale)+this.orgny;
      return {
        x:x1,
        y:y1
      }
    }
    getScaleNumber(num){
        return Math.round(num*this.scale)
    }
}

const COMMAND_TYPE={
    POINTER:"POINTER",
    SHAPE:"SHAPE"
}

const  SHAPE_SELECTION_EDGE_TYPE={
    LEFT:"LEFT",
    RIGHT:"RIGHT",
    TOP:"TOP",
    BOTTOM:"BOTTOM",
    INSIDE:"INSIDE"
}

class CanvasPanel{
    shapeDetails={};
    shapeList=[]
    gridSize=1;
    gridVisibilty=false;

    commandType=COMMAND_TYPE.POINTER
    commandCategory="Rect";

    constructor(id){
        this.canvas=document.getElementById(id);

        const mouseEvent=new MouseEvent(this.canvas)
        let newShape=null;
        let shapeSelection=new SelectionPanel();
        //shapeSelection.borderOffset=this.gridSize
        mouseEvent.addMouseClickEvent((p)=>{

          // console.log("Click eveent==>",p)
        })
        mouseEvent.addMouseDownEvent((p1)=>{
            const gridPoint={
                x:CanvasUtil.getPointinGrid(p1.x, this.zoomUtil.getScaleNumber(this.gridSize)),
                y:CanvasUtil.getPointinGrid(p1.y,this.zoomUtil.getScaleNumber(this.gridSize))
            }
            const p= this.zoomUtil.getCanvasVartualPoint(gridPoint);

            this.tempBoundry=null;
           if(shapeSelection.isSelected){
            const {top,bottom,left,right,inSide}=shapeSelection.checkPointIsInBorder(this.zoomUtil.getCanvasVartualPoint(p1))
               if(top){
                shapeSelection.selectionEdge=SHAPE_SELECTION_EDGE_TYPE.TOP;
               }
               else if(bottom){
                shapeSelection.selectionEdge=SHAPE_SELECTION_EDGE_TYPE.BOTTOM;
               }
               else if(left){
                shapeSelection.selectionEdge=SHAPE_SELECTION_EDGE_TYPE.LEFT;
               }
               else if(right){
                shapeSelection.selectionEdge=SHAPE_SELECTION_EDGE_TYPE.RIGHT;
               }
               else if(inSide){
                shapeSelection.setTemparyBoundry();
                shapeSelection.selectionEdge=SHAPE_SELECTION_EDGE_TYPE.INSIDE;
               }
               else{
                shapeSelection.isSelected=false;
                shapeSelection.isActive=false;
               }
           } 
           if(this.commandType==COMMAND_TYPE.SHAPE){
                 newShape=this.addShape(this.commandCategory,{x:p.x,y:p.y,width:0,height:0,opacity:0.3})
                 executeInInterval(()=>{
                    this.ctx.save()
                    this.renderAllShape()               
                })
           }
           else if(this.commandType == COMMAND_TYPE.POINTER && !shapeSelection.isSelected ){
              shapeSelection.isActive=true;
              shapeSelection.shap =  this.addNewShape("Rect",{x:p.x,y:p.y,width:0,height:0,opacity:0.1})
              shapeSelection.shap.bgColor="blue"
              executeInInterval(()=>{
                this.ctx.save()
                this.renderAllShape()               
            },300)
           }

        })

        mouseEvent.addMouseMoveWithoutDown((p11)=>{
            const p= this.zoomUtil.getCanvasVartualPoint(p11);

            this.canvas.classList.remove("n-resize")
            this.canvas.classList.remove("e-resize")
            this.canvas.classList.remove("move")

            if(this.commandType==COMMAND_TYPE.POINTER && shapeSelection.isActive){
                const {top,bottom,left,right,inSide}=shapeSelection.checkPointIsInBorder(p)
                if(top || bottom){
                    this.canvas.classList.add("n-resize")
                }
                else if(left || right){
                    this.canvas.classList.add("e-resize")
                }
                else if(inSide){
                    this.canvas.classList.add("move")
                }
            }
            //console.log("mouse move without down eveent==>",p)
        })  

        mouseEvent.addMouseMoveWithDownEvent((p11,p21)=>{
            const gridPoint1={
                x:CanvasUtil.getPointinGrid(p11.x,this.zoomUtil.getScaleNumber(this.gridSize)),
                y:CanvasUtil.getPointinGrid(p11.y,this.zoomUtil.getScaleNumber(this.gridSize))
            }
            const gridPoint2={
                x:CanvasUtil.getPointinGrid(p21.x,this.zoomUtil.getScaleNumber(this.gridSize)),
                y:CanvasUtil.getPointinGrid(p21.y,this.zoomUtil.getScaleNumber(this.gridSize))
            }
            const p1= this.zoomUtil.getCanvasVartualPoint(gridPoint1);
            const p2= this.zoomUtil.getCanvasVartualPoint(gridPoint2);

              if(this.commandType==COMMAND_TYPE.SHAPE){
                  const width=p2.x-p1.x;
                  const height = p2.y-p1.y;
                  newShape.x=p1.x;
                  newShape.y=p1.y; 
                  newShape.width=width;
                  newShape.height=height
                  executeInInterval(()=>{
                    this.ctx.save()
                    this.renderAllShape()               
                  })
                  //console.log(newShape)   
              }
              else if(this.commandType==COMMAND_TYPE.POINTER && shapeSelection.isActive){
                        if(shapeSelection.isSelected){
                            shapeSelection.updateSelectionShape(p1,p2,this.gridSize);
                            executeInInterval(()=>{
                                // shapeSelection.shap.draw(this.ctx)                         
                                 this.renderNotSelected();
                                  this.drawBlurBackground();
                                  this.renderSelected(shapeSelection.boundry)
                                })
                        }
                        else{
                                const width=p2.x-p1.x;
                                const height = p2.y-p1.y;
                                shapeSelection.shap.width=width;
                                shapeSelection.shap.height=height;
                                executeInInterval(()=>{
                                    this.ctx.save()
                                    this.renderAllShape()    
                                    shapeSelection.shap.draw(this.ctx)           
                                })
                        }
               }
            //console.log("mouse move with down eveent==>",p1,p2)
        })



        mouseEvent.addMouseUpEvent((p)=>{
            if(this.commandType==COMMAND_TYPE.POINTER && !shapeSelection.isSelected){
                //this.shapeSelection.shap=null;
                // shapeSelection.shap.x=0;
                // shapeSelection.shap.y=0;
                // shapeSelection.shap.width=0;
                // shapeSelection.shap.height=0;
                shapeSelection.setSelectionShap(this.zoomUtil,this.shapeList)
                if(shapeSelection.shapeList.length>0){
                    shapeSelection.isSelected=true;
                   executeInInterval(()=>{
                   // shapeSelection.shap.draw(this.ctx)                         
                    this.renderNotSelected();
                     this.drawBlurBackground();
                     this.renderSelected(shapeSelection.boundry)
                   },true)
                }
                else{
                    // this.selectionShape.
                    shapeSelection.isActive=false
                    executeInInterval(()=>{
                            this.ctx.save()
                            this.renderAllShape() 
                            shapeSelection.shap.draw(this.ctx)                         
                    })
              }
            }
        })

        this.canvas.onwheel = (ev) => {
            console.log(ev)
            ev.preventDefault()
            this.zoomUtil.zoom(ev,{x:ev.offsetX,y:ev.offsetY},this.ctx)

            if(shapeSelection.isSelected){
               executeInInterval(()=>{

               // shapeSelection.shap.draw(this.ctx)                         
                this.renderNotSelected();
                 this.drawBlurBackground();
                 this.renderSelected(shapeSelection.boundry)
               },true)
            }
            else{
                executeInInterval(()=>{
                    this.ctx.save()
                    this.renderAllShape()               
                })
           }
        }

        this.width= parseInt(this.canvas.width);
        this.height= parseInt(this.canvas.height);
         this.ctx = this.canvas.getContext("2d");
         this.zoomUtil=new ZoomUtil(this.width,this.height,1,{x:0,y:0})
    }

    setGridVisibility(status){
        this.gridVisibilty=status;
    }

    setGridSize(size){
        this.gridSize=size;
    }

    addRender(name,render){
        this.shapeDetails[name]=render;
    }

    addNewShape(shapeName,{x,y,width,height,bgColor,opacity,id,name}){
        let s=new Shape(x,y,width,height);
        s.bgColor=bgColor;
        s.render=this.shapeDetails[shapeName];
        s.id=id;
        s.name=name;
        s.tag=shapeName;
        s.opacity=opacity || 1
        return s;
    }

    addShape(shapeName,{x,y,width,height,bgColor,opacity,id,name}){
        const s=this.addNewShape(shapeName,{
            x:CanvasUtil.getPointinGrid(x,this.gridSize),
            y:CanvasUtil.getPointinGrid(y,this.gridSize),
            width:CanvasUtil.getPointinGrid(width,this.gridSize),
            height:CanvasUtil.getPointinGrid(height,this.gridSize),
            bgColor,opacity,id,name
        })
        this.shapeList.push(s)
        return s;
    }

    renderNotSelected(){
        this.ctx.clearRect(this.zoomUtil.orgnx, this.zoomUtil.orgny, this.width/this.zoomUtil.scale, this.height/this.zoomUtil.scale)    
        // if(this.gridVisibilty){
        //   this.zoomUtil.drawGrid(this.ctx,this.gridSize);
        // }
        this.shapeList.forEach((shap)=>{
          if(!shap.isSelected){
              this.ctx.beginPath();
              shap.draw(this.ctx);
              this.ctx.closePath();
              this.ctx.stroke();
          }
        }) 
    }

   drawBlurBackground(){
    this.contextReset()
    this.ctx.beginPath();
    const grad=this.ctx.createLinearGradient(0,0, this.width,this.height);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(1, "#fff");

    this.ctx.fillStyle = grad;
    this.ctx.globalAlpha="0.6"
    this.ctx.fillRect(0,0,this.width,this.height)
    this.ctx.closePath();
    this.ctx.stroke();
    this.contextReset()
   }
   contextReset(){
        this.ctx.fillStyle="black";
        this.ctx.lineWidth=1;
        this.ctx.strokeStyle="black";
        this.ctx.globalAlpha="1"
   }
    renderSelected({xmin,ymin,xmax,ymax}){
       // this.ctx.clearRect(this.zoomUtil.orgnx, this.zoomUtil.orgny, this.width/this.zoomUtil.scale, this.height/this.zoomUtil.scale)    
        if(this.gridVisibilty){
          this.zoomUtil.drawGrid(this.ctx,this.gridSize);
        }
        this.contextReset()
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = "blue";
        this.ctx.rect(xmin,ymin,xmax-xmin,ymax-ymin)
        this.ctx.closePath();
        this.ctx.stroke();
        this.contextReset()
        this.shapeList.forEach((shap)=>{
          if(shap.isSelected){
              this.ctx.beginPath();
              shap.draw(this.ctx);
              this.ctx.closePath();
              this.ctx.stroke();
          }
        }) 
    }

    renderAllShape(){  
      this.ctx.clearRect(this.zoomUtil.orgnx, this.zoomUtil.orgny, this.width/this.zoomUtil.scale, this.height/this.zoomUtil.scale)    
      if(this.gridVisibilty){
        this.zoomUtil.drawGrid(this.ctx,this.gridSize);
      }
      this.shapeList.forEach((shap)=>{
            this.ctx.beginPath();
            shap.draw(this.ctx);
            this.ctx.closePath();
            this.ctx.stroke();
      })
    }

}