import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  BookOpen, 
  Video, 
  Award, 
  CheckCircle2, 
  Trash2, 
  X, 
  Sparkles, 
  Layers
} from 'lucide-react';

interface CourseItem {
  id: string;
  title: string;
  category: 'Crypto Basics' | 'Futures Masterclass' | 'Technical Analysis' | 'Risk Management';
  type: 'Video' | 'Article' | 'Quiz' | 'Weekly Challenge';
  duration: string;
  status: 'Published' | 'Draft';
  students: number;
}

export const AdminAcademyTab: React.FC = () => {
  const [courses, setCourses] = useState<CourseItem[]>([
    { id: '1', title: 'Complete Futures Derivatives & Leverage Guide', category: 'Futures Masterclass', type: 'Video', duration: '25 mins', status: 'Published', students: 18400 },
    { id: '2', title: 'Order Book Depth & Liquidity Analysis', category: 'Technical Analysis', type: 'Article', duration: '12 mins', status: 'Published', students: 12100 },
    { id: '3', title: 'Risk-to-Reward Calculator & Position Sizing', category: 'Risk Management', type: 'Quiz', duration: '10 Qs', status: 'Published', students: 24500 },
    { id: '4', title: 'Weekly Trading Challenge: Spot DCA Strategy', category: 'Crypto Basics', type: 'Weekly Challenge', duration: '7 Days', status: 'Published', students: 9800 },
    { id: '5', title: 'Advanced Funding Rate Arbitrage Strategies', category: 'Futures Masterclass', type: 'Video', duration: '40 mins', status: 'Draft', students: 0 },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CourseItem['category']>('Crypto Basics');
  const [type, setType] = useState<CourseItem['type']>('Video');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleStatus = (id: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'Published' ? 'Draft' : 'Published';
        showToast(`Course status updated to ${nextStatus}.`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleDelete = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    showToast('Course removed from Academy catalog.');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newCourse: CourseItem = {
      id: Date.now().toString(),
      title,
      category,
      type,
      duration: '15 mins',
      status: 'Published',
      students: 0,
    };

    setCourses([newCourse, ...courses]);
    setIsAdding(false);
    setTitle('');
    showToast(`Published new course: "${title}"!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notice */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Control Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-accent" />
          <span>Academy Content Catalog ({courses.length} Items)</span>
        </h3>

        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course / Lesson</span>
        </button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((c) => (
          <div key={c.id} className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${
                c.category === 'Futures Masterclass' ? 'bg-amber-500/10 text-amber-500' :
                c.category === 'Technical Analysis' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {c.category}
              </span>

              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                c.status === 'Published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {c.status}
              </span>
            </div>

            <h4 className="text-xs font-black text-app leading-snug">{c.title}</h4>

            <div className="flex items-center justify-between text-[11px] text-app-sec pt-2 border-t border-app/60 font-medium">
              <span>Type: <strong className="text-app">{c.type}</strong> ({c.duration})</span>
              <span>Enrolled: <strong className="text-emerald-500">{c.students.toLocaleString()}</strong></span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-app/60">
              <button
                onClick={() => toggleStatus(c.id)}
                className="px-3 py-1.5 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app font-bold text-xs"
              >
                {c.status === 'Published' ? 'Unpublish' : 'Publish'}
              </button>

              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Course Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-app-card border border-app rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <h3 className="text-base font-extrabold text-app">Create Academy Content</h3>
              <button onClick={() => setIsAdding(false)} className="p-1.5 rounded-xl bg-app-sec text-app-sec">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-app-sec mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Spot DCA & Risk Management"
                  required
                  className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-app-sec mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app"
                  >
                    <option>Crypto Basics</option>
                    <option>Futures Masterclass</option>
                    <option>Technical Analysis</option>
                    <option>Risk Management</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-app-sec mb-1">Content Format</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-app-sec border border-app rounded-xl px-3.5 py-2.5 text-xs font-bold text-app"
                  >
                    <option>Video</option>
                    <option>Article</option>
                    <option>Quiz</option>
                    <option>Weekly Challenge</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-app flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2.5 rounded-xl bg-app-sec text-app-sec font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-extrabold shadow-md"
                >
                  Publish Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
