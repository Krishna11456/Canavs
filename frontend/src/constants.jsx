// text-shift problem(part of fix) : remove the gap of where css and canavs see {x,y} same positon
export const FONT_SIZE = 24;
export const LINE_HEIGHT = 28; 
export const GRID_SIZE = 50;
export const ZOOM_FACTOR = 1.1;
export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 20;


// tools config...

export const SHAPE_CONFIGS = {
   // Shapes that need full styling
  rectangle: { showStroke: true, strokeWidth: true, showFill: true, showEdges: true, showText: false },
  circle:    { showStroke: true, strokeWidth: false, showFill: true, showEdges: false, showText: false },
  diamond:   { showStroke: true, showFill: true, showEdges: true, showText: false },
  arrow:     { showStroke: true, showFill: false, showEdges: false, showText: false },
  line:      { showStroke: true, showFill: true, showEdges: false, showText: false },

   // Tools that only need text settings
  text:      { showStroke: true, showFill: false, showEdges: false, showText: true, showTextAlign: true},

  // Tools that don't need styling overlays at all
  pen:       { showStroke: true, strokeWidth: true, showFill: true, showEdges: false, showText: false },
  eraser:    { showStroke: false, showFill: false, showEdges: false, showText: false },
  hand:      { showStroke: false, showFill: false, showEdges: false, showText: false },
  selection: { showStroke: false, showFill: false, showEdges: false, showText: false },
};


 