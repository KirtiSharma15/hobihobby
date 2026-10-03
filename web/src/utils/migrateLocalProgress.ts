/**
 * One-time migration: push localStorage learning progress into Firestore
 * via updateLearningProgress, then mark done so it never runs twice.
 *
 * Legacy storage (`hobihobby_learning_progress` from useLocalProgress):
 * { [hobbyId]: { completedLessons: string[], currentLessonId: string | null, ... } }
 *
 * Completed lessons are written with setAsCurrent false so a null current
 * lesson stays null. The saved current lesson, when present, is written last.
 */
const MIGRATION_FLAG = 'hobihobby_progress_migrated_v2';

function uniqueLessonIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids: string[] = [];
  for (const id of value) {
    if (typeof id === 'string' && id.length > 0 && !ids.includes(id)) {
      ids.push(id);
    }
  }
  return ids;
}

export async function migrateLocalProgressIfNeeded(
  markLessonProgress: (
    hobbyId: string,
    lessonId: string,
    completed: boolean,
    setAsCurrent?: boolean
  ) => Promise<unknown>
): Promise<void> {
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  const { getAllProgress } = await import('../hooks/useLocalProgress');
  const allProgress = getAllProgress();

  let migrationFailed = false;

  for (const [hobbyId, progress] of Object.entries(allProgress)) {
    if (!hobbyId || !progress || typeof progress !== 'object') {
      continue;
    }

    const completedLessons = uniqueLessonIds(progress.completedLessons);
    const currentLessonId =
      typeof progress.currentLessonId === 'string' && progress.currentLessonId.length > 0
        ? progress.currentLessonId
        : null;

    for (const lessonId of completedLessons) {
      try {
        await markLessonProgress(hobbyId, lessonId, true, false);
      } catch (err) {
        console.error(`Migration failed for ${hobbyId} lesson ${lessonId}:`, err);
        migrationFailed = true;
      }
    }

    if (currentLessonId) {
      try {
        await markLessonProgress(
          hobbyId,
          currentLessonId,
          completedLessons.includes(currentLessonId),
          true
        );
      } catch (err) {
        console.error(`Migration failed for ${hobbyId} current lesson:`, err);
        migrationFailed = true;
      }
    }
  }

  if (!migrationFailed) {
    localStorage.setItem(MIGRATION_FLAG, 'true');
  }
}
