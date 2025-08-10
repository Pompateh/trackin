import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import useAuthStore from '../../store/useAuthStore';
import useProjectStore from '../../store/useProjectStore';
import EditableTextRow from './EditableTextRow';

const QaEditor = () => {
  const { projectId } = useParams();
  const { user } = useAuthStore();
  const [role, setRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Debug logging
  console.log('QaEditor - User:', user);
  console.log('QaEditor - Role:', role);
  console.log('QaEditor - isAdmin:', isAdmin);
  const [qaData, setQaData] = useState({
    question_1: '',
    answer_1: '',
    question_2: '',
    answer_2: '',
    question_3: '',
    answer_3: '',
    question_4: '',
    answer_4: '',
    question_5: '',
    answer_5: '',
  });
  const [qaCount, setQaCount] = useState(5);

  useEffect(() => {
    if (projectId && user) {
      fetchQaData();
      fetchUserRole();
    }
  }, [projectId, user]);

  const fetchQaData = async () => {
    if (!projectId) return;
    
    console.log('QaEditor - Fetching Q&A data for project:', projectId);
    
    const { data, error } = await supabase
      .from('qa_data')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      console.error('Error fetching Q&A data:', error);
      if (error.code === 'PGRST116') {
        console.log('QaEditor - No Q&A data found, will create new record');
      }
      return;
    }

    if (data) {
      console.log('QaEditor - Fetched Q&A data:', data);
      setQaData(data);
      // Update qaCount based on the highest question number found
      const questionNumbers = Object.keys(data)
        .filter(key => key.startsWith('question_'))
        .map(key => parseInt(key.replace('question_', '')))
        .filter(num => !isNaN(num));
      
      if (questionNumbers.length > 0) {
        const maxQuestion = Math.max(...questionNumbers);
        setQaCount(maxQuestion);
        console.log('QaEditor - Set qaCount to:', maxQuestion);
      }
    }
  };

  const fetchUserRole = async () => {
    if (!projectId || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      if (data) {
        const userRole = data.role;
        setRole(userRole);
        setIsAdmin(userRole === 'admin');
        console.log('QaEditor - Fetched role:', userRole);
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    }
  };

  const saveQaData = async (updates = {}) => {
    if (!projectId) return;

    const updatedData = { ...qaData, ...updates };
    setQaData(updatedData);

    console.log('QaEditor - Saving Q&A data:', updatedData);

    const { error } = await supabase
      .from('qa_data')
      .upsert({
        project_id: projectId,
        ...updatedData,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving Q&A data:', error);
    } else {
      console.log('QaEditor - Q&A data saved successfully');
    }
  };

  const handleUpdate = (field, value) => {
    saveQaData({ [field]: value });
  };

  const addNewQa = () => {
    const newCount = qaCount + 1;
    setQaCount(newCount);
    const newQuestionKey = `question_${newCount}`;
    const newAnswerKey = `answer_${newCount}`;
    console.log('QaEditor - Adding new Q&A:', newCount);
    saveQaData({ 
      [newQuestionKey]: '', 
      [newAnswerKey]: '' 
    });
  };

  const removeQa = (num) => {
    if (qaCount > 1) {
      setQaCount(prev => prev - 1);
      const questionKey = `question_${num}`;
      const answerKey = `answer_${num}`;
      const updatedData = { ...qaData };
      delete updatedData[questionKey];
      delete updatedData[answerKey];
      saveQaData(updatedData);
    }
  };

  return (
    <div className="bg-white p-6 w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Crimson Pro, serif', fontWeight: 700 }}>
          Q&A Questions
        </h2>
        {isAdmin && (
          <button
            onClick={addNewQa}
            className="px-4 py-2 text-black bg-white border border-black font-crimson font-semibold"
            style={{ fontFamily: 'Crimson Pro, serif', borderRadius: '0' }}
          >
            + Add Q&A
          </button>
        )}
      </div>

      {!isAdmin ? (
        <div className="text-center text-gray-500 mt-8">
          <p>Only administrators can edit Q&A content.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="space-y-6">
            {Array.from({ length: qaCount }, (_, index) => {
              const num = index + 1;
              return (
                <div key={num} className="border border-gray-200 p-4 relative">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      Question {num}
                    </h3>
                    {qaCount > 1 && (
                      <button
                        onClick={() => removeQa(num)}
                        className="text-red-500 text-lg font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  <EditableTextRow
                    value={qaData[`question_${num}`]}
                    onChange={(value) => handleUpdate(`question_${num}`, value)}
                    placeholder={`Enter question ${num}...`}
                    className="text-lg font-semibold mb-2"
                    isVisible={true}
                    fontSize={18}
                    fontFamily="crimson pro"
                    textType="question"
                    bold={true}
                    italic={false}
                    underline={false}
                  />

                  <h4 className="font-medium mt-4 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
                    Answer {num}
                  </h4>
                  
                  <EditableTextRow
                    value={qaData[`answer_${num}`]}
                    onChange={(value) => handleUpdate(`answer_${num}`, value)}
                    placeholder={`Enter answer ${num}...`}
                    className="text-base"
                    isVisible={true}
                    fontSize={16}
                    fontFamily="gothic a1"
                    textType="answer"
                    bold={false}
                    italic={false}
                    underline={false}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QaEditor;
