import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Tldraw, loadSnapshot } from '@tldraw/tldraw';
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

  const handleSave = useMemo(() => throttle(async (snapshot) => {
    await saveBoard(snapshot);
    const channel = supabase.channel(`project-board-${projectId}`);
    channel.send({
      type: 'broadcast',
      event: 'board-update',
      payload: { snapshot, sessionId },
    });
  }, 1000, { trailing: true }), [saveBoard, projectId]);

  // Always load the latest board snapshot when either editor or board changes
  useEffect(() => {
    if (!editor || !board || !board.board_data) return;
    loadSnapshot(editor.store, board.board_data);
    console.log('Loaded board snapshot from DB', board.board_data);
  }, [editor, board]);

  useEffect(() => {
    if (!editor) return;

    if (board && board.board_data) {
      loadSnapshot(editor.store, board.board_data);
    }

    const unsubscribe = editor.store.listen(
      (entry) => {
        if (entry.source === 'user') {
          handleSave(editor.store.getSnapshot());
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
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'absolute', top: 0, left: 0, zIndex: 2100 }}>
            <button
              onClick={() => {
                setIsOpen(false);
                if (onClose) {
                  onClose();
                } else {
                  navigate(-1);
                }
              }}
              style={{
                padding: '10px 32px', borderRadius: '0 0 16px 16px' , background: '#6366f1', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              Close Board
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
            {/* Debug UI for board and canEdit */}
            {(!board || !board.board_data) && (
              <div style={{
                position: 'absolute', top: 20, left: 20, zIndex: 1000, background: 'rgba(255,0,0,0.1)', color: '#b00', padding: '10px', borderRadius: '5px', fontWeight: 'bold',
              }}>
                Board data is missing or not loaded.<br />
                Check board fetch/creation logic and Supabase RLS.<br />
                <pre style={{ fontSize: '0.8em', marginTop: 8 }}>{JSON.stringify(board, null, 2)}</pre>
              </div>
            )}
            {!canEdit && (
              <div style={{
                position: 'absolute', top: 80, left: 20, zIndex: 1000, background: 'rgba(255,255,0,0.2)', color: '#b08000', padding: '10px', borderRadius: '5px', fontWeight: 'bold',
              }}>
                Read-only mode: you do not have edit permissions for this board.
              </div>
            )}
            <Tldraw
              persistenceKey={`tldraw_${projectId}`}
              onMount={(editor) => {
                setEditor(editor);
                console.log('Tldraw mounted', editor, ', board:', board, ', canEdit:', canEdit);
              }}
              readOnly={!canEdit}
              style={{ width: '100%', height: '100%' }}
              hideUi={role === 'viewer'}
            >
              <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 999, padding: '5px 10px', background: 'rgba(200, 200, 200, 0.8)', borderRadius: '5px', opacity: isUploading ? 1 : 0, transition: 'opacity 0.3s' }}>
                  Saving...
              </div>
              {/* Custom zoom controls for viewers */}
              {role === 'viewer' && editor && (
                <div style={{ position: 'absolute', bottom: 32, right: 32, zIndex: 1001, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button
                    className="btn btn-sm btn-circle"
                    aria-label="Zoom In"
                    onClick={() => editor.zoomIn()}
                    style={{ marginBottom: 8 }}
                  >
                    +
                  </button>
                  <button
                    className="btn btn-sm btn-circle"
                    aria-label="Zoom Out"
                    onClick={() => editor.zoomOut()}
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