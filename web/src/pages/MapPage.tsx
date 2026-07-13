/**
 * Map Page - Artisan Theme (Sprint 4, Local Discovery)
 *
 * Finds nearby classes, workshops, stores and events for a hobby via the
 * `findNearbyPlaces` Cloud Function (see `useMap`). Mobile stacks a 55/45
 * map-over-results split with a floating header on the map; desktop renders
 * a 60/40 map + scrollable results layout inside the standard app shell.
 */

import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { ChevronLeft, MapPin, Phone, Globe, Star, X, Loader2 } from 'lucide-react';
import { useMap } from '@/hooks/useMap';
import { useAppSelector } from '@/hooks/useAppDispatch';
import { cn } from '@/utils/cn';
import type { Place, PlaceFilter } from '@/store/slices/mapSlice';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

// UAE launch market for Sprint 4 (see ROADMAP.md). Reverse geocoding the
// user's coordinates into a city/neighborhood name is out of scope this sprint.
const LOCATION_LABEL = 'Abu Dhabi, UAE';
const DEFAULT_CENTER = { lat: 24.4539, lng: 54.3773 };

const MAP_CONTAINER_STYLE: React.CSSProperties = { width: '100%', height: '100%' };

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'water', stylers: [{ color: '#C8D8E8' }] },
  { featureType: 'landscape', stylers: [{ color: '#F5F0E8' }] },
  { featureType: 'road', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

const MAP_OPTIONS: google.maps.MapOptions = {
  styles: MAP_STYLES,
  clickableIcons: false,
  streetViewControl: false,
  fullscreenControl: false,
};

const FILTERS: { value: PlaceFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'classes', label: 'Classes' },
  { value: 'stores', label: 'Stores' },
  { value: 'events', label: 'Events' },
];

const buildMarkerIcon = (selected: boolean): google.maps.Icon => {
  const size = selected ? 56 : 32;
  const svg = selected
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
        <defs><filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#2C1810" flood-opacity="0.35"/>
        </filter></defs>
        <circle cx="28" cy="28" r="20" fill="#C4522A" stroke="#FFFCF7" stroke-width="4" filter="url(#pin-shadow)"/>
        <circle cx="28" cy="28" r="7" fill="#FFFCF7"/>
      </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="12" fill="#C4522A" stroke="#FFFCF7" stroke-width="2.5"/>
        <circle cx="16" cy="16" r="4" fill="#FFFCF7"/>
      </svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
  };
};

const buildDirectionsUrl = (place: Place): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

