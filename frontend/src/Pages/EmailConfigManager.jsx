import React, { useState } from 'react';
import { Mail, X, Loader2, Plus, Trash2, ShieldCheck, Clock } from 'lucide-react';
import http from '@/lib/http';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const EmailConfigManager = () => {
  const queryClient = useQueryClient();
  const [emailInput, setEmailInput] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // ✅ FETCH EMAILS FROM SERVER
  const { data, isLoading } = useQuery({
    queryKey: ['emails'],
    queryFn: async () => {
      const res = await http.get('/api/emails');
      return res.data;
    },
  });

  // Support both array response [...] and object response { emails: [...] }
  const emails = Array.isArray(data) ? data : (data?.emails || []);

  // ✅ ADD EMAIL
  const addMutation = useMutation({
    mutationFn: async (email) => {
      return await http.post('/api/emails', { emails : email });
    },
    onSuccess: () => {
      showMessage('Email added successfully!', 'success');
      setEmailInput('');
      queryClient.invalidateQueries(['emails']);
    },
    onError: () => {
      showMessage('Failed to add email', 'error');
    },
  });

  // ✅ DELETE EMAIL BY ID
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await http.delete(`/api/emails/${id}`);
    },
    onSuccess: () => {
      showMessage('Email deleted successfully', 'info');
      queryClient.invalidateQueries(['emails']);
    },
    onError: () => {
      showMessage('Failed to delete email', 'error');
    },
  });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (!email) return showMessage('Please enter an email', 'error');
    if (!validateEmail(email)) return showMessage('Invalid email format', 'error');
    addMutation.mutate([email]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Email Configuration
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Manage notification email addresses
          </p>
        </div>

        {/* Toast Message */}
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg flex items-center justify-between text-sm font-medium ${
            message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
            message.type === 'error'   ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                                         'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ text: '', type: '' })}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Add Email Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Add Email Address
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="someone@example.com"
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              disabled={addMutation.isLoading}
            />
            <button
              onClick={handleAddEmail}
              disabled={addMutation.isLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {addMutation.isLoading
                ? <Loader2 className="animate-spin" size={16} />
                : <Plus size={16} />
              }
              Add
            </button>
          </div>
        </div>

        {/* Email List from Server */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

          {/* List Header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Registered Emails
            </h2>
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
              {emails.length} total
            </span>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>

          /* Empty State */
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Mail className="text-gray-300 dark:text-gray-600 mb-3" size={36} />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No emails configured yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Add an email address above to get started</p>
            </div>

          /* Email Rows */
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {emails.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group"
                >
                  {/* Left: icon + info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Mail size={15} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.email}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {/* Active badge */}
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          item.is_active
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          <ShieldCheck size={11} />
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>

                        {/* Created at */}
                        {item.created_at && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                            <Clock size={11} />
                            {formatDate(item.created_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Delete button (shows on hover) */}
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isLoading}
                    title="Delete email"
                    className="ml-4 flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-xs text-center text-gray-400 dark:text-gray-600 mt-4">
          These emails will receive system notifications
        </p>
      </div>
    </div>
  );
};

export default EmailConfigManager;