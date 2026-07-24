import { FONT_SIZE, LINE_HEIGHT } from '../constants';

export default function TextEditorOverlay({ textInput, textAreaRef, anchorScreen, zoom, onSave, onInput, currentStyles}) {
  const isEditingExisting = !!textInput.editingId;

  console.log(isEditingExisting ? " this spawn is already existing..." : " new textbox");   // added string to check which textbox mounts on shape..
  console.log(textInput)

  return (
    <textarea 
      id="text-box"
      ref={textAreaRef}
      autoFocus
      onBlur={onSave}
      onPointerDown={(e) => e.stopPropagation()} 
      onKeyDown={(e) => e.stopPropagation()}
      defaultValue={textInput.initialText}
      onInput={onInput}
      style={{
        position: 'absolute',
        left: `${anchorScreen.x}px`,
        top: `${anchorScreen.y}px`,
        width: isEditingExisting ? `${textInput.width}px` : undefined,
        height: isEditingExisting ? `${textInput.height}px` : undefined,
        overflow: isEditingExisting ? 'hidden' : 'visible',
        background: 'transparent',
        padding: 0, margin: 0, border: 'none', outline: '1px dashed #aaa', resize: 'none',
        fontFamily: 'sans-serif', fontSize: `${FONT_SIZE}px`, lineHeight: `${LINE_HEIGHT}px`,
        color:  (isEditingExisting ? textInput.stroke : currentStyles.stroke) || '#000000', //isEditingExisting ? `${textInput.stroke}`: `${currentStyles.stroke}`,
        zIndex: 40,
        transformOrigin: isEditingExisting ? 'center' : 'top left',
        transform: isEditingExisting
          ? `translate(-50%, -50%) rotate(${textInput.angle || 0}rad) scale(${zoom})`
          : `scale(${zoom})`,
      }}
    />
  );
}



// Note: this handles the textArea spawn over canavs.the UI part, it takes all data inderctly from useTextEditor hook