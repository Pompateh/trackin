import React, { useEffect, useState, useMemo } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import useProjectStore from '../../store/useProjectStore';
import { supabase } from '../../lib/supabaseClient';
import { throttle } from 'lodash';

// A unique ID for this browser session
const sessionId = crypto.randomUUID();

const TldrawCanvas = ({ projectId, canEdit }) => {
  const { board, saveBoard, isUploading } = useProjectStore();
  const [editor, setEditor] = useState(null);

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
      editor.store.loadSnapshot(board.board_data);
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
          editor.store.loadSnapshot(payload.snapshot);
        }
      })
      .subscribe();

    return () => {
      unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [editor, board, projectId, handleSave]);

  return (
    <div className="tldraw__editor">
      <Tldraw
        persistenceKey={`tldraw_${projectId}`}
        onMount={(editor) => setEditor(editor)}
        readOnly={!canEdit}
      >
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 999, padding: '5px 10px', background: 'rgba(200, 200, 200, 0.8)', borderRadius: '5px', opacity: isUploading ? 1 : 0, transition: 'opacity 0.3s' }}>
            Saving...
        </div>
      </Tldraw>
    </div>
  );
};

export default TldrawCanvas; 