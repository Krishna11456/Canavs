

// Note:- this is that hadnle hit, it takes data from useCanvas when called 

export function checkHandleHit(pos, shape, target) {
    
    const HANDLE_RADIUS = 10; 

    
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;

    
    const relX = pos.x - centerX;
    const relY = pos.y - centerY;


    const angle = shape.angle || 0;
    const unspunX = relX * Math.cos(-angle) - relY * Math.sin(-angle);
    const unspunY = relX * Math.sin(-angle) + relY * Math.cos(-angle);

    const halfW = shape.width / 2;
    const halfH = shape.height / 2;

    
    // CHECK ROTATION HANDLE (The "Lollipop")
    // -----------------------------------------
    if (target === 'RotationHandle') {
        const rotHandleX = 0;
        
        const rotHandleY = -halfH - 30; 
        
        // Pythagorean theorem to find distance
        const dist = Math.sqrt(Math.pow(unspunX - rotHandleX, 2) + Math.pow(unspunY - rotHandleY, 2));
        
        return dist <= HANDLE_RADIUS; // Returns true if hit, false if missed
    }

    
    // CHECK RESIZE HANDLES (The 4 Corners)
    // -----------------------------------------
    if (target === 'ResizeHandle') {
        const corners = [
            { id: 'nw', x: -halfW, y: -halfH },
            { id: 'ne', x: halfW, y: -halfH },
            { id: 'sw', x: -halfW, y: halfH },
            { id: 'se', x: halfW, y: halfH }
        ];

        for (let i = 0; i < corners.length; i++) {
            const corner = corners[i];
            const dist = Math.sqrt(Math.pow(unspunX - corner.x, 2) + Math.pow(unspunY - corner.y, 2));
            
            if (dist <= HANDLE_RADIUS) {
                return corner.id; // Returns 'nw', 'ne', 'sw', or 'se'
            }
        }
    }

    return null; // Return null if  clicked empty space
}


export function isMouseNearLine(mouseX, mouseY, p0, p1, p2, zoom) {
    const tolerance = 10 / zoom; // 10px hit radius

    // 1. Calculate the invisible control point
    const cpX = 2 * p1.x - 0.5 * (p0.x + p2.x);
    const cpY = 2 * p1.y - 0.5 * (p0.y + p2.y);

    // 2. Sample 20 points along the quadratic curve
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const u = 1 - t;
        
        // Standard Quadratic Bezier Formula
        const curveX = (u * u * p0.x) + (2 * u * t * cpX) + (t * t * p2.x);
        const curveY = (u * u * p0.y) + (2 * u * t * cpY) + (t * t * p2.y);
        
        // Check distance from mouse to this point on the curve
        const dist = Math.hypot(mouseX - curveX, mouseY - curveY);
        if (dist <= tolerance) {
            return true; // We clicked the line body!
        }
    }
    return false;
}