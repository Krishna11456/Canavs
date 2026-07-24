import { FONT_SIZE, LINE_HEIGHT, GRID_SIZE } from '../constants';
import { screenToWorld } from '../utils/coordinates';
import { drawSmoothPath } from '../utils/drawSmoothPath';


// Note: This function handles the main rendering logic of objects.It takes data from UseRenderer hook fucntion....

export function renderFrame(ctx, canvas, snapshot) {
  const { camera, objects, selectedShapeId, currentPath, appMode, activeTool } = snapshot;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);

  // --- DRAW GRID ---
  const topLeft = screenToWorld(0, 0, camera);
  const bottomRight = screenToWorld(window.innerWidth, window.innerHeight, camera);
  
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1 / camera.zoom;
  ctx.beginPath();

  const startX = Math.floor(topLeft.x / GRID_SIZE) * GRID_SIZE;
  for (let x = startX; x < bottomRight.x; x += GRID_SIZE) {
    ctx.moveTo(x, topLeft.y); ctx.lineTo(x, bottomRight.y);
  }
  const startY = Math.floor(topLeft.y / GRID_SIZE) * GRID_SIZE;
  for (let y = startY; y < bottomRight.y; y += GRID_SIZE) {
    ctx.moveTo(topLeft.x, y); ctx.lineTo(bottomRight.x, y);
  }
  ctx.stroke();

  // --- DRAW SHAPES ---
  objects.forEach((obj) => {
    // Paste your existing shape drawing logic here (text, freehand, rectangle)  (DONE...?)
    // Make sure to remove any `.current` references, use the `obj` directly.

    if(obj.type === 'text' && !obj.isHidden){

        ctx.save()   // since taking angle in acoount, save and restore applied here also

        const centreX = obj.x + (obj.width / 2);
        const centreY = obj.y + (obj.height / 2);
        ctx.translate(centreX, centreY);

        //Spin canavs
        ctx.rotate(obj.angle || 0);
        
        ctx.font = `${FONT_SIZE}px sans-serif`;
        ctx.fillStyle = obj.stroke || 'white';
        ctx.textBaseline = 'middle'; 
        ctx.textAlign = obj.textAlign || 'left';

        const startX = -obj.width / 2;
        const startY = -obj.height / 2;

        // array to hold each line total words(this is tart of wrapping around effect addition for text)
        const wrappedLines = [];

        const paragraphs = obj.text.split('\n');   // split based on enter-key

        paragraphs.forEach((paragraph) => {
            
            const words = paragraph.split(' ');
            let currentLine = words[0] || '';

            for(let i = 1; i < words.length; i++){

            const word = words[i];

            const testLine = currentLine + ' ' + word;
            const metrics = ctx.measureText(testLine);

            if(metrics.width > obj.width){
                wrappedLines.push(currentLine); // push current to wrapped
                // start new line
                currentLine = word;
            }else{
                currentLine = testLine;
            }
            }
            wrappedLines.push(currentLine);  // last left line pushed
        })

        let renderX = startX;

        if (obj.textAlign === 'center') {
            renderX = 0;
        } else if (obj.textAlign === 'right') {
            renderX = obj.width / 2;
        }
        

        // paint the text on screen...
        wrappedLines.forEach((line, i) => {
            ctx.fillText(line, /*startX*/ renderX, startY + LINE_HEIGHT / 2 +  i * LINE_HEIGHT);
        });

        ctx.restore();

    }
    

    else if(obj.type === /* 'freehand' */ 'pen'){

        // dry-Ink (already exist in object array...)
        drawSmoothPath(ctx, obj.points, obj.color, obj.strokeWidth, obj.isClosed, obj.fillColor, 'dry-Ink');   // last message for debug

    }

    else if(obj.type === 'line'){
        ctx.save(); // Save canvas state before applying specific styles

        // Apply the shape's styles
        ctx.strokeStyle = obj.color || '#000000';
        ctx.lineWidth = obj.strokeWidth || 2;
        ctx.lineCap = 'round'; // Makes the ends of the line look much nicer
        ctx.lineJoin = 'round';

        ctx.beginPath();
        
        // The line always starts at point 0
        const p0 = obj.points[0];
        ctx.moveTo(p0.x, p0.y);

        if (obj.points.length === 2) {
            // STATE 1: Straight Line (Drawing mode)
/*             const p1 = obj.points[1];
            ctx.lineTo(p1.x, p1.y); */

            const p0 = obj.points[0];
            const p1 = obj.points[1]; // Currently the end point
        
            // Inject the middle point
            const midX = (p0.x + p1.x) / 2;
            const midY = (p0.y + p1.y) / 2;

            // shape is permanently [Start, Middle, End]
            obj.points = [p0, { x: midX, y: midY }, p1];
        } 
        else if (obj.points.length === 3) {
            // STATE 2: Curved Line (Bend mode - for later)
            const p_mid = obj.points[1];
            const p_end = obj.points[2];

            // The math magic: calculate the invisible control point 
            // so the curve passes exactly through the user's middle handle
            const controlX = 2 * p_mid.x - 0.5 * (p0.x + p_end.x);
            const controlY = 2 * p_mid.y - 0.5 * (p0.y + p_end.y);

            ctx.quadraticCurveTo(controlX, controlY, p_end.x, p_end.y);
        }

        ctx.stroke();
        ctx.restore(); // Restore canvas state so we don't mess up the next shape
    }

    else if(obj.type === 'rectangle'){
        ctx.save();

        const centreX = obj.x + (obj.width / 2);
        const centreY = obj.y + (obj.height / 2);
        ctx.translate(centreX, centreY);

        // 3. Apply rotation (If obj.angle is undefined or 0, this does nothing!)
        ctx.rotate(obj.angle || 0);

        // stroke...
        let lineThickness = 4; // thin
        if (obj.strokeWidth === 'bold') lineThickness = 5;
        if (obj.strokeWidth === 'extraBold') lineThickness = 6;

        // If the UI is set to round, give it a 16px curve, otherwise 0px (sharp)
        let radius = obj.edges === 'round' ? 16 : 0;

        // 👉 2. CREATE THE SHAPE PATH
        ctx.beginPath();
        ctx.roundRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height, radius);

        // 👉 3. PAINT THE FILL (Only if it is NOT transparent)
        if (obj.fill && obj.fill !== 'transparent') {
            ctx.fillStyle = obj.fill;
            ctx.fill(); // This fills the roundRect path
        }

        // 👉 4. PAINT THE STROKE
        ctx.lineWidth = lineThickness;
        ctx.strokeStyle = obj.stroke || obj.color || '#1e1e1e';
        ctx.stroke(); // This outlines the roundRect path


        // Paint the text inside it! (If there is any)
        if (obj.text && obj.text.trim() !== '' && !obj.isHidden) {
            ctx.font = `${FONT_SIZE}px sans-serif`; // Or obj.fontSize
            ctx.fillStyle = 'white'; // Or contrasting color
            
            // Center the text perfectly inside the box
            ctx.textBaseline = 'middle'; 
            ctx.textAlign = 'center'; 

            // --- YOUR EXACT WRAPPING ALGORITHM ---
            const wrappedLines = [];
            const paragraphs = obj.text.split('\n');

            paragraphs.forEach((paragraph) => {
                const words = paragraph.split(' ');
                let currentLine = words[0] || '';

                for(let i = 1; i < words.length; i++){
                    const word = words[i];
                    const testLine = currentLine + ' ' + word;
                    const metrics = ctx.measureText(testLine);

                    // Check against the rectangle's width!
                    if(metrics.width > obj.width){
                        wrappedLines.push(currentLine); 
                        currentLine = word;
                    }else{
                        currentLine = testLine;
                    }
                }
                wrappedLines.push(currentLine);  
            });
            // -------------------------------------
            
            // 3. Paint the wrapped lines perfectly centered vertically
            const totalTextHeight = wrappedLines.length * LINE_HEIGHT;
            const startY = -(totalTextHeight / 2) + (LINE_HEIGHT / 2);
            
            // Paint the wrapped lines
            wrappedLines.forEach((line, i) => {
                // Start from Y center and adjust for multiple lines
                const totalTextHeight = wrappedLines.length * LINE_HEIGHT;
                const startY = -(totalTextHeight / 2) + (LINE_HEIGHT / 2);
                ctx.fillText(line, 0, startY + (i * LINE_HEIGHT));
            });
        }

        ctx.restore();
    } 

    // Draw Selection UI if selected
    if (obj.id === selectedShapeId) {
      // --- NEW: SELECTION UI FOR LINES ---
      if (obj.type === 'line') {
          ctx.save();
          ctx.fillStyle = '#ffffff'; 
          ctx.strokeStyle = '#2822d4ff'; 
          ctx.lineWidth = 2 / camera.zoom;
          
          const handleRadius = 6 / camera.zoom;

          // Draw a circular handle for all 3 points (Start, Middle, End)
          obj.points.forEach((pt) => {
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, handleRadius, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
          });
          
          ctx.restore();
      }else{
        ctx.save();
        const centreX = obj.x + (obj.width / 2);
        const centreY = obj.y + (obj.height / 2);
        ctx.translate(centreX, centreY);
        ctx.rotate(obj.angle || 0);

        const padding = 4 / camera.zoom
        const halfW = obj.width / 2 + padding;
        const halfH = obj.height / 2 + padding;
        const paddedWidth = obj.width + (padding * 2);
        const paddedHeight = obj.height + (padding * 2);

        ctx.strokeStyle = '#2822d4ff'; 
        ctx.lineWidth = 2 / camera.zoom;
        ctx.setLineDash([5, 5]);

        ctx.strokeRect(-halfW, -halfH, paddedWidth, paddedHeight);
        ctx.setLineDash([]);

        const handleSize = 10 / camera.zoom;
        const offset = handleSize / 2;
    

        ctx.fillStyle = '#ffffff'; 
        // Draw 4 corners (paste your corner code here) (DONE...?)
        ctx.strokeStyle = '#2822d4ff'; 
        ctx.lineWidth = 2 / camera.zoom;

        // Top-Left (nw)
        ctx.fillRect(-halfW - offset, -halfH - offset, handleSize, handleSize);
        ctx.strokeRect(-halfW - offset, -halfH - offset, handleSize, handleSize);

        // Top-Right (ne)
        ctx.fillRect(halfW - offset, -halfH - offset, handleSize, handleSize);
        ctx.strokeRect(halfW - offset, -halfH - offset, handleSize, handleSize);

        // Bottom-Left (sw)
        ctx.fillRect(-halfW - offset, halfH - offset, handleSize, handleSize);
        ctx.strokeRect(-halfW - offset, halfH - offset, handleSize, handleSize);

        // Bottom-Right (se)
        ctx.fillRect(halfW - offset, halfH - offset, handleSize, handleSize);
        ctx.strokeRect(halfW - offset, halfH - offset, handleSize, handleSize);


        // Draw lollipop
        const handleLength = 30 / camera.zoom;
        const handleY = (-obj.height / 2) - handleLength;
        ctx.beginPath();
        ctx.moveTo(0, -obj.height / 2);
        ctx.lineTo(0, handleY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, handleY, 5 / camera.zoom, 0, Math.PI * 2); 
        ctx.fill();
        ctx.stroke();
        
        ctx.restore(); 
      }
    }
  });

  // --- WET INK (DRAWING) ---
  if (appMode === 'DRAWING' && activeTool === 'pen' && currentPath && currentPath.points.length > 0) {

    const pts = currentPath.points;
    let isSnapping = false;

    if (pts.length > 2) {
        const first = pts[0];
        const last = pts[pts.length - 1];
        const distance = Math.hypot(last.x - first.x, last.y - first.y);
        isSnapping = distance < 10;  // 30
    }

    drawSmoothPath(
          ctx, 
          pts, 
          currentPath.color, 
          currentPath.strokeWidth, 
          isSnapping,              // close loop fill logic(if loop, then add fill b/w them)
          currentPath.fillColor,  
          'wet-ink'               
      );


    // drawSmoothPath(ctx, currentPath.points, currentPath.color, /* 5 / (camera.zoom || 1) */ currentPath.strokeWidth, 'wet-ink');
  }

  ctx.restore();
}