import { useState, useCallback } from 'react';
import { jiraApi, aiApi } from '../services/api';

export function TicketPage() {
  const [ticketKey, setTicketKey] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [testCases, setTestCases] = useState(null);
  const [selectedTests, setSelectedTests] = useState(new Set());
  const [editingTest, setEditingTest] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [activeTab, setActiveTab] = useState('all');

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    setTicket(null);
    setTestCases(null);
    setSelectedTests(new Set());

    try {
      const ticketData = await jiraApi.getTicket(ticketKey);
      console.log('Fetched ticket:', ticketData);
      setTicket(ticketData);
    } catch (err) {
      setError(err.message || 'Failed to fetch ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!ticket) return;

    console.log('Sending to AI:', {
      key: ticket.key,
      summary: ticket.summary,
      hasAC: !!ticket.acceptanceCriteria,
      acPreview: ticket.acceptanceCriteria?.substring(0, 100)
    });

    setGenerating(true);
    setError('');
    setSelectedTests(new Set());

    try {
      const result = await aiApi.generateTestCases(ticket);
      console.log('Generated result:', result);
      setTestCases(result);
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = useCallback((testId) => {
    setTestCases(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        testCases: prev.testCases.map(tc => 
          tc.id === testId ? { ...tc, approved: true, rejected: false, status: 'approved' } : tc
        )
      };
    });
  }, []);

  const handleReject = useCallback((testId) => {
    setTestCases(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        testCases: prev.testCases.map(tc => 
          tc.id === testId ? { ...tc, approved: false, rejected: true, status: 'rejected' } : tc
        )
      };
    });
  }, []);

  const handleEdit = useCallback((testId, updates) => {
    setTestCases(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        testCases: prev.testCases.map(tc => 
          tc.id === testId ? { ...tc, ...updates, status: 'modified' } : tc
        )
      };
    });
    setEditingTest(null);
  }, []);

  const handleBulkApprove = useCallback(() => {
    setTestCases(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        testCases: prev.testCases.map(tc => 
          selectedTests.has(tc.id) ? { ...tc, approved: true, rejected: false, status: 'approved' } : tc
        )
      };
    });
    setSelectedTests(new Set());
  }, [selectedTests]);

  const handleBulkReject = useCallback(() => {
    setTestCases(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        testCases: prev.testCases.map(tc => 
          selectedTests.has(tc.id) ? { ...tc, approved: false, rejected: true, status: 'rejected' } : tc
        )
      };
    });
    setSelectedTests(new Set());
  }, [selectedTests]);

  const toggleSelect = useCallback((testId) => {
    setSelectedTests(prev => {
      const next = new Set(prev);
      if (next.has(testId)) {
        next.delete(testId);
      } else {
        next.add(testId);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (!testCases) return;
    const filtered = getFilteredTests();
    const allSelected = filtered.every(tc => selectedTests.has(tc.id));

    setSelectedTests(prev => {
      const next = new Set(prev);
      if (allSelected) {
        filtered.forEach(tc => next.delete(tc.id));
      } else {
        filtered.forEach(tc => next.add(tc.id));
      }
      return next;
    });
  }, [testCases, selectedTests, filterType, filterPriority, searchQuery]);

  const exportToCSV = useCallback(() => {
    if (!testCases) return;
    const tests = getFilteredTests();
    const headers = ['ID', 'Title', 'Type', 'Priority', 'Status', 'Preconditions', 'Steps', 'Expected Result', 'AC Reference'];
    const rows = tests.map(tc => [
      tc.id,
      `"${tc.title.replace(/"/g, '""')}"`,
      tc.type,
      tc.priority,
      tc.status,
      `"${(tc.preconditions || '').replace(/"/g, '""')}"`,
      `"${(tc.steps || []).join(' | ').replace(/"/g, '""')}"`,
      `"${(tc.expected_result || '').replace(/"/g, '""')}"`,
      `"${(tc.requirement_ref || '').replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticket.key}_test_cases.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [testCases, ticket]);

  const exportToExcel = useCallback(() => {
    if (!testCases) return;
    const tests = getFilteredTests();
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8"></head>
      <body>
      <table>
        <tr>
          <th>ID</th><th>Title</th><th>Type</th><th>Priority</th><th>Status</th>
          <th>Preconditions</th><th>Steps</th><th>Expected Result</th><th>AC Reference</th>
        </tr>
    `;
    tests.forEach(tc => {
      html += `<tr>
        <td>${tc.id}</td>
        <td>${tc.title}</td>
        <td>${tc.type}</td>
        <td>${tc.priority}</td>
        <td>${tc.status}</td>
        <td>${tc.preconditions || ''}</td>
        <td>${(tc.steps || []).join('\n')}</td>
        <td>${tc.expected_result || ''}</td>
        <td>${tc.requirement_ref || ''}</td>
      </tr>`;
    });
    html += '</table></body></html>';

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticket.key}_test_cases.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }, [testCases, ticket]);

  const getFilteredTests = () => {
    if (!testCases?.testCases) return [];
    let tests = [...testCases.testCases];

    if (activeTab !== 'all') {
      if (activeTab === 'approved') tests = tests.filter(tc => tc.approved);
      else if (activeTab === 'rejected') tests = tests.filter(tc => tc.rejected);
      else if (activeTab === 'pending') tests = tests.filter(tc => !tc.approved && !tc.rejected);
    }

    if (filterType !== 'All') {
      tests = tests.filter(tc => tc.type === filterType);
    }
    if (filterPriority !== 'All') {
      tests = tests.filter(tc => tc.priority === filterPriority);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      tests = tests.filter(tc => 
        tc.title.toLowerCase().includes(q) ||
        tc.requirement_ref?.toLowerCase().includes(q) ||
        tc.id.toLowerCase().includes(q)
      );
    }

    tests.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'id') cmp = a.id.localeCompare(b.id);
      else if (sortBy === 'priority') {
        const order = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        cmp = (order[b.priority] || 0) - (order[a.priority] || 0);
      } else if (sortBy === 'type') cmp = a.type.localeCompare(b.type);
      else if (sortBy === 'status') cmp = (a.status || '').localeCompare(b.status || '');

      return sortOrder === 'desc' ? -cmp : cmp;
    });

    return tests;
  };

  const getStats = () => {
    if (!testCases?.testCases) return {};
    const tests = testCases.testCases;
    return {
      total: tests.length,
      approved: tests.filter(t => t.approved).length,
      rejected: tests.filter(t => t.rejected).length,
      pending: tests.filter(t => !t.approved && !t.rejected).length,
      byType: {
        Positive: tests.filter(t => t.type === 'Positive').length,
        Negative: tests.filter(t => t.type === 'Negative').length,
        Boundary: tests.filter(t => t.type === 'Boundary').length,
        Edge: tests.filter(t => t.type === 'Edge').length,
        Security: tests.filter(t => t.type === 'Security').length,
        Performance: tests.filter(t => t.type === 'Performance').length,
        Usability: tests.filter(t => t.type === 'Usability').length,
        API: tests.filter(t => t.type === 'API').length,
        Integration: tests.filter(t => t.type === 'Integration').length,
      }
    };
  };

  const filteredTests = getFilteredTests();
  const stats = getStats();
  const allTypes = ['All', 'Positive', 'Negative', 'Boundary', 'Edge', 'Security', 'Performance', 'Usability', 'API', 'Integration'];
  const allPriorities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  const getTypeColor = (type) => {
    const colors = {
      Positive: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      Negative: 'bg-rose-100 text-rose-700 border-rose-200',
      Boundary: 'bg-amber-100 text-amber-700 border-amber-200',
      Edge: 'bg-orange-100 text-orange-700 border-orange-200',
      Security: 'bg-purple-100 text-purple-700 border-purple-200',
      Performance: 'bg-blue-100 text-blue-700 border-blue-200',
      Usability: 'bg-pink-100 text-pink-700 border-pink-200',
      API: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      Integration: 'bg-cyan-100 text-cyan-700 border-cyan-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: 'bg-red-500 text-white',
      High: 'bg-orange-500 text-white',
      Medium: 'bg-yellow-500 text-white',
      Low: 'bg-gray-400 text-white'
    };
    return colors[priority] || 'bg-gray-300 text-gray-700';
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return '✓';
    if (status === 'rejected') return '✗';
    if (status === 'modified') return '✎';
    return '○';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .stagger-1 { animation-delay: 0.05s; }
        .stagger-2 { animation-delay: 0.1s; }
        .stagger-3 { animation-delay: 0.15s; }
        .stagger-4 { animation-delay: 0.2s; }
        .stagger-5 { animation-delay: 0.25s; }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .btn-gradient-blue {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
          background-size: 200% 200%;
          transition: all 0.3s ease;
        }
        .btn-gradient-blue:hover {
          background-position: 100% 0;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -8px rgba(59, 130, 246, 0.5);
        }
        .btn-gradient-green {
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          background-size: 200% 200%;
          transition: all 0.3s ease;
        }
        .btn-gradient-green:hover {
          background-position: 100% 0;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -8px rgba(16, 185, 129, 0.5);
        }
        .test-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 4px solid transparent;
        }
        .test-card:hover {
          transform: translateX(4px);
          box-shadow: 0 10px 30px -8px rgba(0, 0, 0, 0.1);
        }
        .test-card.approved { border-left-color: #10b981; }
        .test-card.rejected { border-left-color: #ef4444; }
        .test-card.pending { border-left-color: #f59e0b; }
        .test-card.modified { border-left-color: #8b5cf6; }
      `}</style>

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg animate-float">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Solix AI
            </h1>
          </div>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            AI-powered test case generation from Jira stories
          </p>
        </div>

        {/* Fetch Section */}
        <div className="glass-card rounded-2xl shadow-xl p-6 md:p-8 mb-8 animate-fade-in-up stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Fetch Jira Ticket</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0z" />
                </svg>
              </div>
              <input
                value={ticketKey}
                onChange={(e) => setTicketKey(e.target.value.toUpperCase())}
                placeholder="CDPIDC-2424"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg font-medium placeholder-gray-400"
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              />
            </div>
            <button 
              onClick={handleFetch}
              disabled={loading || !ticketKey}
              className="btn-gradient-blue text-white px-8 py-3.5 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Fetching...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Fetch Ticket
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2 ml-1">Enter a Jira ticket key to extract acceptance criteria and generate test cases</p>
        </div>

        {/* Ticket Details */}
        {ticket && (
          <div className="glass-card rounded-2xl shadow-xl p-6 md:p-8 mb-8 animate-fade-in-up stagger-2 hover-lift">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-bold">{ticket.key}</span>
                  <h3 className="text-2xl font-bold text-gray-900">{ticket.summary}</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {ticket.status?.name || 'N/A'}
                  </span>
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-1 ${getPriorityColor(ticket.priority?.name)}`}>
                    {ticket.priority?.name || 'N/A'}
                  </span>
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                    {ticket.issueType || 'Story'}
                  </span>
                </div>
              </div>
              {ticket.assignee && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  {ticket.assignee.avatar && (
                    <img src={ticket.assignee.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{ticket.assignee.name}</p>
                    <p className="text-xs text-gray-500">{ticket.assignee.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* AC Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 mb-5 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-bold text-amber-800">Acceptance Criteria</h4>
              </div>
              {ticket.acceptanceCriteria ? (
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{ticket.acceptanceCriteria}</pre>
              ) : (
                <div className="flex items-center gap-2 text-red-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>No acceptance criteria found. Generation may produce generic tests.</p>
                </div>
              )}
            </div>

            {/* Description */}
            {ticket.description && (
              <div className="mb-5">
                <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Description
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {ticket.description}
                </div>
              </div>
            )}

            {/* Labels & Components */}
            <div className="flex flex-wrap gap-3 mb-6">
              {ticket.labels?.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Labels:</span>
                  <div className="flex gap-1">
                    {ticket.labels.map((label, i) => (
                      <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-medium border border-indigo-100">{label}</span>
                    ))}
                  </div>
                </div>
              )}
              {ticket.components?.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Components:</span>
                  <div className="flex gap-1">
                    {ticket.components.map((comp, i) => (
                      <span key={i} className="px-2 py-1 bg-teal-50 text-teal-600 rounded-md text-xs font-medium border border-teal-100">{comp}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-gradient-green text-white px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <div className="flex flex-col items-start">
                    <span>Generating Test Cases...</span>
                    <span className="text-xs font-normal opacity-80">This may take 60-90 seconds</span>
                  </div>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Test Cases
                </>
              )}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-5 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl mb-8 animate-fade-in-up shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">Error</p>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Cases Section */}
        {testCases && testCases.testCases && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Dashboard */}
            <div className="glass-card rounded-2xl shadow-xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Test Case Statistics
              </h3>

              {/* Main Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg hover-lift">
                  <p className="text-3xl font-extrabold">{stats.total}</p>
                  <p className="text-sm font-medium opacity-90">Total Test Cases</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg hover-lift">
                  <p className="text-3xl font-extrabold">{stats.approved}</p>
                  <p className="text-sm font-medium opacity-90">Approved</p>
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-4 text-white shadow-lg hover-lift">
                  <p className="text-3xl font-extrabold">{stats.rejected}</p>
                  <p className="text-sm font-medium opacity-90">Rejected</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white shadow-lg hover-lift">
                  <p className="text-3xl font-extrabold">{stats.pending}</p>
                  <p className="text-sm font-medium opacity-90">Pending Review</p>
                </div>
              </div>

              {/* Type Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {Object.entries(stats.byType || {}).map(([type, count]) => (
                  count > 0 && (
                    <div key={type} className={`rounded-lg p-3 border-2 text-center hover-lift cursor-pointer ${getTypeColor(type)}`}>
                      <p className="text-xl font-bold">{count}</p>
                      <p className="text-xs font-semibold">{type}</p>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Filters & Actions */}
            <div className="glass-card rounded-2xl shadow-xl p-4 md:p-6">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-4">
                {[
                  { key: 'all', label: 'All', icon: '📋' },
                  { key: 'pending', label: 'Pending', icon: '⏳' },
                  { key: 'approved', label: 'Approved', icon: '✅' },
                  { key: 'rejected', label: 'Rejected', icon: '❌' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === tab.key 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filteredTests.length > 0 && filteredTests.every(tc => selectedTests.has(tc.id))}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Select All</span>
                </div>

                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                >
                  {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <select 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                >
                  {allPriorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <div className="flex-1 min-w-[200px] relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search test cases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>

                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                >
                  <option value="id">Sort by ID</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="type">Sort by Type</option>
                  <option value="status">Sort by Status</option>
                </select>

                <button 
                  onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} 
                  className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>

                {selectedTests.size > 0 && (
                  <>
                    <button onClick={handleBulkApprove} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover-lift flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve ({selectedTests.size})
                    </button>
                    <button onClick={handleBulkReject} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover-lift flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject ({selectedTests.size})
                    </button>
                  </>
                )}

                <button onClick={exportToCSV} className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover-lift flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  CSV
                </button>
                <button onClick={exportToExcel} className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover-lift flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel
                </button>
              </div>
            </div>

            {/* Test Cases List */}
            <div className="space-y-4">
              {filteredTests.map((tc, index) => (
                <div 
                  key={tc.id} 
                  className={`test-card glass-card rounded-xl shadow-md p-5 md:p-6 ${tc.status || 'pending'} animate-fade-in-up stagger-${(index % 5) + 1}`}
                >
                  {editingTest === tc.id ? (
                    <EditForm test={tc} onSave={handleEdit} onCancel={() => setEditingTest(null)} />
                  ) : (
                    <>
                      {/* Header */}
                      <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedTests.has(tc.id)}
                            onChange={() => toggleSelect(tc.id)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{tc.id}</span>
                              <h4 className="font-bold text-gray-900 text-lg">{tc.title}</h4>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {tc.requirement_ref}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getTypeColor(tc.type)}`}>
                            {tc.type}
                          </span>
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getPriorityColor(tc.priority)}`}>
                            {tc.priority}
                          </span>
                          {tc.automation_candidate && (
                            <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Auto
                            </span>
                          )}
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                            tc.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            tc.status === 'rejected' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                            tc.status === 'modified' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                            'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            <span className="text-sm">{getStatusIcon(tc.status)}</span>
                            {tc.status || 'pending'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="ml-8 space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preconditions</span>
                          <p className="text-sm text-gray-700 mt-1">{tc.preconditions}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Steps</span>
                          <ol className="text-sm text-gray-700 mt-1 space-y-1">
                            {tc.steps.map((step, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="font-bold text-blue-500 min-w-[20px]">{i + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Expected Result</span>
                          <p className="text-sm text-gray-700 mt-1">{tc.expected_result}</p>
                        </div>

                        {tc.reviewerNotes && (
                          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                            <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Reviewer Notes</span>
                            <p className="text-sm text-yellow-800 mt-1">{tc.reviewerNotes}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="ml-8 mt-4 flex flex-wrap gap-2">
                        {!tc.approved && (
                          <button 
                            onClick={() => handleApprove(tc.id)} 
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover-lift flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </button>
                        )}
                        {!tc.rejected && (
                          <button 
                            onClick={() => handleReject(tc.id)} 
                            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover-lift flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                        )}
                        <button 
                          onClick={() => setEditingTest(tc.id)} 
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover-lift flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {filteredTests.length === 0 && (
              <div className="text-center py-16 text-gray-400 animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-gray-500">No test cases match your filters</p>
                <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Edit Form Component
function EditForm({ test, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: test.title,
    preconditions: test.preconditions,
    steps: test.steps.join('\n'),
    expected_result: test.expected_result,
    priority: test.priority,
    type: test.type,
    reviewerNotes: test.reviewerNotes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(test.id, {
      ...formData,
      steps: formData.steps.split('\n').filter(s => s.trim()),
      status: 'modified'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
          <input
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 mt-1"
          >
            {['Positive', 'Negative', 'Boundary', 'Edge', 'Security', 'Performance', 'Usability', 'API', 'Integration'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 mt-1"
          >
            {['Critical', 'High', 'Medium', 'Low'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preconditions</label>
        <input
          value={formData.preconditions}
          onChange={(e) => setFormData({...formData, preconditions: e.target.value})}
          className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 mt-1"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Steps (one per line)</label>
        <textarea
          value={formData.steps}
          onChange={(e) => setFormData({...formData, steps: e.target.value})}
          className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 mt-1 h-32"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expected Result</label>
        <textarea
          value={formData.expected_result}
          onChange={(e) => setFormData({...formData, expected_result: e.target.value})}
          className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 mt-1 h-20"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reviewer Notes</label>
        <input
          value={formData.reviewerNotes}
          onChange={(e) => setFormData({...formData, reviewerNotes: e.target.value})}
          className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 mt-1"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover-lift flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Changes
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
}
