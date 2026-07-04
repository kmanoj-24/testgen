import { useState, useMemo } from 'react';
import {
  CheckCircle, XCircle, FlaskConical, Shield, Zap, Monitor, Smartphone,
  AlertTriangle, ChevronDown, ChevronUp, Save, ArrowLeft,
  CheckSquare, XSquare, BarChart3, Copy, Search, RotateCcw, Sparkles,
} from 'lucide-react';
import { Button } from '../UI/Button';
import { Card, CardHeader, CardContent } from '../UI/Card';
import { Badge } from '../UI/Badge';
import { Progress } from '../UI/Progress';
import { Tooltip } from '../UI/Tooltip';
import { EmptyState } from '../UI/EmptyState';

const typeIcons = {
  Positive: CheckCircle, Negative: XCircle, Boundary: AlertTriangle,
  Edge: Zap, Security: Shield, Performance: Zap, Usability: Monitor,
  Compatibility: Smartphone, API: FlaskConical, Integration: FlaskConical,
};

const typeVariants = {
  Positive: 'success', Negative: 'danger', Boundary: 'warning',
  Edge: 'primary', Security: 'info', Performance: 'warning',
  Usability: 'info', Compatibility: 'muted', API: 'primary', Integration: 'success',
};

const priorityVariants = { Critical: 'danger', High: 'warning', Medium: 'info', Low: 'muted' };
const statusVariants = { pending_review: 'warning', approved: 'success', rejected: 'danger' };

