import { useState, useRef } from 'react';
import { worldToScreen } from '../utils/coordinates';
import { FONT_SIZE, LINE_HEIGHT } from '../constants';


// Note:- this hook conatins all fucntion related to text. It takes all inputs from InfiniteCanVas directly.....(takes socketRef inderctly from useRoom)

export function useTextEditor(objectsRef, cameraRef, socketRef, appModeRef, setActiveTool) {
  const [textInput, setTextInput] = useState({
    isVisible: false, 
    x: -99999, 
    y: -99999, 
    editingId: null, 
    initialText: '', 
    angle: 0, 
    stroke: null,
    textAlign: null,

    mode: null,
  });

  const textAreaRef = useRef(null);

  const handleTextSave = (finalColor, align) => {
    if(!textAreaRef.current) return;
    const finalText = textAreaRef.current.value.trim();
    
    if(finalText !== ""){
      const lines = finalText.split('\n');
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.font = `${FONT_SIZE}px sans-serif`;

      let maxWidth = 0;
      lines.forEach(line => {
          const width = ctx.measureText(line).width;
          if (width > maxWidth) maxWidth = width;
      });

      const calculatedWidth = maxWidth;
      const calculatedHeight = lines.length * LINE_HEIGHT;

      if(textInput.editingId){
        const shapeToEdit = objectsRef.current.find(obj => obj.id === textInput.editingId);
        if (shapeToEdit) {
            shapeToEdit.text = finalText;
            shapeToEdit.isHidden = false;  
            shapeToEdit.stroke = finalColor;
            shapeToEdit.textAlign = align
            
            if(shapeToEdit.type === 'text') {     // redundent condition...?(NO...)
              shapeToEdit.width = calculatedWidth;
              shapeToEdit.height = calculatedHeight;
            }
        }
      } else {

        const newTextObject = {
          id: `text-${Date.now()}`, 
          type: 'text', 
          text: finalText,
          x: textInput.x, 
          y: textInput.y, 
          height: calculatedHeight, 
          width: calculatedWidth,
          angle: 0,
          stroke: finalColor,
          textAlign: align || 'left',
          mode: 'standalone',  //shape.type === 'text' ? 'standalone' : 'shape',
        };
        objectsRef.current.push(newTextObject);

        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'shape:new', data: newTextObject }));
        }
      }
    } else {
      if (textInput.editingId) {
           // if the object itsslef is text, only then remove it(not all)
           //objectsRef.current = objectsRef.current.filter(obj => obj.id !== textInput.editingId);
           const shape = objectsRef.current.find(obj => obj.id === textInput.editingId);

           if(shape.type === 'text'){
              objectsRef.current = objectsRef.current.filter(obj => obj.id !== textInput.editingId);
           }else{
               shape.text = '';
           }
      }
    }

    appModeRef.current = 'IDLE';
    setActiveTool('pointer');
    setTextInput({ isVisible: false, x: -99999, y: -99999});
  };



  const handleAutoResize = (e) => {
    e.target.style.height = 'auto'; 
    e.target.style.height = `${e.target.scrollHeight}px`; 
  };

  const isEditingExisting = !!textInput.editingId;
  const anchorWorld = isEditingExisting
    ? { x: textInput.x + (textInput.width || 0) / 2, y: textInput.y + (textInput.height || 0) / 2 }
    : { x: textInput.x, y: textInput.y };

  const anchorScreen = worldToScreen(anchorWorld.x, anchorWorld.y, cameraRef.current);

  return { textInput, setTextInput, textAreaRef, handleTextSave, handleAutoResize, anchorScreen };
}