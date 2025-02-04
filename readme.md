# CanvasPanel
  ## constructor
     new CanvasPanel(id)
     eg - let canvasPanel=new CanvasPanel("canvas");

  ## Define Shape
       canvasPanel.addRender(ShapeName,callback)
       ~ In Callback there are two argument 1st is attribute  
        1. x 
        2. y
        3. width
        4. height
        5. opacity
        6. color
        7. bgColor
      ~ In 2nd argument is context of canvas 

  ## Add new Shape
     Which shape is define in addRender you can add here
     canvasPanel.addShape(shapeName,attribue)

  ## render All shape
     canvasPanel.renderAllShape();
     using this method we can re render all shape

  ## Set grid gize
     canvasPanel.setGridSize(num)
     Here num is size of grid size


  ## set Grid Visibility

    Canvas.setGridVisibility(status)

    Here stutus is boolean true or false by defualt it is false but if you set true the grid will display on canvas

 ## set Command 

    Canvas.setCommand(commandName)

    Here command name will be Define Shape name or some pre define name
    eg
      1. Rect
      2. Line
      3. Pointer
      4. Selection

 ## atribute of shape
      {
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
      }
          
## Context of Shape

  ### rect(x,y,width,height)
  ###  line(x1,y1,x2,y2)
  ### color(color)
  ### bgColor(color)
  ### opacity(num)
  ### fillRect(x,y,width,height,color)

 ## Find Shape
   ### By Id
      Canvas.findShapById(id)
      it will return Only one shape
    
   ## By Name
      
      Canvas.findShapByName(name)

      it will return array of list of Shape

   ## By Tag Name

      Canvas.findShapByTag(tagName)
      it will return array of list of shap

# Shape Opreation
## define
    You can get Shap by id, name and tagname
    Eg let shape = Canvas.findShapById(id);
## set Opacity
   shape.opacity(num)
   num will be 0 to 1

## set Selection
   shape.select(true)

## set Attribute
   shape.setAttribute(attribute)

## set Postion
   shape.setPostion(x,y)

## set Size
  shape.setSize(width,height)

## set Background color

 shape.setBg(color)

## set Color 
   shape.setColor(color)


## set rotation angle
   shape.setRoation(angle)
        