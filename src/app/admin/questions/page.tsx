'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Edit3, Eye, EyeOff, Search, ChevronLeft, ChevronRight, Plus, Trash2, Link as LinkIcon, Image as ImageIcon, FileText } from 'lucide-react';

export default function AdminQuestionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterChapter, setFilterChapter] = useState('');
  const [filterType, setFilterType] = useState('');
  const [chapters, setChapters] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    chapterId: '',
    type: 'MCQ',
    marks: 1,
    questionText: '',
    bookAnswer: 'A',
    options: [
      { label: 'A', text: '' },
      { label: 'B', text: '' },
      { label: 'C', text: '' },
      { label: 'D', text: '' },
    ],
    attachments: []
  });
  const [loadingQ, setLoadingQ] = useState(true);

  useEffect(() => {
    if (!loading && user?.role !== 'ADMIN') router.push('/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    fetch('/api/chapters').then(r => r.json()).then(d => setChapters(d.chapters || []));
  }, []);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (filterChapter) params.set('chapterId', filterChapter);
    if (filterType) params.set('type', filterType);
    setLoadingQ(true);
    fetch(`/api/questions?${params}`).then(r => r.json()).then(d => {
      setQuestions(d.questions || []);
      setTotal(d.total || 0);
      setLoadingQ(false);
    });
  }, [user, page, search, filterChapter, filterType]);

  const togglePublish = async (q: any) => {
    await fetch('/api/admin/questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: q.id, published: !q.published }),
    });
    setQuestions(prev => prev.map(qq => qq.id === q.id ? { ...qq, published: !qq.published } : qq));
  };

  if (loading || !user || user.role !== 'ADMIN') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Question Manager</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Search questions..." />
          </div>
          <select value={filterChapter} onChange={(e) => { setFilterChapter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
            <option value="">All Chapters</option>
            {chapters.map(ch => <option key={ch.id} value={ch.id}>Unit {ch.number}: {ch.title}</option>)}
          </select>
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm">
            <option value="">All Types</option>
            <option value="MCQ">MCQ</option>
            <option value="CODING">Coding</option>
            <option value="THEORY">Theory</option>
          </select>
        </div>
        <button onClick={() => setCreating(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 whitespace-nowrap">
          + Add Question
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">{total} questions found</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Sr#</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Unit</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Question</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Type</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Marks</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Confidence</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(q => (
                <tr key={q.id} className="border-t border-gray-50 hover:bg-blue-50/30">
                  <td className="py-3 px-4 font-mono text-xs">{q.srNo}</td>
                  <td className="py-3 px-4">{q.chapter?.number}</td>
                  <td className="py-3 px-4 max-w-md truncate">{q.questionText}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      q.type === 'MCQ' ? 'bg-blue-50 text-blue-600' : q.type === 'CODING' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600'
                    }`}>{q.type}</span>
                  </td>
                  <td className="py-3 px-4 text-center">{q.marks}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs font-medium ${q.confidence >= 0.8 ? 'text-green-600' : q.confidence >= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {(q.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => togglePublish(q)} className={`text-xs px-2 py-0.5 rounded-full ${q.published ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {q.published ? 'Published' : 'Hidden'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => setEditing(q)} className="p-1 text-gray-400 hover:text-blue-600"><Edit3 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg disabled:opacity-30">
          <ChevronLeft size={14} /> Prev
        </button>
        <span className="text-sm text-gray-500">Page {page}</span>
        <button onClick={() => setPage(page + 1)} disabled={questions.length < 20}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg disabled:opacity-30">
          Next <ChevronRight size={14} />
        </button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Edit Question #{editing.srNo}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question Text</label>
                <textarea value={editing.questionText} onChange={e => setEditing({ ...editing, questionText: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm h-32" />
              </div>
              {editing.type === 'MCQ' && editing.options?.map((opt: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-bold text-sm">{opt.label})</span>
                  <input value={opt.text} onChange={e => {
                    const newOpts = [...editing.options];
                    newOpts[i] = { ...newOpts[i], text: e.target.value };
                    setEditing({ ...editing, options: newOpts });
                  }} className="flex-1 px-3 py-1.5 border rounded-lg text-sm" />
                </div>
              ))}
              {/* Attachments Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700">Attachments / Resources</label>
                  <button onClick={() => {
                    const current = editing.attachments || [];
                    setEditing({ ...editing, attachments: [...current, { name: '', url: '', type: 'IMAGE' }] });
                  }} className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                    <Plus size={12} /> Add Resource
                  </button>
                </div>
                <div className="space-y-2">
                  {(editing.attachments || []).map((att: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-start bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <div className="flex-1 space-y-2">
                        <input value={att.name} onChange={e => {
                          const newAtts = [...editing.attachments];
                          newAtts[idx].name = e.target.value;
                          setEditing({ ...editing, attachments: newAtts });
                        }} placeholder="Label (e.g. data.csv)" className="w-full px-2 py-1 text-xs border rounded" />
                        <input value={att.url} onChange={e => {
                          const newAtts = [...editing.attachments];
                          newAtts[idx].url = e.target.value;
                          setEditing({ ...editing, attachments: newAtts });
                        }} placeholder="External URL" className="w-full px-2 py-1 text-xs border rounded" />
                      </div>
                      <select value={att.type} onChange={e => {
                        const newAtts = [...editing.attachments];
                        newAtts[idx].type = e.target.value;
                        setEditing({ ...editing, attachments: newAtts });
                      }} className="text-[10px] border rounded px-1 py-1">
                        <option value="IMAGE">Image</option>
                        <option value="CSV">CSV</option>
                        <option value="PDF">PDF</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <button onClick={() => {
                        const newAtts = editing.attachments.filter((_: any, i: number) => i !== idx);
                        setEditing({ ...editing, attachments: newAtts });
                      }} className="p-1 text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={async () => {
                  await fetch('/api/admin/questions', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      id: editing.id, 
                      questionText: editing.questionText,
                      attachments: editing.attachments
                    }),
                  });
                  setEditing(null);
                  setPage(page);
                }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Save Changes</button>
                <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCreating(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Add New Question</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Unit/Chapter</label>
                  <select value={newQuestion.chapterId} onChange={e => setNewQuestion({ ...newQuestion, chapterId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm">
                    <option value="">Select Chapter...</option>
                    {chapters.map(ch => <option key={ch.id} value={ch.id}>Unit {ch.number}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={newQuestion.type} onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm">
                    <option value="MCQ">MCQ</option>
                    <option value="CODING">Coding</option>
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium mb-1">Marks</label>
                  <input type="number" min="1" value={newQuestion.marks} onChange={e => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-xl text-sm" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Question Text</label>
                <textarea value={newQuestion.questionText} onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm h-32" placeholder="Write question details here. Code blocks will be auto-formatted." />
              </div>

              {newQuestion.type === 'MCQ' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium mb-1">Options</label>
                  {newQuestion.options.map((opt: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="radio" name="correctOpt" checked={newQuestion.bookAnswer === opt.label} 
                        onChange={() => setNewQuestion({ ...newQuestion, bookAnswer: opt.label })} className="mr-2" />
                      <span className="font-bold text-sm">{opt.label})</span>
                      <input value={opt.text} onChange={e => {
                        const newOpts = [...newQuestion.options];
                        newOpts[i] = { ...newOpts[i], text: e.target.value };
                        setNewQuestion({ ...newQuestion, options: newOpts });
                      }} className="flex-1 px-3 py-1.5 border rounded-lg text-sm" placeholder={`Option ${opt.label} text`} />
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-1">Select the radio button next to the correct answer.</p>
                </div>
              )}

              {/* Attachments Section (In Create) */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700">Attachments / Resources</label>
                  <button onClick={() => {
                    setNewQuestion({ ...newQuestion, attachments: [...(newQuestion.attachments || []), { name: '', url: '', type: 'IMAGE' }] });
                  }} className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                    <Plus size={12} /> Add Resource
                  </button>
                </div>
                <div className="space-y-2">
                  {(newQuestion.attachments || []).map((att: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-start bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <div className="flex-1 space-y-2">
                        <input value={att.name} onChange={e => {
                          const newAtts = [...newQuestion.attachments];
                          newAtts[idx].name = e.target.value;
                          setNewQuestion({ ...newQuestion, attachments: newAtts });
                        }} placeholder="Label (e.g. data.csv)" className="w-full px-2 py-1 text-xs border rounded" />
                        <input value={att.url} onChange={e => {
                          const newAtts = [...newQuestion.attachments];
                          newAtts[idx].url = e.target.value;
                          setNewQuestion({ ...newQuestion, attachments: newAtts });
                        }} placeholder="External URL" className="w-full px-2 py-1 text-xs border rounded" />
                      </div>
                      <select value={att.type} onChange={e => {
                        const newAtts = [...newQuestion.attachments];
                        newAtts[idx].type = e.target.value;
                        setNewQuestion({ ...newQuestion, attachments: newAtts });
                      }} className="text-[10px] border rounded px-1 py-1">
                        <option value="IMAGE">Image</option>
                        <option value="CSV">CSV</option>
                        <option value="PDF">PDF</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <button onClick={() => {
                        const newAtts = newQuestion.attachments.filter((_: any, i: number) => i !== idx);
                        setNewQuestion({ ...newQuestion, attachments: newAtts });
                      }} className="p-1 text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button onClick={async () => {
                  if (!newQuestion.chapterId || !newQuestion.questionText) {
                    alert('Please fill out all fields.'); return;
                  }
                  await fetch('/api/admin/questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newQuestion),
                  });
                  setCreating(false);
                  setNewQuestion({ ...newQuestion, questionText: '' }); // reset
                  setPage(1); // refresh list
                }} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium">Create Question</button>
                <button onClick={() => setCreating(false)} className="px-4 py-2 border rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
