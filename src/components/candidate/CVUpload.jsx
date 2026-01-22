import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import { FaCloudUploadAlt, FaFilePdf, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CVUpload = ({ candidateId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);

  const mutation = useMutation({
    mutationFn: (file) => documentService.uploadCV(user.id, file, candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries(['candidate_documents']);
      toast.success('CV uploaded successfully! AI parsing started.');
      setFile(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Upload failed');
    }
  });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    setFile(selected);
  };

  const onUpload = () => {
    if (!file) return;
    mutation.mutate(file);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Upload Resume</h3>
      
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-blue-400 transition-colors">
        {!file ? (
          <>
            <FaCloudUploadAlt className="text-4xl text-blue-500 mb-3" />
            <p className="text-sm text-gray-600 mb-4 text-center">
              PDF or Word documents accepted (Max 5MB)
            </p>
            <label className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
              Select File
              <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
            </label>
          </>
        ) : (
          <div className="w-full">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-4">
              <FaFilePdf className="text-red-500 text-xl" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-blue-900 truncate">{file.name}</p>
                <p className="text-xs text-blue-700">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 text-xs">Remove</button>
            </div>
            
            <button
              onClick={onUpload}
              disabled={mutation.isPending}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50"
            >
              {mutation.isPending ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <><FaCheckCircle /> Confirm & Upload</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVUpload;