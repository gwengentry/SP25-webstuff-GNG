import { findPrimaryAttributes } from "components/pages/app/Helpers";
import React, { ChangeEvent, useRef } from "react"; //Added useRef for ReactQuill handling
import { ActionType, useEditor } from "state/editor/EditorReducer";
import { parseId } from "state/editor/Helpers";
import { NodeAttribute} from "types/HtmlNodes";
import ImageGallery from "./ImageGallery";
import { Tooltip } from "react-tooltip"; // Handles hover-over tooltips
import { Editor as TinyMCEEditor } from 'tinymce/tinymce';
import BundledEditor from '../../BundledEditor.jsx'

type Props = {};

const ElementSidebar = (props: Props) => {
  //const [color, setColor] = React.useState({});
  const { state: editor, dispatch } = useEditor();
  let isImageElement = false;

  let attributes: { [key: string]: NodeAttribute } = {
    font: { value: "Helvetica" },
    size: { value: "12px" },
  };
  let style: { [key: string]: NodeAttribute } = {};


  if (editor.selectedElementId) {
    const { section, index } = parseId(editor.selectedElementId);
    let target = editor[section].html.nodes[index];

    console.log("TARGET", target);

    if (target) {
      ({ attributes, style } = findPrimaryAttributes(
        index,
        editor,
        section
      ) ?? {
        attributes: { ...target.attributes },
        style: { ...target.style },
      });
    }
  }

 const editorRef = useRef<TinyMCEEditor | null>(null); //TinyMCE handling
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  }; 

  const buildInput = (
    source: { [key: string]: NodeAttribute },
    index: number,
    key: string,
    target: "style" | "attributes"
  ) => {
    const val = source[key];
  
    let input = (
      <input
        onChange={(ev: ChangeEvent<HTMLInputElement>) => {
          dispatch({
            type: ActionType.ATTRIBUTE_CHANGED,
            target: target,
            attribute: key,
            newValue: ev.currentTarget.value,
          });
        }}
        type={source[key].input?.type ?? "text"}
        value={source[key].value}
        readOnly={val.readonly ? true : false}
        data-tooltip-id={key} // Handles tooltip association
      />
    );

    if (val.value === "image") {
      isImageElement = true;
    }

    if (val.input?.type === "richtext" ) { //Handles richtext editing using TinyMCE
      input = (
        <BundledEditor 
        value={val.value || " "} //Dynamic assignment based on Widget value
        onEditorChange={(content: string) => {
          dispatch({
            type: ActionType.ATTRIBUTE_CHANGED,
            target: target,
            attribute: key,
            newValue: content,
          });
        }
      }
      
        />
      );
    }

    if (
      val.input &&
      val.input.type === "select" &&
      val.input.options !== undefined
    ) {
      input = (
        <select
          name=""
          id=""
          onChange={(ev: ChangeEvent<HTMLSelectElement>) => {
            dispatch({
              type: ActionType.ATTRIBUTE_CHANGED,
              target: target,
              attribute: key,
              newValue: ev.currentTarget.value,
            });
          }}
          data-tooltip-id={key} // Handles tooltip association
        >
          {val.input.options.map((op) => {
            return <option value={op.value}>{op.text}</option>;
          })}
        </select>
      );
    }

    return (
      <div className="element-attribute-input" key={index}>
        <div className="attribute-label-container">
          <label htmlFor="">{val.input?.displayName ?? key}</label>
        </div>
        {input}
      </div>
    );
  };

  return (
    <aside className="style-sidebar">
      <header className="sidebar-header">
        <h2>ELEMENT</h2>
      </header>
      <h3>Attributes</h3>
      <div className="element-attributes">
        {Object.keys(attributes)
          .sort()
          .map((k, i) => {
            const attr = attributes[k];

            if (attr.hidden) {
              return;
            }

            return buildInput(attributes, i, k, "attributes");
          })}
      </div>
      <h3>Style</h3>
      <div className="element-style">
        {Object.keys(style)
          .sort()
          .map((k, i) => {
            const attr = style[k];

            if (attr.hidden) {
              return;
            }

            return buildInput(style, i, k, "style");
          })}
      </div>

      {/* Conditionally render the ImageGallery if the selected element is an image */}
      {isImageElement && (
        <>
        <h3>Image Gallery</h3>
        <ImageGallery
          onSelect={(imageUrl) => {
            // Update the src attribute of the selected image element
            dispatch({
              type: ActionType.ATTRIBUTE_CHANGED,
              target: "attributes",
              attribute: "src",
              newValue: imageUrl,
            });
          }}
        />
      </>
      )}

      {/* Handles tooltip display for widget attributes - ChatGPT assisted */}
      {Object.keys(attributes).map((key) => {
        const tooltipText = attributes[key]?.input?.tooltip;
        return (
          tooltipText && (
            <Tooltip 
           className="sidebarTooltip"
            key={key} 
            id={key} 
            content={tooltipText}
            >
              <span>{key}</span> {/* Tooltip wrapped element */}
            </Tooltip>
          )
        );
      })}
    </aside>
  );
};

export default ElementSidebar;
