/// <reference types="google.maps" />
import { useEffect, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

const CHURCH_MAPS_LINK = 'https://maps.app.goo.gl/XPyGGt6tGwd9CtAQ6';
const CHURCH_NAME = 'New Life Fundamental Baptist Church';
const CHURCH_COORDINATES: google.maps.LatLngLiteral = {
  lat: 11.3679577,
  lng: 124.4872508,
};

interface ResolvedPlaceDetails {
  formattedAddress: string | null;
  location: google.maps.LatLngLiteral;
  googleMapsUri: string;
}

interface EmbeddedChurchMapProps {
  placeDetails: ResolvedPlaceDetails;
  onPlaceResolved: (details: ResolvedPlaceDetails) => void;
}

function EmbeddedChurchMap({ placeDetails, onPlaceResolved }: EmbeddedChurchMapProps) {
  const placesLib = useMapsLibrary('places');
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  useEffect(() => {
    if (!placesLib?.Place) return;
    let cancelled = false;

    async function lookupChurchDetails() {
      try {
        const { places } = await placesLib!.Place.searchByText({
          textQuery: CHURCH_NAME,
          locationBias: CHURCH_COORDINATES,
          fields: ['displayName', 'formattedAddress', 'location', 'googleMapsURI'],
          maxResultCount: 1,
        });

        if (cancelled || !places || places.length === 0) return;

        const matched = places[0];
        const lat = matched.location?.lat();
        const lng = matched.location?.lng();

        onPlaceResolved({
          formattedAddress: matched.formattedAddress ?? null,
          location:
            typeof lat === 'number' && typeof lng === 'number'
              ? { lat, lng }
              : CHURCH_COORDINATES,
          googleMapsUri: matched.googleMapsURI || CHURCH_MAPS_LINK,
        });
      } catch (err: unknown) {
        const errText = err instanceof Error ? err.message : String(err);
        if (
          errText.includes('RESOURCE_EXHAUSTED') ||
          errText.includes('OVER_QUERY_LIMIT') ||
          errText.includes('429')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    }

    void lookupChurchDetails();

    return () => {
      cancelled = true;
    };
  }, [placesLib, onPlaceResolved]);

  return (
    <GoogleMap
      mapId="DEMO_MAP_ID"
      defaultCenter={CHURCH_COORDINATES}
      center={placeDetails.location}
      defaultZoom={17}
      gestureHandling="cooperative"
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      className="h-full w-full"
    >
      <AdvancedMarker
        ref={markerRef}
        position={placeDetails.location}
        title={CHURCH_NAME}
        onClick={() => setInfoOpen(true)}
      >
        <Pin background="#1E3A8A" borderColor="#0F172A" glyphColor="#FBF9F5" />
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={260}
          onCloseClick={() => setInfoOpen(false)}
        >
          <div className="p-1 text-xs text-[#1E293B]">
            <p className="font-semibold text-[#1E293B]">{CHURCH_NAME}</p>
            <p className="mt-0.5 text-[#57534E]">School of Ministry</p>
            {placeDetails.formattedAddress && (
              <p className="mt-1.5 text-[11px] leading-snug text-[#57534E]">
                {placeDetails.formattedAddress}
              </p>
            )}
            <a
              href={placeDetails.googleMapsUri}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-medium text-[#1E3A8A] underline"
            >
              View on Google Maps
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export function VisitUsSection() {
  const [mapsApiKey, setMapsApiKey] = useState<string>(
    () => (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || ''
  );
  const [keyChecked, setKeyChecked] = useState<boolean>(() =>
    Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
  );
  const [placeDetails, setPlaceDetails] = useState<ResolvedPlaceDetails>({
    formattedAddress: null,
    location: CHURCH_COORDINATES,
    googleMapsUri: CHURCH_MAPS_LINK,
  });

  useEffect(() => {
    if (mapsApiKey) return;
    let active = true;

    async function loadMapsConfig() {
      try {
        const res = await fetch('/api/config/maps');
        if (!res.ok) return;
        const data = (await res.json()) as { apiKey?: string };
        if (active && data.apiKey) {
          setMapsApiKey(data.apiKey);
        }
      } catch {
        // Ignore network errors when checking runtime config
      } finally {
        if (active) setKeyChecked(true);
      }
    }

    void loadMapsConfig();
    return () => {
      active = false;
    };
  }, [mapsApiKey]);

  return (
    <section
      aria-labelledby="visit-us-heading"
      className="border-t border-[#E5DFD3] bg-[#F5F1E8]/35"
    >
      <div className="mx-auto grid max-w-[1200px] gap-8 px-6 py-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/4a52c352-b439-44b9-9ab2-e11bf7c67dfe_57428442.jpg"
              alt="New Life Fundamental Baptist Church - School of Ministry logo"
              referrerPolicy="no-referrer"
              className="h-14 w-14 shrink-0 rounded-full border border-[#E5DFD3] bg-white object-contain p-1 shadow-xs"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#57534E]">
                Contact or Visit Us
              </p>
              <h2
                id="visit-us-heading"
                className="mt-1 font-serif text-2xl font-semibold tracking-tight text-[#1E293B]"
              >
                {CHURCH_NAME}
              </h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-[#57534E]">
            Students, prospective enrollees, and visitors are welcome to join us at {CHURCH_NAME} &ndash; School of Ministry.
          </p>

          <div className="mt-5 rounded-xl border border-[#E5DFD3] bg-[#FBF9F5] p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5DFD3] bg-[#F5F1E8] text-[#1E3A8A]">
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
                  Address
                </p>
                <p className="mt-1 font-serif text-base font-semibold text-[#1E293B]">
                  {CHURCH_NAME}
                </p>
                <p className="mt-0.5 text-xs text-[#57534E]">
                  School of Ministry
                </p>
                {placeDetails.formattedAddress && (
                  <p className="mt-2 text-xs leading-relaxed text-[#1E293B]">
                    {placeDetails.formattedAddress}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="h-[340px] w-full overflow-hidden rounded-xl border border-[#E5DFD3] bg-[#FBF9F5] shadow-xs">
            {mapsApiKey ? (
              <APIProvider apiKey={mapsApiKey}>
                <EmbeddedChurchMap
                  placeDetails={placeDetails}
                  onPlaceResolved={setPlaceDetails}
                />
              </APIProvider>
            ) : keyChecked ? (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-sm text-[#57534E]">
                <MapPin className="mb-2 h-6 w-6 text-[#1E3A8A]" aria-hidden="true" />
                <p className="font-medium text-[#1E293B]">{CHURCH_NAME}</p>
                <p className="mt-1 text-xs">
                  Google Maps API key is required to display the interactive map.
                </p>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-[#57534E]">
                Loading map&hellip;
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
