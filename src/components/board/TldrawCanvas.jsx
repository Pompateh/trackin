import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Tldraw, loadSnapshot } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import useProjectStore from '../../store/useProjectStore';
import { supabase } from '../../lib/supabaseClient';
import { throttle } from 'lodash';

// A unique ID for this browser session
const sessionId = crypto.randomUUID();

const TldrawCanvas = ({ projectId, canEdit }) => {
  const { board, saveBoard, isUploading } = useProjectStore();
  const [editor, setEditor] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const handleSave = useMemo(() => throttle(async (snapshot) => {
    await saveBoard(snapshot);
    const channel = supabase.channel(`project-board-${projectId}`);
    channel.send({
      type: 'broadcast',
      event: 'board-update',
      payload: { snapshot, sessionId },
    });
  }, 1000, { trailing: true }), [saveBoard, projectId]);

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
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          position: 'absolute', top: 0, right: 0, zIndex: 1100, margin: 8, padding: '6px 16px', borderRadius: 6, background: '#6366f1', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer',
        }}
      >
        {isOpen ? 'Close Board' : 'Open Board'}
      </button>
      <div
        ref={containerRef}
        className="tldraw__editor"
        style={{
          background: '#fff',
          minHeight: isOpen ? '80vh' : 400,
          width: isOpen ? '100%' : 'auto',
          height: isOpen ? '80vh' : 'auto',
          position: 'relative',
          transition: 'all 0.3s',
          boxShadow: isOpen ? '0 0 0 100vmax rgba(0,0,0,0.3)' : undefined,
          zIndex: isOpen ? 1050 : undefined,
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
        >
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 999, padding: '5px 10px', background: 'rgba(200, 200, 200, 0.8)', borderRadius: '5px', opacity: isUploading ? 1 : 0, transition: 'opacity 0.3s' }}>
              Saving...
          </div>
        </Tldraw>
      </div>
    </div>
  );
};

export default TldrawCanvas; 