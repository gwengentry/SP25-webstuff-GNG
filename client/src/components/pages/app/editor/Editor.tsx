// Editor.tsx
import React, { useState, useRef } from "react";
import { Header } from "./Header";
import { Body } from "./Body";
import { Footer } from "./Footer";
import { useEditor } from "state/editor/EditorReducer";
import { useMouse } from "state/mouse/MouseReducer";
import { useDragAndDropContext } from "state/dragAndDrop/DragAndDropReducer";
import { HtmlObject } from "types/HtmlObject";
import { getDropChildId, insertDroppedElement, parseId } from "state/editor/Helpers";

export const Editor = () => {
  const { state: editor, dispatch: editorDispatch } = useEditor();
  const {state: mouseState} = useMouse();
  const {dragState} = useDragAndDropContext();

  let data = {
    header: editor.header,
    body: editor.body,
    footer: editor.footer
  };

  if (dragState.isDragging && editor.hoveredItemId && dragState.canDrop) {
    const {section, index} = parseId(editor.hoveredItemId);
    const predictedIndex = getDropChildId(mouseState, editor, editor.hoveredItemId)


    const previewObject:HtmlObject = {
      metadata: {
        type: "WIDGET"
      },
      html: {
        nodes: [
        {
          element: "div",
          style: {
            width: { value: "100%" },
            height: { value: "100%" },
            position: { value: "relative" },
            margin: { value: "3px" },
            display: { value: "flex" },
            alignItems: { value: "center" },
            justifyContent: { value: "center" }
          },
          attributes: {
            "className": {value: "preview"}
          },
          metadata: {
            preview: true
          }
        }
      ]
      }
    };

    data[section] = structuredClone(editor[section]);
    data[section] = insertDroppedElement(predictedIndex, editor, previewObject, editor.hoveredItemId)[section];
  }

  return (
    <div id="editor-window" className="editor">
      <div className="editor-container">
        <div className="header-section">
          <div className="tab" style={{textAlign: "center"}}>Header</div>
          <Header content={data.header} />
        </div>
        <div className="body-section">
          <div className="tab" style={{textAlign: "center"}}>Body</div>
          <Body content={data.body} />
        </div>
        <div className="footer-section">
          <div className="tab" style={{textAlign: "center"}}>Footer</div>
          <Footer content={data.footer} />
        </div>
      </div>
    </div>
  );
};

export default Editor;
