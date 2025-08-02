import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';

const TYPE_OPTIONS = [
  { value: 'update', label: 'Update' },
  { value: 'approval', label: 'Confirm' },
  { value: 'note', label: 'Note' },
];

// Move RecapModal outside RecapList
const RecapModal = React.memo(function RecapModal({ recap, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw]">
        <h2 className="text-lg font-bold mb-2">Recap Detail</h2>
        <div className="mb-2">
          <span className="font-semibold">Date:</span> {recap.date}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Type:</span> {recap.type}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Description:</span>
          <div className="mt-1 whitespace-pre-line">{recap.content}</div>
        </div>
        <button className="btn btn-sm btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
});

// Move AddRecapModal outside RecapList
const AddRecapModal = React.memo(function AddRecapModal({
  addType,
  setAddType,
  addDescription,
  setAddDescription,
  isSubmitting,
  error,
  onClose,
  onSubmit
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw] flex flex-col gap-4">
        <h2 className="text-lg font-bold mb-2">Add Recap</h2>
        <div>
          <label className="block text-sm font-semibold mb-1">Type</label>
          <select
            className="input input-bordered input-sm w-full"
            value={addType}
            onChange={e => setAddType(e.target.value)}
            disabled={isSubmitting}
          >
            {TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Description</label>
          <textarea
            className="input input-bordered input-sm w-full"
            rows={3}
            value={addDescription}
            onChange={e => setAddDescription(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter recap description..."
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-sm" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting || !addDescription.trim()}>
            {isSubmitting ? <span className="loading loading-spinner"></span> : 'Add'}
          </button>
        </div>
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </form>
    </div>
  );
});

function formatDate(dateStr) {
  // Format date as 'Sun 22 Jun'
  const date = new Date(dateStr);
  const day = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  return `${day} ${dayNum} ${month}`;
}

function getTypeLabel(type) {
  const found = TYPE_OPTIONS.find(opt => opt.value === type);
  return found ? found.label : type;
}

const RecapList = ({ projectId }) => {
  const [recaps, setRecaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecap, setSelectedRecap] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDescription, setAddDescription] = useState('');
  const [addType, setAddType] = useState('update');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch recaps from Supabase
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    supabase
      .from('recaps')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError('Failed to fetch recaps.');
          setRecaps([]);
        } else {
          setRecaps(data || []);
        }
        setLoading(false);
      });
  }, [projectId]);

  // Add a new recap to Supabase
  const handleAddRecap = useCallback(async (e) => {
    e.preventDefault();
    if (!addDescription.trim()) return;
    setIsSubmitting(true);
    setError(null);
    const recapToInsert = {
      project_id: projectId,
      content: addDescription,
      date: new Date().toISOString().slice(0, 10),
      type: addType,
    };
    const { data, error: insertError } = await supabase
      .from('recaps')
      .insert([recapToInsert])
      .select();
    if (insertError) {
      setError('Failed to add recap.');
    } else if (data && data.length > 0) {
      setRecaps([data[0], ...recaps]);
      setAddDescription('');
      setAddType('update');
      setShowAddModal(false);
    }
    setIsSubmitting(false);
  }, [addDescription, addType, projectId, recaps]);

  return (
    <div>
      {/* Plus button */}
      <div className="flex items-center">
        <button
          className="text-6xl font-light text-black hover:text-gray-700 focus:outline-none"
          style={{ lineHeight: 1, width: '56px', height: '56px', fontSize: '56px', marginLeft: 0, marginRight: 0, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowAddModal(true)}
          title="Add Recap"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-400 italic">Loading...</div>
      ) : (
        <div className="space-y-4">
          {recaps.length > 0 ? (
            recaps.map(recap => (
              <div
                key={recap.id}
                className="flex items-center justify-between py-6 px-6 cursor-pointer border-b border-transparent hover:border-gray-200 rounded-xl bg-white shadow-sm"
                style={{ padding: '10px' }}
                onClick={() => setSelectedRecap(recap)}
                title="Click for details"
              >
                <div className="flex flex-col ml-2">
                  <span className="font-sans text-base font-normal text-black">{formatDate(recap.date)}</span>
                  <span className="text-xs mt-1 font-sans italic text-green-500">{getTypeLabel(recap.type)}</span>
                </div>
                <span className="text-2xl mr-6 select-none" style={{ display: 'flex', alignItems: 'center' }}>
                  <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}>
                    <path d="M7 12h16" />
                    <path d="M19 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            ))
          ) : (
            <div className="text-gray-400 italic pl-4">No recaps yet.</div>
          )}
        </div>
      )}
      {selectedRecap && (
        <RecapModal recap={selectedRecap} onClose={() => setSelectedRecap(null)} />
      )}
      {showAddModal && (
        <AddRecapModal
          addType={addType}
          setAddType={setAddType}
          addDescription={addDescription}
          setAddDescription={setAddDescription}
          isSubmitting={isSubmitting}
          error={error}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddRecap}
        />
      )}
    </div>
  );
};

export default RecapList; 