import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Tldraw, loadSnapshot, useEditor, getSnapshot } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import useProjectStore from '../../store/useProjectStore';
import { supabase } from '../../lib/supabaseClient';
import { throttle } from 'lodash';
import { useNavigate } from 'react-router-dom';



// A unique ID for this browser session
const sessionId = crypto.randomUUID();

const TldrawCanvas = ({ projectId, canEdit, role, onClose }) => {
  const { board, saveBoard, isUploading } = useProjectStore();
  const [editor, setEditor] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const handleSave = useMemo(() => throttle(async () => {
    const snapshot = getSnapshot(editor.store);
    await saveBoard(snapshot);
    const channel = supabase.channel(`project-board-${projectId}`);
    channel.send({
      type: 'broadcast',
      event: 'board-update',
      payload: { snapshot, sessionId },
    });
  }, 1000, { trailing: true }), [saveBoard, projectId, editor]);



  // Always load the latest board snapshot when either editor or board changes
  useEffect(() => {
    if (!editor || !board || !board.board_data) return;
    loadSnapshot(editor.store, board.board_data);
  }, [editor, board]);

  useEffect(() => {
    if (!editor) return;

    if (board && board.board_data) {
      loadSnapshot(editor.store, board.board_data);
    }

    const unsubscribe = editor.store.listen(
      (entry) => {
        if (entry.source === 'user') {
          handleSave();
        }
        

      },
    );

    const channel = supabase.channel(`project-board-${projectId}`);
    channel
      .on('broadcast', { event: 'board-update' }, ({ payload }) => {
        if (payload.sessionId !== sessionId) {
          loadSnapshot(editor.store, payload.snapshot);
        }
      })
      .subscribe();



    return () => {
      unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [editor, board, projectId, handleSave]);





  return (
    <div style={{ position: 'relative' }}>
      <style>
        {`
          /* Override Tldraw border radius to match flat design */
          .tldraw__editor *,
          .tldraw__editor button,
          .tldraw__editor input,
          .tldraw__editor select,
          .tldraw__editor [data-testid],
          .tldraw__editor [class*="tldraw"],
          .tldraw__editor [class*="tlui"] {
            border-radius: 0 !important;
          }
          
          /* Specific overrides for common Tldraw elements */
          .tldraw__editor .tlui-button,
          .tldraw__editor .tlui-toolbar__button,
          .tldraw__editor .tlui-menu__button,
          .tldraw__editor .tlui-color-picker__button,
          .tldraw__editor .tlui-style-panel__button,
          .tldraw__editor .tlui-toolbar__item,
          .tldraw__editor .tlui-menu__item,
          .tldraw__editor .tlui-popover,
          .tldraw__editor .tlui-dropdown,
          .tldraw__editor .tlui-input,
          .tldraw__editor .tlui-select,
          .tldraw__editor .tlui-slider,
          .tldraw__editor .tlui-color-picker__swatch,
          .tldraw__editor .tlui-style-panel__item {
            border-radius: 0 !important;
          }

          /* Make all Tldraw toolbar buttons match the Close button style */
          .tldraw__editor .tlui-toolbar__button,
          .tldraw__editor .tlui-button,
          .tldraw__editor [data-testid*="toolbar"] {
            background-color: white !important;
            border: 1px solid black !important;
            height: 40px !important;
            min-width: 40px !important;
            padding: 8px !important;
            font-family: 'Gothic A1', sans-serif !important;
            font-weight: 500 !important;
            font-size: 12px !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: none !important;
            filter: none !important;
          }

          /* Remove all shadows from Tldraw elements */
          .tldraw__editor * {
            box-shadow: none !important;
            filter: none !important;
          }



                    /* Make slider thumb more prominent */
          .tldraw__editor .tlui-slider__thumb {
            background-color: black !important;
            border: 2px solid black !important;
            width: 16px !important;

            box-shadow: none !important;
          }


          /* Specific shadow removal for toolbar */
          .tldraw__editor .tlui-toolbar,
          .tldraw__editor .tlui-toolbar * {
            box-shadow: none !important;
            filter: none !important;
          }

          .tldraw__editor .tlui-toolbar__button:hover,
          .tldraw__editor .tlui-button:hover {
            background-color: #f3f4f6 !important;
          }



        `}
      </style>
      {/* Fullscreen overlay when open */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.15)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ position: 'absolute' , left: 344, zIndex: 2100, pointerEvents: 'none' }}>
            <button
              onClick={() => {
                setIsOpen(false);
                if (onClose) {
                  onClose();
                } else {
                  navigate(-1);
                }
              }}
              className="font-gothic font-medium text-[12px] text-black bg-white border border-black px-2 py-1 hover:bg-gray-100 transition-colors pointer-events-auto"
              style={{
                boxShadow: 'none',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px',
                borderLeft: 'none'
              }}
            >
              Close
            </button>
          </div>
          <div
            ref={containerRef}
            className="tldraw__editor"
            style={{
              background: '#fff',
              width: '100vw',
              height: '100vh',
              position: 'relative',
              flex: 1,
              boxShadow: undefined,
              zIndex: 2001,
            }}
          >

            <Tldraw
              persistenceKey={`tldraw_${projectId}`}
              onMount={(editor) => {
                setEditor(editor);
              }}
              readOnly={!canEdit}
              style={{ width: '100%', height: '100%' }}
              hideUi={role === 'viewer'}
            >
              <div className="font-gothic font-medium text-[16px] text-black bg-white border border-black px-4 py-2" style={{ position: 'absolute', top: 10, right: 10, zIndex: 999, opacity: isUploading ? 1 : 0, transition: 'opacity 0.3s' }}>
                  Saving...
              </div>
              


              {/* Custom zoom controls for viewers */}
              {role === 'viewer' && editor && (
                <div style={{ position: 'absolute', bottom: 32, right: 32, zIndex: 1001, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    className="font-gothic font-bold text-[24px] text-black bg-white border border-black hover:bg-gray-100 transition-colors rounded-none"
                    aria-label="Zoom In"
                    onClick={() => editor.zoomIn()}
                    style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    +
                  </button>
                  <button
                    className="font-gothic font-bold text-[24px] text-black bg-white border border-black hover:bg-gray-100 transition-colors rounded-none"
                    aria-label="Zoom Out"
                    onClick={() => editor.zoomOut()}
                    style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    -
                  </button>
                </div>
              )}
            </Tldraw>
          </div>
        </div>
      )}
      {/* Show a preview or collapsed board when not open, if desired */}
    </div>
  );
};

export default TldrawCanvas; 