export const TestCaseResult = ({ result, onBack, onReset }) => {
  const [testCases, setTestCases] = useState(result.testCases);
  const [expandedId, setExpandedId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [showNotesInput, setShowNotesInput] = useState({});
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  if (!result) return null;
  const { ticketKey, ticketSummary, acceptanceCriteria, generatedAt } = result;

  const stats = useMemo(() => {
    const total = testCases.length;
    const approved = testCases.filter(tc => tc.status === 'approved').length;
    const rejected = testCases.filter(tc => tc.status === 'rejected').length;
    const pending = testCases.filter(tc => tc.status === 'pending_review').length;
    const byType = {};
    testCases.forEach(tc => { byType[tc.type] = (byType[tc.type] || 0) + 1; });
    return { total, approved, rejected, pending, byType };
  }, [testCases]);

  const filteredCases = useMemo(() => {
    let cases = [...testCases];
    if (filterType !== 'all') cases = cases.filter(tc => tc.type === filterType);
    if (filterStatus !== 'all') cases = cases.filter(tc => tc.status === filterStatus);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      cases = cases.filter(tc => tc.title.toLowerCase().includes(q) || tc.id.toLowerCase().includes(q));
    }
    if (sortBy === 'type') cases.sort((a, b) => a.type.localeCompare(b.type));
    if (sortBy === 'priority') {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      cases.sort((a, b) => (order[a.priority] || 99) - (order[b.priority] || 99));
    }
    return cases;
  }, [testCases, filterType, filterStatus, searchQuery, sortBy]);

  const allTypes = [...new Set(testCases.map(tc => tc.type))];

  const handleApprove = (id) => setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, status: 'approved', approved: true, rejected: false } : tc));
  const handleReject = (id) => {
    setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, status: 'rejected', approved: false, rejected: true } : tc));
    setShowNotesInput(prev => ({ ...prev, [id]: true }));
  };
  const handlePending = (id) => setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, status: 'pending_review', approved: false, rejected: false } : tc));
  const handleNoteChange = (id, note) => setReviewNotes(prev => ({ ...prev, [id]: note }));
  const handleSaveNote = (id) => {
    setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, reviewerNotes: reviewNotes[id] || tc.reviewerNotes } : tc));
    setShowNotesInput(prev => ({ ...prev, [id]: false }));
  };
  const handleBulkApprove = () => setTestCases(prev => prev.map(tc => ({ ...tc, status: 'approved', approved: true, rejected: false })));
  const handleBulkReject = () => setTestCases(prev => prev.map(tc => ({ ...tc, status: 'rejected', approved: false, rejected: true })));
  const handleBulkReset = () => setTestCases(prev => prev.map(tc => ({ ...tc, status: 'pending_review', approved: false, rejected: false, reviewerNotes: '' })));
  const handleCopy = (text) => navigator.clipboard.writeText(text);
  const approvalProgress = stats.total ? (stats.approved / stats.total) * 100 : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in-up">
      <Card elevated>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Generated Test Cases</h2>
                <p className="text-sm text-foreground-muted">{ticketKey} — {ticketSummary}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={onBack} icon={ArrowLeft}>Back</Button>
              <Button variant="secondary" size="sm" onClick={onReset} icon={RotateCcw}>New</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox label="Total" value={stats.total} icon={BarChart3} color="primary" />
            <StatBox label="Approved" value={stats.approved} icon={CheckCircle} color="success" />
            <StatBox label="Rejected" value={stats.rejected} icon={XCircle} color="danger" />
            <StatBox label="Pending" value={stats.pending} icon={AlertTriangle} color="warning" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground-muted">Review Progress</span>
              <span className="font-medium text-foreground">{Math.round(approvalProgress)}%</span>
            </div>
            <Progress value={stats.approved} max={stats.total} size="md" />
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              <Badge key={type} variant={typeVariants[type] || 'muted'}>{type}: {count}</Badge>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Source Acceptance Criteria</h4>
            <div className="bg-secondary/50 rounded-xl p-4 max-h-40 overflow-y-auto scrollbar-thin">
              <p className="text-sm text-foreground-muted whitespace-pre-wrap leading-relaxed">{acceptanceCriteria}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-foreground-subtle">
            <span>Generated {new Date(generatedAt).toLocaleString()}</span>
            <Badge variant="primary">{testCases.length} Test Cases</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button variant="success" size="sm" onClick={handleBulkApprove} icon={CheckSquare}>Approve All</Button>
            <Button variant="danger" size="sm" onClick={handleBulkReject} icon={XSquare}>Reject All</Button>
            <Button variant="secondary" size="sm" onClick={handleBulkReset} icon={RotateCcw}>Reset</Button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
              <input type="text" placeholder="Search cases..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-9 py-1.5 text-sm w-48" />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input py-1.5 text-sm w-32">
              <option value="all">All Types</option>
              {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input py-1.5 text-sm w-32">
              <option value="all">All Status</option>
              <option value="pending_review">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input py-1.5 text-sm w-32">
              <option value="default">Default</option>
              <option value="type">By Type</option>
              <option value="priority">By Priority</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <EmptyState icon={Search} title="No test cases match" description="Try adjusting your filters or search query." />
        ) : (
          filteredCases.map((tc, index) => {
            const Icon = typeIcons[tc.type] || FlaskConical;
            const isExpanded = expandedId === tc.id;
            const statusVar = statusVariants[tc.status];
            const typeVar = typeVariants[tc.type] || 'muted';
            const priorityVar = priorityVariants[tc.priority] || 'muted';

            return (
              <Card key={tc.id} className={`overflow-hidden transition-all duration-300 border-l-4 ${tc.status === 'approved' ? 'border-l-success' : tc.status === 'rejected' ? 'border-l-danger' : 'border-l-border'}`} style={{ animationDelay: `${index * 50}ms` }}>
                <div className="p-4 sm:p-5 cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => setExpandedId(isExpanded ? null : tc.id)}>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 rounded-lg shrink-0 ${typeVar === 'success' ? 'bg-success/10 text-success' : typeVar === 'danger' ? 'bg-danger/10 text-danger' : typeVar === 'warning' ? 'bg-warning/10 text-warning' : typeVar === 'info' ? 'bg-info/10 text-info' : 'bg-primary/10 text-primary'}`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-foreground-subtle">{tc.id}</span>
                        <Badge variant={priorityVar} className="text-[10px]">{tc.priority}</Badge>
                        <Badge variant={statusVar} className="text-[10px]">{tc.status === 'pending_review' ? 'Pending' : tc.status === 'approved' ? 'Approved' : 'Rejected'}</Badge>
                        <Badge variant={typeVar} className="text-[10px]">{tc.type}</Badge>
                      </div>
                      <h3 className={`text-sm sm:text-base font-semibold leading-snug ${tc.status === 'rejected' ? 'text-danger/70 line-through' : 'text-foreground'}`}>{tc.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Tooltip content="Copy ID">
                        <button onClick={(e) => { e.stopPropagation(); handleCopy(tc.id); }} className="p-1.5 rounded-lg hover:bg-secondary text-foreground-subtle hover:text-foreground transition-colors">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-foreground-subtle" /> : <ChevronDown className="h-4 w-4 text-foreground-subtle" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 border-t border-border space-y-5 animate-fade-in">
                    <div className="space-y-2 pt-4">
                      <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Preconditions</h4>
                      <div className="bg-secondary/50 rounded-xl p-4 text-sm text-foreground-muted leading-relaxed">{tc.preconditions}</div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Steps</h4>
                      <ol className="space-y-2">
                        {tc.steps.map((step, i) => (
                          <li key={i} className="flex gap-3 text-sm text-foreground">
                            <span className="flex-shrink-0 h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                            <span className="pt-0.5 leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="bg-success/5 border border-success/20 rounded-xl p-4 space-y-2">
                      <h4 className="text-xs font-semibold text-success uppercase tracking-wider">Expected Result</h4>
                      <p className="text-sm text-foreground leading-relaxed">{tc.expected_result}</p>
                    </div>

                    {tc.reviewerNotes && (
                      <div className="bg-info/5 border border-info/20 rounded-xl p-4 space-y-2">
                        <h4 className="text-xs font-semibold text-info uppercase tracking-wider">Reviewer Notes</h4>
                        <p className="text-sm text-foreground-muted">{tc.reviewerNotes}</p>
                      </div>
                    )}

                    {showNotesInput[tc.id] && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="text-xs font-medium text-foreground-muted">Add rejection note</label>
                        <textarea value={reviewNotes[tc.id] || ''} onChange={(e) => handleNoteChange(tc.id, e.target.value)} placeholder="Why is this test case being rejected?" className="input min-h-[80px] resize-y" />
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary" onClick={() => handleSaveNote(tc.id)} icon={Save}>Save Note</Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowNotesInput(prev => ({ ...prev, [tc.id]: false }))}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {tc.status !== 'approved' && <Button size="sm" variant="success" onClick={() => handleApprove(tc.id)} icon={CheckCircle}>Approve</Button>}
                      {tc.status !== 'rejected' && <Button size="sm" variant="danger" onClick={() => handleReject(tc.id)} icon={XCircle}>Reject</Button>}
                      {tc.status !== 'pending_review' && <Button size="sm" variant="secondary" onClick={() => handlePending(tc.id)} icon={RotateCcw}>Reset</Button>}
                      <Button size="sm" variant="ghost" onClick={() => handleCopy(JSON.stringify(tc, null, 2))} icon={Copy}>Copy JSON</Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

const StatBox = ({ label, value, icon: Icon, color }) => {
  const colorMap = { primary: 'bg-primary/10 text-primary', success: 'bg-success/10 text-success', danger: 'bg-danger/10 text-danger', warning: 'bg-warning/10 text-warning' };
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
      <div className={`p-2 rounded-lg ${colorMap[color]}`}><Icon className="h-4 w-4" /></div>
      <div><div className="text-xl font-bold text-foreground">{value}</div><div className="text-xs text-foreground-muted">{label}</div></div>
    </div>
  );
};