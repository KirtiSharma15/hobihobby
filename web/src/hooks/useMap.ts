import { useCallback, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import {
  setPlaces,
  setSelectedPlace,
  setUserLocation,
  setActiveFilter,
  setLoading,
  setError,
  type Place,
  type PlaceFilter,
  type UserLocation,
} from '../store/slices/mapSlice';

const LOCATION_DENIED_MESSAGE = 'Location access denied';

interface FindNearbyPlacesRequest {
  hobbyId: string;
  hobbyName: string;
  latitude: number;
  longitude: number;
  radius?: number;
  type?: PlaceFilter;
}

interface FindNearbyPlacesResponse {
  places: Place[];
}

export interface UseMapReturn {
  places: Place[];
  selectedPlace: Place | null;
  userLocation: UserLocation | null;
  activeFilter: PlaceFilter;
  isLoading: boolean;
  error: string | null;
  getUserLocation: () => Promise<UserLocation>;
  searchNearbyPlaces: (
    hobbyId: string,
    hobbyName: string,
    filter?: PlaceFilter
  ) => Promise<Place[]>;
  selectPlace: (place: Place) => void;
  clearSelectedPlace: () => void;
  setFilter: (filter: PlaceFilter) => void;
}

export const useMap = (): UseMapReturn => {
  const dispatch = useAppDispatch();
  const places = useAppSelector((state) => state.map.places);
  const selectedPlace = useAppSelector((state) => state.map.selectedPlace);
  const userLocation = useAppSelector((state) => state.map.userLocation);
  const activeFilter = useAppSelector((state) => state.map.activeFilter);
  const isLoading = useAppSelector((state) => state.map.isLoading);
  const error = useAppSelector((state) => state.map.error);

  // Remembers the last searched hobby so setFilter can re-run the same search.
  const lastSearchRef = useRef<{ hobbyId: string; hobbyName: string } | null>(null);

  const getUserLocation = useCallback((): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        dispatch(setError(LOCATION_DENIED_MESSAGE));
        reject(new Error(LOCATION_DENIED_MESSAGE));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          dispatch(setUserLocation(location));
          resolve(location);
        },
        () => {
          dispatch(setError(LOCATION_DENIED_MESSAGE));
          reject(new Error(LOCATION_DENIED_MESSAGE));
        }
      );
    });
  }, [dispatch]);

  const searchNearbyPlaces = useCallback(
    async (hobbyId: string, hobbyName: string, filter?: PlaceFilter): Promise<Place[]> => {
      lastSearchRef.current = { hobbyId, hobbyName };
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const location = userLocation ?? (await getUserLocation());

        const functions = getFunctions();
        const findNearbyPlacesFn = httpsCallable<
          FindNearbyPlacesRequest,
          FindNearbyPlacesResponse
        >(functions, 'findNearbyPlaces');

        const result = await findNearbyPlacesFn({
          hobbyId,
          hobbyName,
          latitude: location.latitude,
          longitude: location.longitude,
          type: filter ?? activeFilter,
        });

        const nearbyPlaces = result.data.places ?? [];
        dispatch(setPlaces(nearbyPlaces));
        return nearbyPlaces;
      } catch (err) {
        dispatch(setError('Failed to find nearby places. Please try again.'));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, userLocation, activeFilter, getUserLocation]
  );

  const selectPlace = useCallback(
    (place: Place) => {
      dispatch(setSelectedPlace(place));
    },
    [dispatch]
  );

  const clearSelectedPlace = useCallback(() => {
    dispatch(setSelectedPlace(null));
  }, [dispatch]);

  const setFilter = useCallback(
    (filter: PlaceFilter) => {
      dispatch(setActiveFilter(filter));

      const lastSearch = lastSearchRef.current;
      if (lastSearch) {
        void searchNearbyPlaces(lastSearch.hobbyId, lastSearch.hobbyName, filter);
      }
    },
    [dispatch, searchNearbyPlaces]
  );

  return {
    places,
    selectedPlace,
    userLocation,
    activeFilter,
    isLoading,
    error,
    getUserLocation,
    searchNearbyPlaces,
    selectPlace,
    clearSelectedPlace,
    setFilter,
  };
};
