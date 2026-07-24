import { useEffect } from 'react';
import { renderFrame } from '../canvas/renderer';


// note:- This component sets up all the condition for render()...?
//        and sent data needed in actual rendering of shapes to 'renderer' which processes all

export function useRenderLoop(canvasRef, refs) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.height = window.innerHeight * dpr;  
      canvas.width = window.innerWidth * dpr;
      canvas.style.height = `${window.innerHeight}px`;
      canvas.style.width = `${window.innerWidth}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      // Create a snapshot object from current refs
      const snapshot = {
        camera: refs.camera.current,
        objects: refs.objects.current,
        selectedShapeId: refs.selectedShapeId.current,
        currentPath: refs.currentPath.current,
        appMode: refs.appMode.current,
        activeTool: refs.activeTool.current
      };
      
      renderFrame(ctx, canvas, snapshot);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [canvasRef]);   // refs removed
}