const buildPlacePhotoUrl = (photoReference: string): string =>
  `https://maps.googleapis.com/maps/api/place/photo?maxwidth=160&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;

const getNeighborhood = (address: string): string => {
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts[1] : '';
};

const getPlaceTypeLabel = (place: Place, filter: PlaceFilter): string => {
  if (filter === 'classes') return 'Classes';
  if (filter === 'stores') return 'Store';
  if (filter === 'events') return 'Event';
  if (place.types.some((t) => /store|shop/i.test(t))) return 'Store';
  if (place.types.some((t) => /school|point_of_interest|establishment/i.test(t))) return 'Classes';
  return 'Nearby';
};

const humanizeHobbyId = (id: string): string =>
  id
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const FilterChips: React.FC<{ active: PlaceFilter; onChange: (filter: PlaceFilter) => void }> = ({
  active,
  onChange,
}) => (
  <div className="flex gap-2 overflow-x-auto pb-1">
    {FILTERS.map((filter) => (
      <button
        key={filter.value}
        type="button"
        onClick={() => onChange(filter.value)}
        className={cn(
          'shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
          active === filter.value
            ? 'bg-terracotta text-white'
            : 'border border-border bg-white text-taupe hover:border-terracotta/40'
        )}
      >
        {filter.label}
      </button>
    ))}
  </div>
);

const PlaceCardSkeleton: React.FC = () => (
  <div className="mb-3 flex animate-pulse gap-3 rounded-2xl bg-surface p-4 shadow-sm">
    <div className="h-14 w-14 shrink-0 rounded-xl bg-border" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-3.5 w-3/4 rounded bg-border" />
      <div className="h-3 w-1/2 rounded bg-border" />
      <div className="h-3 w-2/3 rounded bg-border" />
    </div>
  </div>
);

interface PlaceCardProps {
  place: Place;
  activeFilter: PlaceFilter;
  onSelect: (place: Place) => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, activeFilter, onSelect }) => (
  <div className="mb-3 rounded-2xl bg-surface p-4 shadow-sm">
    <div className="flex gap-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-terracotta/10 text-terracotta">
        {place.photoReference ? (
          <img
            src={buildPlacePhotoUrl(place.photoReference)}
            alt={place.name}
            className="h-14 w-14 object-cover"
          />
        ) : (
          <MapPin className="h-6 w-6" />
        )}
      </div>

      <button type="button" onClick={() => onSelect(place)} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-semibold text-ink">{place.name}</p>
        <p className="mt-0.5 truncate text-xs text-taupe">
          {place.distance.toFixed(1)} km{getNeighborhood(place.address) && ` · ${getNeighborhood(place.address)}`}
        </p>
        {place.rating > 0 && (
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            {place.rating.toFixed(1)} ({place.totalRatings} reviews)
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-medium',
              place.isOpen ? 'bg-olive/10 text-olive' : 'bg-border text-taupe'
            )}
          >
            {place.isOpen ? 'Open now' : 'Closed'}
          </span>
          <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-medium text-taupe">
            {getPlaceTypeLabel(place, activeFilter)}
          </span>
        </div>
      </button>
    </div>

    <div className="mt-3 flex justify-end">
      <a
        href={buildDirectionsUrl(place)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-semibold text-terracotta hover:underline"
      >
        Directions
      </a>
    </div>
  </div>
);

interface ResultsListProps {
  places: Place[];
  isLoading: boolean;
  activeFilter: PlaceFilter;
  onSelect: (place: Place) => void;
}

const ResultsList: React.FC<ResultsListProps> = ({ places, isLoading, activeFilter, onSelect }) => {
  if (isLoading) {
    return (
      <div>
        <PlaceCardSkeleton />
        <PlaceCardSkeleton />
        <PlaceCardSkeleton />
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MapPin className="h-8 w-8 text-taupe/50" />
        <p className="mt-3 text-sm font-semibold text-ink">No spots found nearby</p>
        <p className="mt-1 text-xs text-taupe">Try a different filter</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ink">{places.length} spots near you</p>
      {places.map((place) => (
        <PlaceCard key={place.placeId} place={place} activeFilter={activeFilter} onSelect={onSelect} />
      ))}
    </div>
  );
};

interface SelectedPlaceDetailProps {
  place: Place;
  onClose: () => void;
}

const SelectedPlaceDetail: React.FC<SelectedPlaceDetailProps> = ({ place, onClose }) => (
  <div className="rounded-t-2xl bg-surface p-5 shadow-sm md:rounded-2xl">
    <div className="flex items-start justify-between gap-3">
      <h2 className="text-xl font-bold text-ink">{place.name}</h2>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-taupe transition-colors hover:text-ink"
      >
        <X className="h-4 w-4" />
      </button>
    </div>

    <p className="mt-1 text-sm text-taupe">{place.address}</p>

    <div className="mt-3 flex flex-wrap items-center gap-2">
      {place.rating > 0 && (
        <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
          {place.rating.toFixed(1)} ({place.totalRatings} reviews)
        </span>
      )}
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[11px] font-medium',
          place.isOpen ? 'bg-olive/10 text-olive' : 'bg-border text-taupe'
        )}
      >
        {place.isOpen ? 'Open now' : 'Closed'}
      </span>
    </div>

    <div className="mt-4 space-y-2 text-sm">
      {place.phone && (
        <a
          href={`tel:${place.phone}`}
          className="flex items-center gap-2 text-ink transition-colors hover:text-terracotta"
        >
          <Phone className="h-4 w-4 shrink-0 text-taupe" /> {place.phone}
        </a>
      )}
      {place.website && (
        <a
          href={place.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-ink transition-colors hover:text-terracotta"
        >
          <Globe className="h-4 w-4 shrink-0 text-taupe" />
          <span className="truncate">{place.website}</span>
        </a>
      )}
    </div>

    <a
      href={buildDirectionsUrl(place)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-5 flex w-full items-center justify-center rounded-2xl bg-terracotta py-3 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
    >
      Get Directions
    </a>
    <button
      type="button"
      onClick={onClose}
      className="mt-2 w-full rounded-2xl border-2 border-terracotta py-3 text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta/5"
    >
      Close
    </button>
  </div>
);

export const MapPage: React.FC = () => {
  const { hobbyId: paramHobbyId } = useParams<{ hobbyId?: string }>();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const navState = routerLocation.state as { hobbyName?: string } | null;

  const activeJourneys = useAppSelector((state) => state.journey.activeJourneys);
  const savedHobbyIds = useAppSelector((state) => state.hobbies.savedHobbyIds);

  const {
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
  } = useMap();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'hobihobby-google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const resolvedHobbyId = useMemo(() => {
    if (paramHobbyId) return paramHobbyId;
    const activeIds = Object.keys(activeJourneys);
    if (activeIds.length > 0) return activeIds[0];
    return savedHobbyIds[0];
  }, [paramHobbyId, activeJourneys, savedHobbyIds]);

  const hobbyName = useMemo(() => {
    if (!resolvedHobbyId) return null;
    return (
      navState?.hobbyName ?? activeJourneys[resolvedHobbyId]?.hobbyName ?? humanizeHobbyId(resolvedHobbyId)
    );
  }, [resolvedHobbyId, navState, activeJourneys]);

  const mapCenter = useMemo(
    () => (userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : DEFAULT_CENTER),
    [userLocation]
  );

  useEffect(() => {
    if (!resolvedHobbyId || !hobbyName) return;

    let cancelled = false;
    const initialize = async () => {
      try {
        await getUserLocation();
      } catch {
        // Error already surfaced via the hook's shared `error` state — fall back to the
        // default map center and still attempt the search below.
      }
      if (cancelled) return;
      try {
        await searchNearbyPlaces(resolvedHobbyId, hobbyName);
      } catch {
        // Error surfaced via the hook's shared `error` state.
      }
    };

    void initialize();
    return () => {
      cancelled = true;
    };
    // Only re-run when the resolved hobby context changes; filter changes are
    // handled by setFilter itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedHobbyId, hobbyName]);

  const handleBack = () => {
    navigate(resolvedHobbyId ? `/hobby/${resolvedHobbyId}` : '/explore');
  };

  if (!resolvedHobbyId || !hobbyName) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-4 text-center font-jakarta">
        <MapPin className="h-10 w-10 text-taupe/50" />
        <p className="mt-4 text-lg font-semibold text-ink">Pick a hobby to find nearby spots</p>
        <p className="mt-1 text-sm text-taupe">Save or start a hobby, then come back to explore the map.</p>
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="mt-6 rounded-2xl bg-terracotta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
        >
          Explore hobbies
        </button>
      </div>
    );
  }

  return (
    <div className="bg-cream font-jakarta md:min-h-screen">
      <div className="flex flex-col md:mx-auto md:max-w-6xl md:flex-row md:gap-6 md:px-8 md:py-6">
        {/* Map */}
        <div className="relative h-[55vh] w-full shrink-0 md:h-[calc(100vh-8rem)] md:w-[60%] md:overflow-hidden md:rounded-2xl md:shadow-sm">
          {loadError ? (
            <div className="flex h-full items-center justify-center bg-border/30 p-4 text-center text-sm text-taupe">
              Failed to load Google Maps.
            </div>
          ) : isLoaded ? (
            <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} center={mapCenter} zoom={13} options={MAP_OPTIONS}>
              {places.map((place) => (
                <Marker
                  key={place.placeId}
                  position={{ lat: place.latitude, lng: place.longitude }}
                  icon={buildMarkerIcon(selectedPlace?.placeId === place.placeId)}
                  onClick={() => selectPlace(place)}
                />
              ))}
            </GoogleMap>
          ) : (
            <div className="flex h-full items-center justify-center bg-border/30">
              <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
            </div>
          )}

          {/* Overlaid header - mobile only */}
          <div className="absolute inset-x-0 top-0 z-10 rounded-b-2xl bg-white/85 px-4 py-3 shadow-sm backdrop-blur-sm md:hidden">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
              >
                <ChevronLeft className="h-5 w-5 text-ink" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">Near you</p>
                <p className="truncate text-xs text-taupe">{LOCATION_LABEL}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results / detail */}
        <div className="flex flex-1 flex-col md:w-[40%]">
          <div className="border-b border-border bg-surface px-4 py-3 md:border-0 md:bg-transparent md:px-0 md:pb-4">
            <FilterChips active={activeFilter} onChange={setFilter} />
          </div>

          {error && (
            <div className="mx-4 mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600 md:mx-0">{error}</div>
          )}

          {/* Desktop: results list swaps for the selected place detail inline */}
          <div className="hidden flex-1 overflow-y-auto py-4 md:block">
            {selectedPlace ? (
              <SelectedPlaceDetail place={selectedPlace} onClose={clearSelectedPlace} />
            ) : (
              <ResultsList
                places={places}
                isLoading={isLoading}
                activeFilter={activeFilter}
                onSelect={selectPlace}
              />
            )}
          </div>

          {/* Mobile: results list always visible in the bottom sheet */}
          <div className="h-[45vh] flex-1 overflow-y-auto bg-cream px-4 py-4 md:hidden">
            <ResultsList
              places={places}
              isLoading={isLoading}
              activeFilter={activeFilter}
              onSelect={selectPlace}
            />
          </div>
        </div>

        {/* Mobile: selected place slides up over everything */}
        {selectedPlace && (
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] animate-slideUp overflow-y-auto md:hidden">
            <SelectedPlaceDetail place={selectedPlace} onClose={clearSelectedPlace} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
