import { useRef } from 'react';

// Note:- handles undo/redo logic, takes data from InfiniteCanvas

export function useUndoRedo(objectsRef) {
  const pastStackRef = useRef([]);
  const futureStackRef = useRef([]);

  const saveCommand = (command) => {
    pastStackRef.current.push(command);
    if (pastStackRef.current.length > 50) pastStackRef.current.shift();
    futureStackRef.current = [];
  };

  const handleUndoCommand = () => {
    if (pastStackRef.current.length === 0) return;

    const lastCommand = pastStackRef.current.pop();
    const shape = objectsRef.current.find(obj => obj.id === lastCommand.data.id);
    
    switch (lastCommand.actionType) {
      case 'ADD_SHAPE':
        objectsRef.current = objectsRef.current.filter(obj => obj.id !== lastCommand.data.id);
        break;
      case 'DELETE_SHAPE':
        objectsRef.current.push(lastCommand.data);
        break;
      case 'MOVE_SHAPE':
        if (shape) {
          shape.x = lastCommand.data.oldX;
          shape.y = lastCommand.data.oldY;
        }
        break;
      case 'ROTATE_SHAPE':
        if (shape) {
           shape.angle = lastCommand.data.oldAngle;
        }
        break;
    }
    futureStackRef.current.push(lastCommand);
  };

  const handleRedoCommand = () => {
    if (futureStackRef.current.length === 0) return;

    const nextCommand = futureStackRef.current.pop();
    const shape = objectsRef.current.find(obj => obj.id === nextCommand.data.id);

    switch (nextCommand.actionType) {
      case 'ADD_SHAPE':
        objectsRef.current.push(nextCommand.data);
        break;
      case 'DELETE_SHAPE':
        objectsRef.current = objectsRef.current.filter(obj => obj.id !== nextCommand.data.id);
        break;
      case 'MOVE_SHAPE':  
        if (shape) {
          shape.x = nextCommand.data.newX;
          shape.y = nextCommand.data.newY;
        }
        break;
      case 'ROTATE_SHAPE':
        if(shape){
          shape.angle = nextCommand.data.newAngle; // FIXED: command -> nextCommand
        }
        break;
    }
    pastStackRef.current.push(nextCommand);
  };

  return { saveCommand, handleUndoCommand, handleRedoCommand };
}