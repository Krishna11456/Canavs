export const drawSmoothPath = (ctx, points, color, width, isClosed, fillColor, debuMsg) => {
    if (points.length < 2) return; 

    // console.log(debuMsg);

    ctx.beginPath();
    ctx.strokeStyle = color;

    // stroke...
    let lineThickness = 2; // thin
    if (width === 'bold') lineThickness = 3;
    if (width === 'extraBold') lineThickness = 5;

    ctx.lineWidth = lineThickness;
    ctx.lineCap = 'round';  
    ctx.lineJoin = 'round'; 

    // Move to the first coordinate
    ctx.moveTo(points[0].x, points[0].y);

    // Loop through the dots and draw curves to the midpoints
    for (let i = 1; i < points.length - 1; i++) {
        const currentPoint = points[i];
        const nextPoint = points[i + 1];

        const midX = (currentPoint.x + nextPoint.x) / 2;
        const midY = (currentPoint.y + nextPoint.y) / 2;

        ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, midX, midY);
    }

    // --- NEW LOGIC ADDED HERE ---

    // 1. Snap the gap shut if the shape is closed
    if (isClosed) {
        ctx.closePath(); 
    }

    // 2. Fill the shape first (if closed and a color exists)
    if (isClosed && fillColor && fillColor !== 'transparent') {
        
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    // Connect the final midpoint to the last actual coordinate
    const lastPoint = points[points.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y);

    ctx.stroke();
};


// Note:- this is free-hand drawing logic, it takes all data from renderer...