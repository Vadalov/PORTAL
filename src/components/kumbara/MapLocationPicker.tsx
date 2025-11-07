'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Trash2, Route, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface MapLocationPickerProps {
  onLocationSelect?: (location: MapLocation) => void;
  onRouteUpdate?: (route: MapLocation[]) => void;
  initialLocation?: MapLocation;
  height?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export function MapLocationPicker({
  onLocationSelect,
  onRouteUpdate,
  initialLocation,
  height = '400px',
  className,
}: MapLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routePoints, setRoutePoints] = useState<MapLocation[]>([]);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(initialLocation || null);
  const [addressInput, setAddressInput] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window === 'undefined') return;

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        setIsMapLoaded(true);
        return;
      }

      // Check if script is being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkInterval);
            setIsMapLoaded(true);
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Google Maps');
        toast.error('Harita yüklenemedi. Lütfen API anahtarınızı kontrol edin.');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize Google Map when loaded
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    try {
      // Default center (Istanbul, Turkey)
      const defaultCenter = { lat: 41.0082, lng: 28.9784 };

      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: currentLocation || defaultCenter,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      const directionsSvc = new window.google.maps.DirectionsService();
      const directionsRnd = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      });

      directionsRnd.setMap(googleMap);
      setDirectionsService(directionsSvc);
      setDirectionsRenderer(directionsRnd);
      setMap(googleMap);
      setIsLoading(false);

      // Add click listener for adding route points
      googleMap.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        const newPoint: MapLocation = { lat, lng };

        // Reverse geocoding to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat, lng } },
          (results: any, status: string) => {
            if (status === 'OK' && results && results[0]) {
              newPoint.address = results[0].formatted_address;
            }

            addRoutePoint(newPoint);
          }
        );
      });

      // If initial location is set, add marker
      if (initialLocation) {
        new window.google.maps.Marker({
          position: initialLocation,
          map: googleMap,
          title: 'Kumbara Konumu',
        });
      }
    } catch (_error) {
      console.error('Error initializing map:', _error);
      toast.error('Harita başlatılırken hata oluştu');
      setIsLoading(false);
    }
  }, [isMapLoaded, initialLocation]);

  // Add a point to the route
  const addRoutePoint = useCallback((point: MapLocation) => {
    setRoutePoints((prev) => {
      const newPoints = [...prev, point];
      calculateAndDisplayRoute(newPoints);
      return newPoints;
    });

    if (onLocationSelect) {
      onLocationSelect(point);
    }

    toast.success(`${routePoints.length + 1}. nokta rotaya eklendi`);
  }, [onLocationSelect, routePoints.length]);

  // Calculate and display route between points
  const calculateAndDisplayRoute = useCallback((points: MapLocation[]) => {
    if (!directionsService || !directionsRenderer || points.length < 2) return;

    if (points.length === 2) {
      // Simple route between two points
      directionsService.route(
        {
          origin: points[0],
          destination: points[1],
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: string) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
            if (onRouteUpdate) {
              onRouteUpdate(points);
            }
          }
        }
      );
    } else {
      // Route with multiple waypoints
      const waypoints = points.slice(1, -1).map((point) => ({
        location: point,
        stopover: true,
      }));

      directionsService.route(
        {
          origin: points[0],
          destination: points[points.length - 1],
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
        },
        (result: any, status: string) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
            if (onRouteUpdate) {
              onRouteUpdate(points);
            }
          }
        }
      );
    }
  }, [directionsService, directionsRenderer, onRouteUpdate]);

  // Clear all route points
  const clearRoute = useCallback(() => {
    setRoutePoints([]);
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] } as any);
    }
    toast.success('Rota temizlendi');
  }, [directionsRenderer]);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          map.setCenter(pos);
          map.setZoom(15);

          setCurrentLocation(pos);
          if (onLocationSelect) {
            onLocationSelect(pos);
          }

          toast.success('Mevcut konum alındı');
        },
        (error) => {
          console.error('Error getting current location:', error);
          toast.error('Konum alınamadı');
        }
      );
    } else {
      toast.error('Tarayıcınız konum desteklemiyor');
    }
  }, [map, onLocationSelect]);

  // Search address
  const searchAddress = useCallback(async () => {
    if (!map || !addressInput.trim()) return;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: addressInput }, (results: any, status: string) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const pos = {
          lat: location.lat(),
          lng: location.lng(),
        };

        map.setCenter(pos);
        map.setZoom(15);

        // Add marker for searched location
        new window.google.maps.Marker({
          position: pos,
          map,
          title: results[0].formatted_address,
        });

        setCurrentLocation(pos);
        if (onLocationSelect) {
          onLocationSelect({ ...pos, address: results[0].formatted_address });
        }

        toast.success('Konum bulundu');
      } else {
        toast.error('Adres bulunamadı');
      }
    });
  }, [map, addressInput, onLocationSelect]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Harita yükleniyor...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Google Maps API anahtarınızı .env.local dosyasında NEXT_PUBLIC_GOOGLE_MAPS_API_KEY olarak ayarlayın
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Kumbara Konumu ve Rota
        </CardTitle>
        <CardDescription>
          Haritaya tıklayarak rota noktaları ekleyin. İlk nokta başlangıç, son nokta varış noktası olacaktır.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Address */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="address-search">Adres Ara</Label>
            <Input
              id="address-search"
              placeholder="Örn: İstanbul, Türkiye"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  searchAddress();
                }
              }}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={searchAddress} type="button">
              Ara
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div
          ref={mapRef}
          style={{ height }}
          className="w-full rounded-lg border"
        />

        {/* Route Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button onClick={getCurrentLocation} variant="outline" size="sm">
              <Navigation className="h-4 w-4 mr-2" />
              Mevcut Konum
            </Button>
            <Button onClick={clearRoute} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Rotayı Temizle
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Route className="h-4 w-4" />
              {routePoints.length} rota noktası
            </span>
          </div>
        </div>

        {/* Route Points List */}
        {routePoints.length > 0 && (
          <div className="space-y-2">
            <Label>Rota Noktaları</Label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {routePoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      Nokta {index + 1}
                      {index === 0 && ' (Başlangıç)'}
                      {index === routePoints.length - 1 && index !== 0 && ' (Varış)'}
                      {index > 0 && index < routePoints.length - 1 && ' (Ara Nokta)'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {point.address || `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md">
          <p className="font-medium mb-1 flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            API Anahtarı Gerekli
          </p>
          <p className="mb-1">
            Bu özellik Google Maps API anahtarı gerektirir. Lütfen .env.local dosyanızda:
          </p>
          <code className="block bg-white p-2 rounded mt-1">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
          </code>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Haritaya tıklayarak rota noktaları ekleyin</li>
            <li>En az 2 nokta rotası oluşturur</li>
            <li>Varsayılan olarak araç rotası hesaplanır</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
