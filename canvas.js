let flag=true;
function executeInInterval(cb){
    if(flag){
        flag=false;
    setTimeout(()=>{
       cb()
       flag=true;
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
       // context.translate(-this.orgnx, -this.orgny); 
        const sWidth = this.getDivisiable(this.width / this.scale,gridSize); 
        const sHeight =this.getDivisiable(this.height / this.scale,gridSize);
        let x1= this.getDivisiable(this.orgnx,gridSize)
        let y1=this.getDivisiable(this.orgny,gridSize)
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
}

class CanvasPanel{
    zoomPoint={
        x:0,
        y:0
    }
    shapeDetails={};
    shapeList=[]
    gridSize=1;
    gridVisibilty=false;
    constructor(id){
        this.canvas=document.getElementById(id);
        this.canvas.addEventListener("click",(ev)=>{
            this.zoomPoint.x=ev.clientX;
            this.zoomPoint.y=ev.clientY;
        })
        this.canvas.onwheel = (ev) => {
            console.log(ev)
            ev.preventDefault()
            this.zoomUtil.zoom(ev,{x:ev.offsetX,y:ev.offsetY},this.ctx)
            executeInInterval(()=>{
                this.ctx.save()
                this.renderAllShape()               
            })
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

    addShape(shapeName,{x,y,width,height,bgColor,opacity,id,name}){
        let s=new Shape(x,y,width,height);
        s.bgColor=bgColor;
        s.render=this.shapeDetails[shapeName];
        s.id=id;
        s.name=name;
        s.tag=shapeName;
        s.opacity=opacity || 1
        this.shapeList.push(s)
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