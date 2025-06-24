import React, { useEffect, useState } from 'react';
// import { supabase } from '../../lib/supabaseClient';

const RecapList = ({ projectId }) => {
  const [recaps, setRecaps] = useState([]);
  const [newRecap, setNewRecap] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // TODO: Replace with Supabase fetch
    // supabase.from('recaps').select('*').eq('project_id', projectId).order('date', { ascending: false })
    //   .then(({ data }) => setRecaps(data));
    setRecaps([
      { id: 1, content: 'Kickoff meeting held', date: '2024-06-22', type: 'update' },
      { id: 2, content: 'Client approved concept', date: '2024-06-21', type: 'approval' },
    ]);
  }, [projectId]);

  const handleAddRecap = async (e) => {
    e.preventDefault();
    if (!newRecap.trim()) return;
    setIsSubmitting(true);
    // TODO: Add recap to Supabase
    setRecaps([{ id: Date.now(), content: newRecap, date: new Date().toISOString().slice(0, 10), type: 'update' }, ...recaps]);
    setNewRecap('');
    setIsSubmitting(false);
  };

  return (
    <div>
      <form onSubmit={handleAddRecap} className="flex mb-2">
        <input
          className="input input-bordered input-sm flex-1 mr-2"
          placeholder="Add a recap..."
          value={newRecap}
          onChange={e => setNewRecap(e.target.value)}
          disabled={isSubmitting}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
          +
        </button>
      </form>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {recaps.length > 0 ? (
          recaps.map(recap => (
            <div key={recap.id} className="flex items-center justify-between p-2 bg-base-200 rounded">
              <div>
                <div className="font-semibold text-sm">{recap.content}</div>
                <div className="text-xs text-gray-500">{recap.date}</div>
              </div>
              <span className="badge badge-outline ml-2">{recap.type}</span>
            </div>
          ))
        ) : (
          <div className="text-gray-400 italic">No recaps yet.</div>
        )}
      </div>
    </div>
  );
};

export default RecapList; 