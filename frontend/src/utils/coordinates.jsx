// anchor point cordinates
  export function getCornerWorldPos(shape, corner) {
   
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;
    
    
    let localX = 0; let localY = 0;
    if (corner === 'nw') { localX = -shape.width / 2; localY = -shape.height / 2; }
    if (corner === 'ne') { localX = shape.width / 2;  localY = -shape.height / 2; }
    if (corner === 'sw') { localX = -shape.width / 2; localY = shape.height / 2; }
    if (corner === 'se') { localX = shape.width / 2;  localY = shape.height / 2; }

    const angle = shape.angle || 0;
    const worldX = centerX + (localX * Math.cos(angle) - localY * Math.sin(angle));
    const worldY = centerY + (localX * Math.sin(angle) + localY * Math.cos(angle));
    
    return { x: worldX, y: worldY };
};


export function screenToWorld (screenX, screenY, camera) {
    return {
      x: (screenX - camera.x) / camera.zoom,
      y: (screenY - camera.y) / camera.zoom
    };
};


export function worldToScreen (worldX, worldY, camera) {
       return {
        x: (worldX * camera.zoom) + camera.x,
        y: (worldY * camera.zoom) + camera.y
      };
}; 