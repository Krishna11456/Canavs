import { useEffect, useRef, useState } from 'react';

// Note:-  hook that hadnles room logic.This takes data from InfiniteCanavs..

export function useRoomSocket(roomId, objectsRef) {
  const socketRef = useRef(null);
  const [isSynced, setIsSynced] = useState(false);
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
   //  socketRef.current = new WebSocket('ws://localhost:8080?room=' + roomId);

   socketRef.current = new WebSocket(backendUrl + '?room='  + roomId);

    socketRef.current.onopen = () => {
      console.log(`Connected to Room: ${roomId}`);
    };

    socketRef.current.onmessage = (event) => {
      const incomingMessage = JSON.parse(event.data);
      
      if (incomingMessage.type === 'shape:new') {
        objectsRef.current.push(incomingMessage.data);
      } else if (incomingMessage.type === 'shape:move') {
        const shapeToUpdate = objectsRef.current.find((obj) => obj.id === incomingMessage.data.id);
        if (shapeToUpdate) {
/*           shapeToUpdate.x = incomingMessage.data.x;
          shapeToUpdate.y = incomingMessage.data.y; */

          Object.assign(shapeToUpdate, incomingMessage.data);
        }
      } else if(incomingMessage.type === 'shape:delete'){
        objectsRef.current = objectsRef.current.filter((obj) => obj.id !== incomingMessage.data.id);
      } else if(incomingMessage.type === 'sync:full') {
        objectsRef.current = incomingMessage.data;
        setIsSynced(true); 
      } else if (incomingMessage.type === 'cursor:move') {
        setCursors((prevCursors) => ({
          ...prevCursors,
          [incomingMessage.data.id]: {
            x: incomingMessage.data.x,
            y: incomingMessage.data.y
          }
        }));
      } else if (incomingMessage.type === 'user:leave') {
        setCursors((prevCursors) => {
          const newCursors = { ...prevCursors };
          delete newCursors[incomingMessage.data.id];
          return newCursors;
        });
      }
    };

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [roomId, objectsRef]);

  return { socketRef, isSynced, cursors };
}