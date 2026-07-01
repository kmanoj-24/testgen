import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  FlaskConical, 
  Shield, 
  Zap, 
  Monitor,
  Smartphone,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Save,
  ArrowLeft,
  CheckSquare,
  XSquare,
  BarChart3
} from 'lucide-react';
import { Button } from '../common/Button';

const typeIcons = {
  Positive: CheckCircle,
  Negative: XCircle,
  Boundary: AlertTriangle,
  Edge: Zap,
  Security: Shield,
  Performance: Zap,
  Usability: Monitor,
  Compatibility: Smartphone
};

const typeColors = {
  Positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Negative: 'bg-red-50 text-red-700 border-red-200',
  Boundary: 'bg-amber-50 text-amber-700 border-amber-200',
  Edge: 'bg-purple-50 text-purple-700 border-purple-200',
  Security: 'bg-blue-50 text-blue-700 border-blue-200',
  Performance: 'bg-orange-50 text-orange-700 border-orange-200',
  Usability: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Compatibility: 'bg-pink-50 text-pink-700 border-pink-200'
};

const priorityColors = {
  Critical: 'bg-red-100 text-red-800 border-red-300',
  High: 'bg-orange-100 text-orange-800 border-orange-300',
  Medium: 'bg-blue-100 text-blue-800 border-blue-300',
  Low: 'bg-gray-100 text-gray-800 border-gray-300'
};

const statusColors = {
  pending_review: 'bg-yellow-50 text-yellow-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700'
};

