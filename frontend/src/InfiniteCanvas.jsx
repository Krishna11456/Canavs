import { useRef, useState } from "react";
import './style.css';
import { useRoomSocket } from './hooks/useRoomSocket';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useTextEditor } from './hooks/useTextEditor';
import { useRenderLoop } from './hooks/useRenderLoop';
import { useCanvasEvents } from './hooks/useCanvasEvents';

import Toolbar from './components/Toolbar';
import CursorLayer from './components/CursorLayer';
import TextEditorOverlay from './components/TextEditorOverlay';
import CanvasHUD from './components/CanvasHUD';
import SyncOverlay from './components/SyncOverlay';

import { generateID } from "./utils/id";
import ContextAwareOverlay from "./components/ContextAwareOverlay";

export default function InfiniteCanvas({ roomId }) {
  // --- CORE REFS ---
  const canvasRef = useRef(null);
  const cameraRef = useRef({x: 0, y: 0, zoom: 1});
  const objectsRef = useRef([]);
  const appModeRef = useRef('IDLE');
  

  // added...
  const myUserIdRef = useRef(generateID().substring(0, 5));   
  const startPanRef = useRef({x: 0, y: 0})
  const originalPosRef = useRef({x: 0, y: 0});
  const grabOffsetRef = useRef({x: 0, y: 0});
  const initialAngleRef = useRef();
  const resizeAnchorRef = useRef({x: 0, y: 0});
  const resizePointRef = useRef(null);
  const lastMoveTimeRef = useRef(0);

  
  // --- TOOL REFS & STATE ---
  const [activeTool, setUIActiveTool] = useState('pointer'); 
  const activeToolRef = useRef('pointer'); 
  const selectedShapeIdRef = useRef(null);
  const activeShapeIdRef = useRef(null);
  const currentPathRef = useRef([]);

  const [selectedShape, setUISelectedShape] = useState(null);   // react version for selected-shape ref(done same that active-tool-ui does, state -> react, ref -> canavs)
  
  const activeHandleIndexRef = useRef(null);   // store which of three points on the line being dragged....

  // Tracksstyles (stroke color, fill, thickness, corners)
  const [currentStyles, setCurrentStyles] = useState({
    stroke: '#1e1e1e',
    fill: 'transparent',
    strokeWidth: 'thin',  // 'thin', 'bold', or 'extraBold'

 
    edges: 'sharp',     // border-radius
    fontSize: 'medium',
    textAlign: 'left'
  });

  
  // Create a ref for styles(above state...)
  const currentStylesRef = useRef(currentStyles);   // canavs use


    // --- UI UPDATERS ---
  const setActiveTool = (tool) => {
    setUIActiveTool(tool);
    activeToolRef.current = tool; 

   // added due to bug,(click tool when any shape is selected, nothing happens(as in, ui remains for the shape...and freeze kinda), the tool and it's Ui remains active..., if draw that ui applies)
    if (tool !== 'pointer') {
        refs.selectedShapeId.current = null; 
        setUISelectedShape(null);            
    }
  };
 

  // --- CUSTOM HOOKS ---
  const { socketRef, isSynced, cursors } = useRoomSocket(roomId, objectsRef);                                                                                
  const { saveCommand, handleUndoCommand, handleRedoCommand } = useUndoRedo(objectsRef);                                                                     // below, 'setActiveTool' added later, for auto pointer switch, when save...(beware for any bug...)
  const { textInput, setTextInput, textAreaRef, handleTextSave, handleAutoResize, anchorScreen } = useTextEditor(objectsRef, cameraRef, socketRef, appModeRef, setActiveTool);
  

    // --- BUNDLE REFS & ACTIONS FOR THE ENGINE ---
  const refs = { 
    camera: cameraRef, 
    objects: objectsRef, 
    appMode: appModeRef, 
    activeTool: activeToolRef,  
    selectedShapeId: selectedShapeIdRef, 
    activeShapeId: activeShapeIdRef, 
    currentPath: currentPathRef, 
    socket: socketRef,

    // added
    myUserId: myUserIdRef,  
    startPan: startPanRef,
    originalPos: originalPosRef,
    grabOffset: grabOffsetRef,
    initialAngle: initialAngleRef,
    textArea: textAreaRef,            
    resizeAnchor: resizeAnchorRef,     
    resizePoint: resizePointRef,      
    lastMoveTime: lastMoveTimeRef,
    

    currentStyles: currentStylesRef,

    activeHandleIndex: activeHandleIndexRef,
  };

  
  const actions = { 
    setTextInput, 
    saveCommand, 
    undo: handleUndoCommand, 
    redo: handleRedoCommand,
    setActiveTool,

    //setZoomDisplay,


    onShapeSelect: (shapeId) => {
      if(!shapeId){
        setUISelectedShape(null);
        refs.selectedShapeId.current = null;  // Keeps canvas in sync.
      }else{
        const shape = objectsRef.current.find(s => s.id === shapeId);
        // setUISelectedShape(shape);

        if (shape) {
          setUISelectedShape(shape);
          setCurrentStyles(prev => ({
              ...prev,

              // Use ??(Nullish Coalescing Operator) instead of || to protect against 0 values(falsy vaules...?)
              //NOTE:- The ?? operator ONLY falls back to prev if the shape's property is strictly null or undefined. 
              //        It safely allows 0 or "".
              stroke: shape.stroke ?? shape.color ?? prev.stroke,
              fill: shape.fill ?? prev.fill,

              strokeWidth: shape.strokeWidth ?? prev.strokeWidth,
              edges: shape.edges ?? prev.edges,
              fontSize: shape.fontSize ?? prev.fontSize,
              textAlign: shape.textAlign ?? shape.align ?? prev.textAlign,
          }));
        }
      }
    }

  };

  useRenderLoop(canvasRef, refs);
  useCanvasEvents(canvasRef, refs, actions);

   

  
  // Fires when options (fill, stroke width, text align, edges) are selected...(on contextOverlay)
  const handleStyleChange = (property, value) => {
    // A. Update local component states
    setCurrentStyles((prev) => {
      const updated = { ...prev, [property]: value };
      currentStylesRef.current = updated; // Sync ref
      return updated;
    });


    //textrea spawn color change...(NOTE:- HARDCODED...., update later...)
    if (refs.appMode.current === 'EDITING_TEXT' || textInput.isVisible) {
      
        actions.setTextInput((prev) => ({
            ...prev,
            [property]: value   // Update the live text box color(stroke -> property)
        }));
    }

    // B. Mutate the properties directly on the selected object inside the Engine array ref
    if (selectedShapeIdRef.current) {
      const shape = objectsRef.current.find(obj => obj.id === selectedShapeIdRef.current);
      if (shape) {

        shape[property] = value;  // direct muttaion...?(so same object ref -> no re-render..., but since canavs draw by read ref, visuals are working..?)
  
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'shape:move', data: shape }));
        }
      }
    }
  };
 

  // color sent to text...
  const color = textInput.editingId ? textInput.stroke : currentStyles.stroke;
  const align = textInput.editingId ? textInput.textAlign : currentStyles.textAlign;

  

  return (
    <div className="canvas-wrapper">
      {!isSynced && <SyncOverlay />}
      
      <CanvasHUD zoomDisplay={Math.round(cameraRef.current.zoom * 100)} />

      <ContextAwareOverlay  
        activeTool={selectedShape ? selectedShape.type : activeTool}
        currentStyles={currentStyles}
        onStyleChange={handleStyleChange}
      />
      
      <CursorLayer cursors={cursors} camera={cameraRef.current} />

      <Toolbar 
        activeTool={activeTool} 
        onSelectTool={setActiveTool} 
        onCheckMemory={() => console.log('CURRENT MEMORY:', objectsRef.current)} 
      />

      {textInput.isVisible && (
        <TextEditorOverlay 
          textInput={textInput} 
          textAreaRef={textAreaRef}
          anchorScreen={anchorScreen} 
          zoom={cameraRef.current.zoom} 
          onSave={() => handleTextSave(color, align)} 
          onInput={handleAutoResize}
          currentStyles={currentStyles}
        />
      )}

      <canvas ref={canvasRef} className="infinite-canvas" />
    </div>
  );
}