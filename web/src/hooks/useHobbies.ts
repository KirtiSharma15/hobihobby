import { useCallback } from 'react';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  type QueryConstraint,
} from 'firebase/firestore';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import { db } from '../services/firebase';
import {
  setCatalog,
  setCurrentHobby,
  setCatalogLoading,
  setCatalogError,
  type Hobby,
} from '../store/slices/hobbiesSlice';

export interface HobbyFilters {
  category?: string;
  difficulty?: string;
  indoorOutdoor?: string;
  soloGroup?: string;
  maxCostAED?: number;
}

export interface UseHobbiesReturn {
  hobbies: Hobby[];
  isLoading: boolean;
  error: string | null;
  fetchAllHobbies: (filters?: HobbyFilters) => Promise<Hobby[]>;
  fetchHobbyById: (hobbyId: string) => Promise<Hobby | null>;
  searchHobbies: (searchTerm: string) => Promise<Hobby[]>;
}

const mapHobbyDoc = (id: string, data: Record<string, unknown>): Hobby => ({
  id,
  name: String(data.name ?? ''),
  tagline: String(data.tagline ?? ''),
  category: String(data.category ?? ''),
  subcategory: String(data.subcategory ?? ''),
  difficulty: (data.difficulty as Hobby['difficulty']) ?? 'beginner',
  timePerWeek: String(data.timePerWeek ?? ''),
  timeMinutes: Number(data.timeMinutes ?? 0),
  estimatedCostAED: Number(data.estimatedCostAED ?? 0),
  costRange: (data.costRange as Hobby['costRange']) ?? 'low',
  indoorOutdoor: (data.indoorOutdoor as Hobby['indoorOutdoor']) ?? 'indoor',
  soloGroup: (data.soloGroup as Hobby['soloGroup']) ?? 'solo',
  emoji: String(data.emoji ?? ''),
  tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
  description: String(data.description ?? ''),
  starterKit: Array.isArray(data.starterKit) ? (data.starterKit as string[]) : [],
  popularIn: Array.isArray(data.popularIn) ? (data.popularIn as string[]) : [],
  hasLearningPath: Boolean(data.hasLearningPath),
  hasJourneyTemplate: Boolean(data.hasJourneyTemplate),
  imageUrl: String(data.imageUrl ?? ''),
  matchTags: Array.isArray(data.matchTags) ? (data.matchTags as string[]) : [],
});

const buildHobbyQuery = (filters?: HobbyFilters) => {
  const constraints: QueryConstraint[] = [];

  if (filters?.category) {
    constraints.push(where('category', '==', filters.category));
  }
  if (filters?.difficulty) {
    constraints.push(where('difficulty', '==', filters.difficulty));
  }
  if (filters?.indoorOutdoor) {
    constraints.push(where('indoorOutdoor', '==', filters.indoorOutdoor));
  }
  if (filters?.soloGroup) {
    constraints.push(where('soloGroup', '==', filters.soloGroup));
  }

  // Inequality must be paired with orderBy on the same field.
  if (typeof filters?.maxCostAED === 'number') {
    constraints.push(where('estimatedCostAED', '<=', filters.maxCostAED));
    constraints.push(orderBy('estimatedCostAED'));
  } else {
    constraints.push(orderBy('name'));
  }

  return query(collection(db, 'hobbies'), ...constraints);
};

export const useHobbies = (): UseHobbiesReturn => {
  const dispatch = useAppDispatch();
  const hobbies = useAppSelector((state) => state.hobbies.catalog);
  const isLoading = useAppSelector((state) => state.hobbies.catalogLoading);
  const error = useAppSelector((state) => state.hobbies.catalogError);

  const fetchAllHobbies = useCallback(
    async (filters?: HobbyFilters): Promise<Hobby[]> => {
      dispatch(setCatalogLoading(true));
      dispatch(setCatalogError(null));

      try {
        const snapshot = await getDocs(buildHobbyQuery(filters));
        const results = snapshot.docs.map((docSnap) =>
          mapHobbyDoc(docSnap.id, docSnap.data() as Record<string, unknown>)
        );

        dispatch(setCatalog(results));
        return results;
      } catch (err) {
        dispatch(setCatalogError('Failed to load hobbies. Please try again.'));
        throw err;
      } finally {
        dispatch(setCatalogLoading(false));
      }
    },
    [dispatch]
  );

  const fetchHobbyById = useCallback(
    async (hobbyId: string): Promise<Hobby | null> => {
      dispatch(setCatalogLoading(true));
      dispatch(setCatalogError(null));

      try {
        const snap = await getDoc(doc(db, 'hobbies', hobbyId));
        if (!snap.exists()) {
          dispatch(setCurrentHobby(null));
          return null;
        }

        const hobby = mapHobbyDoc(snap.id, snap.data() as Record<string, unknown>);
        dispatch(setCurrentHobby(hobby));
        return hobby;
      } catch (err) {
        dispatch(setCatalogError('Failed to load hobby. Please try again.'));
        throw err;
      } finally {
        dispatch(setCatalogLoading(false));
      }
    },
    [dispatch]
  );

  const searchHobbies = useCallback(
    async (searchTerm: string): Promise<Hobby[]> => {
      const normalized = searchTerm.trim().toLowerCase();
      if (!normalized) {
        return hobbies;
      }

      // Prefer cached catalog; fetch once if Redux is empty.
      let source = hobbies;
      if (source.length === 0) {
        source = await fetchAllHobbies();
      }

      return source.filter((hobby) => {
        const nameMatch = hobby.name.toLowerCase().includes(normalized);
        const tagMatch = hobby.tags.some((tag) =>
          tag.toLowerCase().includes(normalized)
        );
        return nameMatch || tagMatch;
      });
    },
    [hobbies, fetchAllHobbies]
  );

  return {
    hobbies,
    isLoading,
    error,
    fetchAllHobbies,
    fetchHobbyById,
    searchHobbies,
  };
};