export const TestCaseResult = ({ result, onBack, onReset }) => {
  const [testCases, setTestCases] = useState(result.testCases);
  const [expandedId, setExpandedId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [showNotesInput, setShowNotesInput] = useState({});

  if (!result) return null;

  const { ticketKey, ticketSummary, acceptanceCriteria, generatedAt } = result;

  // Statistics
  const stats = {
    total: testCases.length,
    approved: testCases.filter(tc => tc.status === 'approved').length,
    rejected: testCases.filter(tc => tc.status === 'rejected').length,
    pending: testCases.filter(tc => tc.status === 'pending_review').length,
    byType: {}
  };

  testCases.forEach(tc => {
    stats.byType[tc.type] = (stats.byType[tc.type] || 0) + 1;
  });

  const handleApprove = (id) => {
    setTestCases(prev => prev.map(tc => 
      tc.id === id ? { ...tc, status: 'approved', approved: true, rejected: false } : tc
    ));
  };

  const handleReject = (id) => {
    setTestCases(prev => prev.map(tc => 
      tc.id === id ? { ...tc, status: 'rejected', approved: false, rejected: true } : tc
    ));
    setShowNotesInput(prev => ({ ...prev, [id]: true }));
  };

  const handlePending = (id) => {
    setTestCases(prev => prev.map(tc => 
      tc.id === id ? { ...tc, status: 'pending_review', approved: false, rejected: false } : tc
    ));
  };

  const handleNoteChange = (id, note) => {
    setReviewNotes(prev => ({ ...prev, [id]: note }));
  };

  const handleSaveNote = (id) => {
    setTestCases(prev => prev.map(tc => 
      tc.id === id ? { ...tc, reviewerNotes: reviewNotes[id] || tc.reviewerNotes } : tc
    ));
    setShowNotesInput(prev => ({ ...prev, [id]: false }));
  };

  const handleBulkApprove = () => {
    setTestCases(prev => prev.map(tc => ({ ...tc, status: 'approved', approved: true, rejected: false })));
  };

  const handleBulkReject = () => {
    setTestCases(prev => prev.map(tc => ({ ...tc, status: 'rejected', approved: false, rejected: true })));
  };

  const handleBulkReset = () => {
    setTestCases(prev => prev.map(tc => ({ ...tc, status: 'pending_review', approved: false, rejected: false, reviewerNotes: '' })));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">🎯 Generated Test Cases</h2>
            <p className="text-sm text-gray-500 mt-1">
              {ticketKey} — {ticketSummary}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onBack} icon={ArrowLeft}>
              Back
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
            <div className="text-xs text-green-600">Approved</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
            <div className="text-xs text-red-600">Rejected</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-xs text-yellow-600">Pending</div>
          </div>
        </div>

        {/* Type Distribution */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(stats.byType).map(([type, count]) => (
            <span key={type} className={`text-xs px-2 py-1 rounded-full border ${typeColors[type]?.replace('bg-', 'border-').replace('text-', 'bg-opacity-10 text-') || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {type}: {count}
            </span>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">📋 Source Acceptance Criteria</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">{acceptanceCriteria}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Generated: {new Date(generatedAt).toLocaleString()}</span>
          <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
            {testCases.length} Test Cases
          </span>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">Bulk Actions:</span>
          <Button variant="primary" size="sm" onClick={handleBulkApprove} icon={CheckSquare}>
            Approve All
          </Button>
          <Button variant="danger" size="sm" onClick={handleBulkReject} icon={XSquare}>
            Reject All
          </Button>
          <Button variant="secondary" size="sm" onClick={handleBulkReset}>
            Reset All
          </Button>
          <Button variant="secondary" size="sm" icon={BarChart3}>
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Test Cases List */}
      <div className="space-y-3">
        {testCases.map((tc) => {
          const Icon = typeIcons[tc.type] || FlaskConical;
          const isExpanded = expandedId === tc.id;

          return (
            <div 
              key={tc.id} 
              className={`card border-l-4 transition-all duration-200 ${
                tc.status === 'approved' ? 'border-l-green-500 bg-green-50/30' : 
                tc.status === 'rejected' ? 'border-l-red-500 bg-red-50/30' : 
                'border-l-gray-300'
              }`}
            >
              {/* Header Row */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50/50"
                onClick={() => setExpandedId(isExpanded ? null : tc.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${typeColors[tc.type] || 'bg-gray-50'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{tc.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${priorityColors[tc.priority] || 'bg-gray-100'}`}>
                          {tc.priority}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[tc.status] || 'bg-gray-100'}`}>
                          {tc.status === 'pending_review' ? '⏳ Pending' : tc.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                        </span>
                      </div>
                      <h3 className={`text-base font-semibold mt-1 ${
                        tc.status === 'rejected' ? 'text-red-700 line-through' : 'text-gray-900'
                      }`}>
                        {tc.title}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${typeColors[tc.type] || 'bg-gray-50'}`}>
                      {tc.type}
                    </span>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                  {/* Preconditions */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">📝 Preconditions</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{tc.preconditions}</p>
                  </div>

                  {/* Steps */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">🔢 Steps</h4>
                    <ol className="space-y-2">
                      {tc.steps.map((step, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium">
                            {i + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Expected Result */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                    <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">✅ Expected Result</h4>
                    <p className="text-sm text-emerald-800">{tc.expected_result}</p>
                  </div>

                  {/* Reviewer Notes */}
                  {tc.reviewerNotes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">💬 Reviewer Notes</h4>
                      <p className="text-sm text-blue-800">{tc.reviewerNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {tc.status !== 'approved' && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleApprove(tc.id)}
                        icon={CheckCircle}
                      >
                        Approve
                      </Button>
                    )}
                    {tc.status !== 'rejected' && (
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleReject(tc.id)}
                        icon={XCircle}
                      >
                        Reject
                      </Button>
                    )}
                    {tc.status !== 'pending_review' && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handlePending(tc.id)}
                      >
                        Reset to Pending
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowNotesInput(prev => ({ ...prev, [tc.id]: !prev[tc.id] }))}
                      icon={MessageSquare}
                    >
                      {showNotesInput[tc.id] ? 'Hide Notes' : 'Add Notes'}
                    </Button>
                  </div>

                  {/* Notes Input */}
                  {showNotesInput[tc.id] && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter reviewer notes..."
                        value={reviewNotes[tc.id] || tc.reviewerNotes || ''}
                        onChange={(e) => handleNoteChange(tc.id, e.target.value)}
                        className="flex-1 rounded-lg border-gray-300 text-sm px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                      />
                      <Button variant="secondary" size="sm" onClick={() => handleSaveNote(tc.id)} icon={Save}>
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-center gap-4 pt-4 pb-8">
        <Button variant="secondary" onClick={onReset}>
          Generate for Another Ticket
        </Button>
        <Button variant="primary" icon={BarChart3}>
          Export Approved to Excel
        </Button>
      </div>
    </div>
  );
};