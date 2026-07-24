import { act, useEffect } from 'react';
import { screenToWorld, getCornerWorldPos } from '../utils/coordinates';
import { checkHandleHit, isMouseNearLine } from '../utils/hitTesting';
import { FONT_SIZE, LINE_HEIGHT } from '../constants';


// Note:- This contains all event listners.It takes all data from InfiniteCanavs

export function useCanvasEvents(canvasRef, refs, actions) {

  // const currentStyle = refs.currentStyles.current;   // this here my guy, is stale closure...

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerDown = (e) => {
      if (refs.appMode.current === 'EDITING_TEXT' && refs.textArea.current) {
          refs.textArea.current.blur(); 
          
          if (refs.activeTool.current === 'text') {
              return; 
          }
      }

      const currentStyle = refs.currentStyles.current;

      if(e.button == 1 || e.button == 2 || e.shiftKey) { 
        refs.appMode.current = 'PANNING';
        canvas.style.cursor = 'grabbing';

        refs.startPan.current = {
          x: e.clientX - refs.camera.current.x,
          y: e.clientY - refs.camera.current.y
        }
      } else if(e.button == 0) {  
          const startPos = screenToWorld(e.clientX, e.clientY, refs.camera.current);

          switch(refs.activeTool.current) {
              case 'pointer':
                if(refs.selectedShapeId.current) {
                  const currentSelectedShape = refs.objects.current.find((obj) => obj.id == refs.selectedShapeId.current);

                  if(currentSelectedShape.type === 'line'){

                    const handleRadius = 10 / refs.camera.current.zoom;
                    let grabbedHandle = null;

                    // 1. Did they click a stretching handle? (Start, Mid, End)
                    currentSelectedShape.points.forEach((pt, index) => {
                        const dist = Math.hypot(startPos.x - pt.x, startPos.y - pt.y);
                        if (dist <= handleRadius) grabbedHandle = index;
                    });

                    if (grabbedHandle !== null) {
                        refs.appMode.current = 'RESIZING';
                        refs.activeHandleIndex.current = grabbedHandle;    // 0,1 or 2
                        
                        break;
                    }
                  }else{

                    if(currentSelectedShape) {
                      const clickedHandle = checkHandleHit(startPos, currentSelectedShape, 'ResizeHandle'); 
                    
                      if(clickedHandle) {
                        refs.appMode.current = 'RESIZING'; 
                        canvas.style.cursor = 'grabbing';
                        refs.resizePoint.current = clickedHandle; 

                        let oppositeCorner = '';
                        if (clickedHandle === 'nw') oppositeCorner = 'se';
                        if (clickedHandle === 'ne') oppositeCorner = 'sw';
                        if (clickedHandle === 'sw') oppositeCorner = 'ne';
                        if (clickedHandle === 'se') oppositeCorner = 'nw';
                        
                        refs.resizeAnchor.current = getCornerWorldPos(currentSelectedShape, oppositeCorner);

                        refs.originalPos.current = { 
                            x: currentSelectedShape.x, y: currentSelectedShape.y, 
                            width: currentSelectedShape.width, height: currentSelectedShape.height 
                        };

                        break;
                      }

                     }

                    if(currentSelectedShape && checkHandleHit(startPos, currentSelectedShape, 'RotationHandle')) {
                        refs.appMode.current = 'ROTATING';
                        canvas.style.cursor = 'grabbing';
                        refs.initialAngle.current = currentSelectedShape.angle; 
                          
                        break;
                     }
                  }
                  
                } 

                let hitFound = false;

                for(let i = refs.objects.current.length - 1; i >= 0; i--) {
                    const shape = refs.objects.current[i];

                    let isValidHit = false;

                    if(shape.type === 'line' && shape.points.length === 3){

                        // first selection detection
                        // 2. Did they click the line body?
                        const [p0, p1, p2] = shape.points;
                        isValidHit = isMouseNearLine(startPos.x, startPos.y, p0, p1, p2, refs.camera.current.zoom);

                    }else{
                        const centreX = shape.x + (shape.width) / 2;
                        const centreY = shape.y + (shape.height) / 2;
                        
                        const relX = startPos.x - centreX;
                        const relY = startPos.y - centreY;

                        const angle = shape.angle || 0;
                        const updatedMouseX = relX * Math.cos(-angle) - relY * Math.sin(-angle); 
                        const updatedMouseY = relX * Math.sin(-angle) + relY * Math.cos(-angle);

                        const isIndexX = updatedMouseX >= -shape.width / 2 && updatedMouseX <= shape.width / 2;
                        const isIndexY = updatedMouseY >= -shape.height / 2 && updatedMouseY <= shape.height / 2;

                        if(isIndexX && isIndexY) {

                            // hollow-rectangle...?
                             isValidHit = true;  // let's say we hit

                            if (shape.type === 'rectangle' && (!shape.fill || shape.fill === 'transparent')){

                              // Give them 10 pixels of clickable border (scales with zoom)
                              const tolerance = 10 / refs.camera.current.zoom;

                              // Check if they clicked inside the dead zone (the empty middle)
                                const isInsideHollowX = updatedMouseX > (-shape.width / 2) + tolerance && 
                                                        updatedMouseX < (shape.width / 2) - tolerance;
                                
                                const isInsideHollowY = updatedMouseY > (-shape.height / 2) + tolerance && 
                                                        updatedMouseY < (shape.height / 2) - tolerance;
                                
                                // If they clicked the empty middle, invalidate the hit!
                                if (isInsideHollowX && isInsideHollowY) {
                                    isValidHit = false;
                                }
                            }
                        }
                    }

                    // If it's solid, OR they clicked exactly on the border...
                    if(isValidHit){
                        refs.selectedShapeId.current = shape.id;
                        actions.onShapeSelect(shape.id);    // this push the props of objects, to context UI, so it can update according to shape..
                        hitFound = true;

                        refs.originalPos.current = {x: shape.x, y: shape.y}; 

                        refs.appMode.current = 'DRAGGING'; 
                        refs.grabOffset.current = {
                            x: startPos.x - shape.x,
                            y: startPos.y - shape.y
                        };

                        break; 
                      }             
                  }

              if (!hitFound){
                  refs.selectedShapeId.current = null;
                  actions.onShapeSelect(null);
              }  
              break;

              case 'rectangle':
                  refs.appMode.current = 'DRAWING';

                  // const currentStyle = refs.currentStyles.current;   // when shape draw, add style state object (update, removed for global access...)

                  const newShape = {
                      id: crypto.randomUUID(),
                      type: 'rectangle', 
                      x: startPos.x,
                      y: startPos.y,  
                      width: 0,
                      height: 0,
                      angle: 0,

                      stroke: currentStyle.stroke,
                      fill: currentStyle.fill,
                      strokeWidth: currentStyle.strokeWidth,
                      edges: currentStyle.edges,
                      color: currentStyle.stroke,
    
                      text: '',
                      align: 'center',
                  };

                  refs.objects.current.push(newShape);
                  refs.activeShapeId.current = newShape.id;
                  break;
              
              case 'pen':
                refs.appMode.current = 'DRAWING'; 
                refs.currentPath.current = {
                  type: 'pen',
                  points: [{x: startPos.x, y: startPos.y}],
                  color: currentStyle.stroke,
                  strokeWidth: currentStyle.strokeWidth,
                  isClosed: false,
                  fillColor: currentStyle.fill,
                }
                break;

              case 'line':
                refs.appMode.current = 'DRAWING';
                
                const newLine = {
                    id: crypto.randomUUID(),
                    type: 'line',
                    // Initialize with 2 points that are exactly the same
                    // points[0] = start, points[1] = end
                    points: [
                        { x: startPos.x, y: startPos.y }, 
                        { x: startPos.x, y: startPos.y }
                    ],
                    
                    // Grab the current styles just like your rectangle
                    color: currentStyle.stroke,
                    strokeWidth: currentStyle.strokeWidth,
                    // (Lines don't technically need fill, but good to keep data consistent)
                    fill: currentStyle.fill, 
                };

                refs.objects.current.push(newLine);
                refs.activeShapeId.current = newLine.id;
                break;
              
              case 'erasor':
                refs.appMode.current = 'ERASING'; 
                break;
              
              case 'text':
                 refs.appMode.current = 'EDITING_TEXT';
                 e.preventDefault();

                 actions.setTextInput((prev) => {   
                     if (!prev.isVisible && prev.x === -99999 && prev.y === -99999) {
                        return {
                            isVisible: true,
                            x: startPos.x,
                            y: startPos.y
                        };
                    }
                  return prev;
              })
          }        
        }
    };

    const handlePointerMove = (e) => {
      const currentPos = screenToWorld(e.clientX, e.clientY, refs.camera.current);

      switch(refs.appMode.current) {
          case 'PANNING':
            refs.camera.current.x = e.clientX - refs.startPan.current.x;
            refs.camera.current.y = e.clientY - refs.startPan.current.y;
            break;

          case 'DRAWING':
            if (refs.activeTool.current === 'pen') {
                refs.currentPath.current.points.push({ x: currentPos.x, y: currentPos.y }); 
            } else if (refs.activeShapeId.current) {
                const shape = refs.objects.current.find((obj) => obj.id === refs.activeShapeId.current);
                if(shape.type === 'line'){
                    // Update the END point of the line to follow the mouse
                   shape.points[1] = { x: currentPos.x, y: currentPos.y };
                }
                else if (shape.type === 'rectangle'){
                    shape.width = currentPos.x - shape.x; 
                    shape.height = currentPos.y - shape.y; 
                }
            }
            break;
          
          case 'ERASING':
            const mouseX = currentPos.x; 
            const mouseY = currentPos.y; 
            let hitFound = false;

            for (let i = refs.objects.current.length - 1; i >= 0; i--) { 
                const shape = refs.objects.current[i];

                 if(shape.type === 'line' && shape.points.length === 3){

                        // first selection detection
                        // 2. Did they click the line body?
                        const [p0, p1, p2] = shape.points;
                        hitFound = isMouseNearLine(currentPos.x, currentPos.y, p0, p1, p2, refs.camera.current.zoom);

                }
                
                if (shape.type === 'rectangle') { 
                    if (mouseX >= shape.x && mouseY >= shape.y && mouseX <= shape.x + shape.width && mouseY <= shape.y + shape.height) { 
                        hitFound = true; 
                    }
                } else if (shape.type === 'text') {
                    const canvasContext = canvasRef.current.getContext('2d'); 
                    canvasContext.font = '24px sans-serif'; 
                    const metrics = canvasContext.measureText(shape.text); 
                    const textWidth = metrics.width;
                    const textHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent; 

                    if (mouseX >= shape.x && mouseY >= shape.y && mouseX <= shape.x + textWidth && mouseY <= shape.y + textHeight) { 
                        hitFound = true; 
                    }
                } else if (shape.type === 'pen') { 
                    let boundArea = 10; 
                    for (let j = 0; j < shape.points.length; j++) { 
                        const point = shape.points[j]; 
                        const a = mouseX - point.x; 
                        const b = mouseY - point.y; 
                        const dist = Math.sqrt((a * a) + (b * b)); 

                        if (dist <= boundArea) { 
                            hitFound = true; 
                            break; 
                        }
                    }
                }

                if (hitFound) {
                    refs.objects.current.splice(i, 1); 
                    
                    if (refs.socket.current?.readyState === WebSocket.OPEN) { 
                        refs.socket.current.send(JSON.stringify({ 
                            type: 'shape:delete', 
                            data: { id: shape.id } 
                        })); 
                    }
                    break; 
                }
            }
            break;

          case 'RESIZING':
            if(refs.selectedShapeId.current) {
                const shape = refs.objects.current.find((obj) => obj.id == refs.selectedShapeId.current);

                // 1. --- NEW LINE RESIZING LOGIC ---
                // If it's a line, just move the exact point we grabbed and skip the rest
                if (shape.type === 'line') {
                    const pointIndex = refs.activeHandleIndex.current;
                    if (pointIndex !== null) {
                      switch(pointIndex){

                        case 2:
                          shape.points[pointIndex].x = currentPos.x;
                          shape.points[pointIndex].y = currentPos.y;

                          shape.points[1].x = (shape.points[0].x + shape.points[pointIndex].x) /2
                          shape.points[1].y = (shape.points[0].y + shape.points[pointIndex].y) /2

                          break;
                        
                        case 0:
                          shape.points[pointIndex].x = currentPos.x;
                          shape.points[pointIndex].y = currentPos.y;

                          shape.points[1].x = (shape.points[2].x + shape.points[pointIndex].x) /2
                          shape.points[1].y = (shape.points[2].y + shape.points[pointIndex].y) /2

                          break;
                        
                        case 1:

                          shape.points[pointIndex].x = currentPos.x;
                          shape.points[pointIndex].y = currentPos.y;

                          break;

                      }            
                    }
                    break; // Exit the case early! */
                }

                const anchorX = refs.resizeAnchor.current.x;
                const anchorY = refs.resizeAnchor.current.y;
                
                const mouseX = currentPos.x;
                const mouseY = currentPos.y;

                const centreX = (anchorX + mouseX) / 2;
                const centreY = (anchorY + mouseY) / 2;

                const dx = mouseX - anchorX;
                const dy = mouseY - anchorY;

                const angle = shape.angle || 0;
                const relX = dx * Math.cos(-angle)- dy * Math.sin(-angle);
                const relY = dx * Math.sin(-angle) + dy * Math.cos(-angle);

                shape.width = Math.abs(relX);

                if(shape.type === 'text') {
                  const canvasContext = canvasRef.current.getContext('2d');
                  canvasContext.font = `${FONT_SIZE}px sans-serif`;

                  let totalLines = 0;   
                  const paragraphs = shape.text.split('\n');
            
                  paragraphs.forEach((paragraph) => {
                      const words = paragraph.split(' ');
                      let currentLine = words[0] || '';
                      totalLines++; 

                      for(let i = 1; i < words.length; i++) {
                          const word = words[i];
                          const testLine = currentLine + ' ' + word;
                          const metrics = canvasContext.measureText(testLine);

                          if(metrics.width > shape.width) {
                              totalLines++; 
                              currentLine = word;
                          } else {
                              currentLine = testLine;
                          }
                      }
                  }) 
                  
                  shape.height = totalLines * LINE_HEIGHT

                  const forcedRelY = (relY >= 0 ? 1 : -1) * shape.height;   

                  const centreOffsetX = (relX / 2) * Math.cos(angle) - (forcedRelY / 2) * Math.sin(angle);    
                  const centreOffsetY = (relX / 2) * Math.sin(angle) + (forcedRelY / 2) * Math.cos(angle);
                  
                  shape.x = (anchorX + centreOffsetX) - (shape.width / 2);
                  shape.y = (anchorY + centreOffsetY) - (shape.height / 2);
                } else {
                     shape.height = Math.abs(relY);
                                     
                     shape.x = centreX - (shape.width / 2);
                     shape.y = centreY - (shape.height / 2);
                }
              }
              break;

          case 'ROTATING':
            if (refs.selectedShapeId.current) { 

                const shape = refs.objects.current.find((obj) => obj.id === refs.selectedShapeId.current); 

                if (shape.type === 'line') break;

                const centreX = shape.x + shape.width / 2; 
                const centreY = shape.y + shape.height / 2;
                
                const dx = currentPos.x - centreX; 
                const dy = currentPos.y - centreY;

                shape.angle = Math.atan2(dy, dx) + (Math.PI / 2); 
            }
            break;
          
          case 'DRAGGING':
            if (refs.selectedShapeId.current) { 
                const shape = refs.objects.current.find((obj) => obj.id === refs.selectedShapeId.current);
                if (shape) { 
                    shape.x = currentPos.x - refs.grabOffset.current.x; 
                    shape.y = currentPos.y - refs.grabOffset.current.y; 
                }
            }
            break;
      }

      const now = Date.now();   

      if(now - (refs.lastMoveTime?.current || 0) > 50) {  
          if (refs.socket.current && refs.socket.current.readyState === WebSocket.OPEN) {
              const cursorPayload = JSON.stringify({
                type: 'cursor:move',
                data: { id: refs.myUserId.current, x: currentPos.x, y: currentPos.y }
              });
              refs.socket.current.send(cursorPayload);

              if (['DRAGGING', 'RESIZING', 'ROTATING'].includes(refs.appMode.current) && refs.selectedShapeId.current) { 
                    const shape = refs.objects.current.find((obj) => obj.id === refs.selectedShapeId.current); 
                    const shapePayload = JSON.stringify({ type: 'shape:move', data: shape });
                    refs.socket.current.send(shapePayload);
              }
          }

          if (refs.lastMoveTime) refs.lastMoveTime.current = now;
      }
    };

    const handlePointerUp = () => {
      switch (refs.appMode.current) {
            case 'EDITING_TEXT':
                return; 
            
            case 'PANNING':
            case 'ERASING':
                break;

            case 'DRAWING':
                if (refs.activeTool.current === 'pen') {
                    const finishedPath = refs.currentPath.current;

                    if (finishedPath.points.length > 1) { 
                        const deepCopiedPoints = finishedPath.points.map(point => ({ 
                            x: point.x, 
                            y: point.y 
                        })); 

                        const first = deepCopiedPoints[0];
                        const last = deepCopiedPoints[deepCopiedPoints.length - 1];
                        const distance = Math.hypot(last.x - first.x, last.y - first.y);
                         
                        const isClosed = distance < 10; // 30;

                        // bounding box logic...(width and height find...)
                        let minX = Infinity;
                        let minY = Infinity;
                        let maxX = -Infinity;
                        let maxY = -Infinity;

                        deepCopiedPoints.forEach(pt => {
                            if (pt.x < minX) minX = pt.x;
                            if (pt.y < minY) minY = pt.y;
                            if (pt.x > maxX) maxX = pt.x;
                            if (pt.y > maxY) maxY = pt.y;
                        });

                        const width = maxX - minX;
                        const height = maxY - minY;
                        
                        
                        const newFreehandShape = { 
                            id: crypto.randomUUID(), 

                            ...finishedPath,

                            points: deepCopiedPoints,
                            isClosed: isClosed,

                            x: minX,
                            y: minY,
                            width: width,
                            height: height,
                            angle: 0 
                        }; 

                        refs.objects.current.push(newFreehandShape); 


                       // three lines added for dedicated pen select(can be bugged...check later)
                        refs.selectedShapeId.current = newFreehandShape.id;
                        actions.onShapeSelect(newFreehandShape.id);

                        actions.setActiveTool('pointer');

                        if (refs.socket.current?.readyState === WebSocket.OPEN) { 
                            refs.socket.current.send(JSON.stringify({ type: 'shape:new', data: newFreehandShape })); 
                        } 
                        actions.saveCommand({ actionType: 'ADD_SHAPE', data: newFreehandShape }); 
                    }
                    refs.currentPath.current = []; 
                } else if (refs.activeShapeId.current) {
                    const shape = refs.objects.current.find((obj) => obj.id === refs.activeShapeId.current);
                    if (shape) { 
                      let shouldDelete = false;

                      if (shape.type === 'rectangle'){
                        if (shape.width < 0) { shape.x += shape.width; shape.width = Math.abs(shape.width); } 
                        if (shape.height < 0) { shape.y += shape.height; shape.height = Math.abs(shape.height); } 

                        if (shape.width === 0 && shape.height === 0) { 
                            //refs.objects.current = refs.objects.current.filter(obj => obj.id !== shape.id);
                            shouldDelete = true;
                        }

                      }
                      else if (shape.type === 'line') {
                          // If they clicked without dragging, the line is 0 pixels long

                          console.log('line have neem drawn...')   // test..
                            
                          if (shape.points[0].x === shape.points[1].x && shape.points[0].y === shape.points[1].y) {
                              shouldDelete = true;
                          }else{
                              const p0 = shape.points[0];
                              const p1 = shape.points[1];

                              // Inject the middle point
                              const midX = (p0.x + p1.x) / 2;
                              const midY = (p0.y + p1.y) / 2;

                              shape.points = [p0, { x: midX, y: midY }, p1];
                              
                          }
                      }
                      if (shouldDelete) { 
                        refs.objects.current = refs.objects.current.filter(obj => obj.id !== shape.id);
                      }
                      else { 
                          if (refs.socket.current?.readyState === WebSocket.OPEN) { 
                              refs.socket.current.send(JSON.stringify({ type: 'shape:new', data: shape }));
                          } 
                          actions.saveCommand({ actionType: 'ADD_SHAPE', data: { ...shape } }); 

                          refs.selectedShapeId.current = shape.id;   
                          
                          console.log(`new  drawn ${shape.type} have been selected...`)    // test..

                          actions.onShapeSelect(shape.id);    
                          refs.activeShapeId.current = null; 

                          actions.setActiveTool('pointer');
                      }
                    }
                }
                break;

            case 'DRAGGING':
                if (refs.selectedShapeId.current) { 
                    const draggedShape = refs.objects.current.find((obj) => obj.id === refs.selectedShapeId.current); 
                    
                    if (draggedShape && refs.socket.current?.readyState === WebSocket.OPEN) { 
                        refs.socket.current.send(JSON.stringify({ type: 'shape:move', data: draggedShape })); 
                    } 

                    if (refs.originalPos.current.x !== draggedShape.x || refs.originalPos.current.y !== draggedShape.y) { 
                        actions.saveCommand({ 
                            actionType: 'MOVE_SHAPE',
                            data: {
                                id: draggedShape.id, 
                                oldX: refs.originalPos.current.x, oldY: refs.originalPos.current.y,
                                newX: draggedShape.x, newY: draggedShape.y 
                            } 
                        }); 
                    }
                }
                break;

            case 'RESIZING':
                if (refs.selectedShapeId.current) { 
                    const resizedShape = refs.objects.current.find((obj) => obj.id === refs.selectedShapeId.current); 
                    if (resizedShape && refs.socket.current?.readyState === WebSocket.OPEN) { 
                        refs.socket.current.send(JSON.stringify({ type: 'shape:move', data: resizedShape })); 
                    } 
                }
                break;

            case 'ROTATING':
                if (refs.selectedShapeId.current) { 
                    const rotatedShape = refs.objects.current.find((obj) => obj.id === refs.selectedShapeId.current); 
                    if (rotatedShape && refs.socket.current?.readyState === WebSocket.OPEN) { 
                        refs.socket.current.send(JSON.stringify({ type: 'shape:move', data: rotatedShape })); 
                    } 
                    if (rotatedShape.angle !== refs.initialAngle.current) { 
                        actions.saveCommand({ 
                            actionType: 'ROTATE_SHAPE', 
                            data: { id: rotatedShape.id, oldAngle: refs.initialAngle.current, newAngle: rotatedShape.angle } 
                        });
                    } 
                }
                break;
        }

        if (refs.appMode.current !== 'EDITING_TEXT') {
            refs.appMode.current = 'IDLE'; 
            canvas.style.cursor = 'default';
            //refs.activeTool.current = 'pointer'; 
        }
         
         
    };

    const handleKeyDown = (e) => {
      if (e.repeat) return;

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;    // for chaging color code, if press key, don't do if active...?

      const mainKey = e.key.toLowerCase();
      const isModifierPressed = e.ctrlKey;

      if((e.key == 'Backspace' || e.key == 'Delete') && refs.selectedShapeId.current) {
        if(refs.socket.current && refs.socket.current.readyState == WebSocket.OPEN) {
          const payload = JSON.stringify({
            type:'shape:delete',
            data: {id: refs.selectedShapeId.current}
          })
          refs.socket.current.send(payload);
        }

        const shapeToDelete = refs.objects.current.find(obj => obj.id === refs.selectedShapeId.current);

        const commandData = {
          actionType: 'DELETE_SHAPE',
          data: {...shapeToDelete}
        }

        actions.saveCommand(commandData);

        refs.objects.current = refs.objects.current.filter((obj) => obj.id !== refs.selectedShapeId.current);
        refs.selectedShapeId.current = null;
      }

      if(isModifierPressed && mainKey === 'z') {
        e.preventDefault();
        actions.undo();
        return;
      }
       
      if(isModifierPressed && mainKey === 'y') {
        e.preventDefault();
        actions.redo();
        return;
      }
    };
 
    const handleDoubleClick = (e) => { 
      const clickPos = screenToWorld(e.clientX, e.clientY, refs.camera.current);

        for(let i = refs.objects.current.length - 1; i >= 0; i--) {
            const shape = refs.objects.current[i];

            //NOTE:- text-on rectangle is paused....for the time being....(will come back letter...) 

            if(shape.type === 'text' /* || shape.type === 'rectangle' */) {
                const centreX = shape.x + (shape.width / 2);
                const centreY = shape.y + (shape.height / 2);
                                    
                const relX = clickPos.x - centreX;
                const relY = clickPos.y - centreY;

                const angle = shape.angle || 0;
                const updatedMouseX = relX * Math.cos(-angle) - relY * Math.sin(-angle); 
                const updatedMouseY = relX * Math.sin(-angle) + relY * Math.cos(-angle);

                const isIndexX = updatedMouseX >= -shape.width / 2 && updatedMouseX <= shape.width / 2;
                const isIndexY = updatedMouseY >= -shape.height / 2 && updatedMouseY <= shape.height / 2;

                if(isIndexX && isIndexY) {
                    shape.isHidden = true;
                    refs.appMode.current = 'EDITING_TEXT';
                    refs.selectedShapeId.current = null;  

                    actions.setTextInput({
                      isVisible: true,

                      mode: shape.type === 'text' ? 'standalone' : 'shape',

                      x: shape.type === 'text' ? shape.x : centreX,   // shape.x,
                      y: shape.type === 'text' ? shape.y : centreY,   //shape.y,
                      width: shape.width,          // can't comment this,(commented for debug purpose (without it,
                                                   // translate(-50%, -50%) don't have ref point to pull textbox...(too much shift....)
                                                   // this creates a stopper, which itnitaes wrapping....and thus dynamic heigh..so okay
                      
                      height: shape.height,      
                      editingId: shape.id,
                      initialText: shape.text,
                      angle: shape.angle || 0,
                      textAlign: shape.textAlign,   // might be bugged... what if change align when db-clicked...(still read shape...?)
                      stroke: shape.stroke,   
                    });

                    break;
                }
            }
        }
    };

    const handleWheel = (e) => {
      e.preventDefault();

      let zoomFactor = 1.1;  
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      let worldTarget = screenToWorld(mouseX, mouseY, refs.camera.current);  

      if(e.deltaY < 0) { 
        refs.camera.current.zoom = Math.min( refs.camera.current.zoom * zoomFactor, 20); 
      } else { 
        refs.camera.current.zoom = Math.max(refs.camera.current.zoom /  zoomFactor , 0.05);  
      }

      refs.camera.current.x = mouseX - worldTarget.x * refs.camera.current.zoom;
      refs.camera.current.y = mouseY - worldTarget.y * refs.camera.current.zoom;

      actions.setZoomDisplay(Math.round(refs.camera.current.zoom * 100));
    };

    const handleContextMenu = (e) => e.preventDefault();

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove); 
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('dblclick', handleDoubleClick);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    }; 
  }, [canvasRef]);  // removed refs, actions
}