import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  X,
  RefreshCw,
  Users
} from 'lucide-react';
import { ACADEMY_LESSONS } from '../../../data/academyData';
import { adminApi } from '../../../api/admin';

interface LessonRow {
  id: string;
  title: string;
  category: string;
  type: string;
  duration: string;
  status: 'Published' | 'Draft';
  completions: number;
}

export const AdminAcademyTab: React.FC = () => {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getAcademyOverview();
      if (res.success && res.data) {
        const completionsById = new Map(res.data.completions.map((c) => [c.lesson_id, c.completions]));
        const statusById = new Map(res.data.statuses.map((s) => [s.lesson_id, s.status]));

        setLessons(
          ACADEMY_LESSONS.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            category: lesson.path,
            type: lesson.mediaType,
            duration: lesson.estimatedDuration,
            status: (statusById.get(lesson.id) as 'Published' | 'Draft') || 'Published',
            completions: completionsById.get(lesson.id) || 0
          }))
        );
        setTotalEnrolled(res.data.totalEnrolled);
      }
    } catch (error) {
      console.error('Failed to load academy overview:', error);
      showToast('Error loading academy data from the database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const toggleStatus = async (lesson: LessonRow) => {
    const nextStatus = lesson.status === 'Published' ? 'Draft' : 'Published';
    setPendingId(lesson.id);
    try {
      await adminApi.setLessonStatus(lesson.id, nextStatus);
      setLessons((prev) => prev.map((l) => (l.id === lesson.id ? { ...l, status: nextStatus } : l)));
      showToast(`"${lesson.title}" set to ${nextStatus}.`);
    } catch (error) {
      showToast('Failed to update lesson status.');
    } finally {
      setPendingId(null);
    }
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
        <div>
          <h3 className="text-sm font-extrabold text-app flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-accent" />
            <span>Academy Content Catalog ({lessons.length} Lessons)</span>
          </h3>
          <p className="text-[11px] text-app-sec mt-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {totalEnrolled} user{totalEnrolled === 1 ? '' : 's'} have engaged with the Academy
          </p>
        </div>

        <button onClick={fetchOverview} className="p-2 rounded-xl bg-app-sec border border-app text-app-sec hover:text-app transition-colors self-start sm:self-auto" title="Refresh">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <p className="text-[11px] text-app-sec -mt-3">
        Lesson content is authored in the codebase; this panel controls publish status and shows real completion counts from user progress data.
      </p>

      {/* Course Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-app-sec text-xs font-bold flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-accent" />
          Loading academy catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map((c) => (
            <div key={c.id} className="p-4 sm:p-5 rounded-3xl bg-app-card border border-app shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${
                  c.category === 'Advanced' ? 'bg-amber-500/10 text-amber-500' :
                  c.category === 'Intermediate' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
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
                <span>Type: <strong className="text-app capitalize">{c.type}</strong> ({c.duration})</span>
                <span>Completed by: <strong className="text-emerald-500">{c.completions.toLocaleString()}</strong></span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-app/60">
                <button
                  onClick={() => toggleStatus(c)}
                  disabled={pendingId === c.id}
                  className="px-3 py-1.5 rounded-xl bg-app-sec hover:bg-app-sec/80 text-app font-bold text-xs disabled:opacity-60"
                >
                  {c.status === 'Published' ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
