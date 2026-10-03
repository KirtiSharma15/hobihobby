/**
 * One-time migration: push localStorage learning progress into Firestore
 * via updateLearningProgress, then mark done so it never runs twice.
 */
export async function migrateLocalProgressIfNeeded(
  markLessonProgress: (
    hobbyId: string,
    lessonId: string,
    completed: boolean
  ) => Promise<unknown>
): Promise<void> {
  const MIGRATION_FLAG = 'hobihobby_progress_migrated_v1';
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  const { getAllProgress } = await import('../hooks/useLocalProgress');
  const allProgress = getAllProgress();

  for (const [hobbyId, progress] of Object.entries(allProgress)) {
    if (progress.currentLessonId) {
      try {
        await markLessonProgress(hobbyId, progress.currentLessonId, false);
      } catch (err) {
        console.error(`Migration failed for ${hobbyId}:`, err);
      }
    }
  }

  localStorage.setItem(MIGRATION_FLAG, 'true');
}
