import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  SlidersHorizontal,
  Wifi,
  Car,
  Coffee,
  Waves,
  Users,
  Maximize2,
  MapPin,
  X,
  Wind,
  Tv,
  Dumbbell,
  UtensilsCrossed,
  BedDouble,
  ShowerHead,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import type { Room } from '../types/room';
import Footer from '../components/Footer';

const AMENITY_LIST = ['WiFi', 'AC', 'Pool Access', 'Parking', 'Room Service', 'TV', 'Gym', 'Balcony'];
const ROOM_TYPES = ['Single', 'Double', 'Suite', 'Deluxe'];
const PRICE_MAX = 5000;
const FALLBACK_ROOM_IMAGE = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&h=400&fit=crop';

const RoomListing = () => {
  const API_BASE = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5000';

  const [priceRange, setPriceRange] = useState([0, PRICE_MAX]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [sortBy, setSortBy] = useState('price-low');
  const [showFilters, setShowFilters] = useState(false);
  const [roomsState, setRoomsState] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Amenity icon map ────────────────────────────────────────────────────────
  const amenityIcons: Record<string, React.ElementType> = {
    'WiFi': Wifi,
    'Pool Access': Waves,
    'Parking': Car,
    'Room Service': Coffee,
    'AC': Wind,
    'TV': Tv,
    'Gym': Dumbbell,
    'Restaurant': UtensilsCrossed,
    'King Bed': BedDouble,
    'Shower': ShowerHead,
  };

  const getAmenityIcon = (amenity: string): React.ElementType => {
    // Exact match first
    if (amenityIcons[amenity]) return amenityIcons[amenity];
    // Case-insensitive fallback
    const key = Object.keys(amenityIcons).find(
      (k) => k.toLowerCase() === amenity.toLowerCase()
    );
    return key ? amenityIcons[key] : Coffee;
  };

  // ── URL helpers ─────────────────────────────────────────────────────────────
  const resolveImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) return `${API_BASE}${imageUrl}`;
    if (!imageUrl.startsWith('/')) return `${API_BASE}/uploads/rooms/${imageUrl}`;
    return `${API_BASE}${imageUrl}`;
  };

  const resolveVideoUrl = (videoUrl?: string) => {
    if (!videoUrl) return '';
    return videoUrl.startsWith('/uploads/') ? `${API_BASE}${videoUrl}` : videoUrl;
  };

  // ── Data fetching ────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadRooms = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(`${API_BASE}/api/rooms`);
        if (!response.ok) throw new Error(`Failed to load rooms (${response.status})`);
        const data = await response.json();
        const normalized = (data as any[]).map((room) => ({
          id: room._id || room.id,
          name: room.name,
          type: room.type,
          price: room.price,
          images: room.images || [],
          video: room.video || '',
          description: room.description || '',
          amenities: room.amenities || [],
          maxGuests: room.maxGuests || 1,
          size: room.size || 0,
          available: room.available ?? true,
          location: room.location || '',
        }));
        setRoomsState(normalized);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load rooms');
      } finally {
        setIsLoading(false);
      }
    };
    loadRooms();
  }, [API_BASE]);

  // ── Toggle helpers ───────────────────────────────────────────────────────────
  const toggleType = (type: string) =>
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );

  const toggleAmenity = (amenity: string) =>
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setPriceRange([0, PRICE_MAX]);
    setLocationSearch('');
  };

  // ── Active filter detection ──────────────────────────────────────────────────
  const isAnyFilterActive = useMemo(
    () =>
      selectedTypes.length > 0 ||
      selectedAmenities.length > 0 ||
      locationSearch.trim() !== '' ||
      priceRange[0] !== 0 ||
      priceRange[1] !== PRICE_MAX,
    [selectedTypes, selectedAmenities, locationSearch, priceRange]
  );

  // Build a flat list of active filter labels for the pills row
  const activeFilterPills = useMemo(() => {
    const pills: { key: string; label: string; onRemove: () => void }[] = [];
    selectedTypes.forEach((t) =>
      pills.push({ key: `type-${t}`, label: t, onRemove: () => toggleType(t) })
    );
    selectedAmenities.forEach((a) =>
      pills.push({ key: `amenity-${a}`, label: a, onRemove: () => toggleAmenity(a) })
    );
    if (locationSearch.trim())
      pills.push({
        key: 'location',
        label: `"${locationSearch.trim()}"`,
        onRemove: () => setLocationSearch(''),
      });
    if (priceRange[0] !== 0 || priceRange[1] !== PRICE_MAX)
      pills.push({
        key: 'price',
        label: `₹${priceRange[0]} – ₹${priceRange[1]}`,
        onRemove: () => setPriceRange([0, PRICE_MAX]),
      });
    return pills;
  }, [selectedTypes, selectedAmenities, locationSearch, priceRange]);

  // ── Filtering & sorting ──────────────────────────────────────────────────────
  const filteredRooms = useMemo(
    () =>
      roomsState
        .filter((room) => room.price >= priceRange[0] && room.price <= priceRange[1])
        .filter((room) => selectedTypes.length === 0 || selectedTypes.includes(room.type))
        .filter(
          (room) =>
            selectedAmenities.length === 0 ||
            selectedAmenities.every((amenity) =>
              room.amenities.some(
                (a: string) => a.toLowerCase() === amenity.toLowerCase()
              )
            )
        )
        .filter(
          (room) =>
            locationSearch.trim() === '' ||
            (room.location || '').toLowerCase().includes(locationSearch.trim().toLowerCase()) ||
            room.name.toLowerCase().includes(locationSearch.trim().toLowerCase())
        )
        .sort((a, b) => {
          if (sortBy === 'price-low') return a.price - b.price;
          if (sortBy === 'price-high') return b.price - a.price;
          return 0;
        }),
    [roomsState, priceRange, selectedTypes, selectedAmenities, locationSearch, sortBy]
  );

  return (
    <div className="min-h-screen bg-[#3f4a40] text-[#efece6]">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(88,105,90,0.35), transparent 55%), radial-gradient(circle at 85% 60%, rgba(98,120,100,0.35), transparent 60%), linear-gradient(180deg, rgba(23,30,24,0.9), rgba(23,30,24,0.55))',
          }}
        />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,rgba(235,230,220,0.08)_1px,transparent_1px)] bg-[size:220px_100%]" />
        <div className="absolute inset-0 opacity-25 bg-[linear-gradient(180deg,rgba(235,230,220,0.08)_1px,transparent_1px)] bg-[size:100%_160px]" />

        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-16">

          {/* ── Page header ── */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#cfc9bb]">Home &gt; Rooms</p>
              <h1
                className="text-4xl md:text-5xl text-[#efece6] mt-3"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                Rooms & Rates
              </h1>
              <p className="text-sm text-[#c9c3b6] mt-3 max-w-xl">
                Curated stays with handcrafted details, tailored for quiet luxury.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-[#5b6659] bg-[#2f3a32]/70 px-4 py-2 text-xs text-[#d7d2c5]">
                {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available
              </span>
              <span className="rounded-full border border-[#5b6659] bg-[#2f3a32]/70 px-4 py-2 text-xs text-[#d7d2c5]">
                Flexible check-in
              </span>
            </div>
          </div>

          {/* ── Mobile filter backdrop ── */}
          {showFilters && (
            <div
              className="fixed inset-0 z-20 bg-black/40 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">

            {/* ══ Filter sidebar ════════════════════════════════════════════════ */}
            <div className="space-y-6">
              <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full relative z-30 lg:z-auto`}>
                <div className="rounded-3xl border border-[#5b6659] bg-[#2f3a32]/95 p-6 shadow-xl lg:sticky lg:top-6">

                  {/* Sidebar header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg text-[#efece6]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Filters
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden text-xs uppercase tracking-[0.2em] text-[#d7d2c5]"
                    >
                      Close
                    </button>
                  </div>

                  {/* Location search */}
                  <div className="mb-8">
                    <h4 className="text-sm text-[#efece6] mb-3 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      <MapPin className="w-4 h-4 text-[#cfc9bb]" />
                      Search by Location
                    </h4>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8a7a] pointer-events-none" />
                      <input
                        type="text"
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        placeholder="e.g. Sea View, City View..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#4b5246] bg-[#243026] text-[#efece6] text-sm placeholder:text-[#7a8a7a] focus:outline-none focus:ring-1 focus:ring-[#7a9a7a]"
                      />
                      {locationSearch && (
                        <button
                          type="button"
                          onClick={() => setLocationSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a8a7a] hover:text-[#cfc9bb]"
                          aria-label="Clear location"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Price range */}
                  <div className="mb-8">
                    <label className="block text-xs uppercase tracking-[0.2em] text-[#cfc9bb] mb-1">
                      Price Range
                    </label>
                    <p className="text-sm text-[#efece6] mb-3">
                      ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
                    </p>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={PRICE_MAX}
                      step={100}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-[10px] text-[#7a8a7a] mt-1">
                      <span>₹0</span>
                      <span>₹{PRICE_MAX.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Room Type */}
                  <div className="mb-8">
                    <h4 className="text-sm text-[#efece6] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Room Type
                    </h4>
                    <div className="space-y-2">
                      {ROOM_TYPES.map((type) => {
                        const isActive = selectedTypes.includes(type);
                        return (
                          <div
                            key={type}
                            onClick={() => toggleType(type)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                              isActive
                                ? 'bg-[#4b5e48] border border-[#7a9a7a]'
                                : 'hover:bg-[#3a4835] border border-transparent'
                            }`}
                          >
                            <Checkbox
                              id={`type-${type}`}
                              checked={isActive}
                              onCheckedChange={() => toggleType(type)}
                              onClick={(e) => e.stopPropagation()}
                              className="border-[#7a8a7a] data-[state=checked]:bg-[#7a9a7a] data-[state=checked]:border-[#7a9a7a]"
                            />
                            <Label
                              htmlFor={`type-${type}`}
                              className={`cursor-pointer text-sm ${isActive ? 'text-[#efece6] font-medium' : 'text-[#cfc9bb]'}`}
                            >
                              {type}
                            </Label>
                            {isActive && (
                              <span className="ml-auto w-2 h-2 rounded-full bg-[#9aba9a]" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-8">
                    <h4 className="text-sm text-[#efece6] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Amenities
                    </h4>
                    <div className="space-y-2">
                      {AMENITY_LIST.map((amenity) => {
                        const isActive = selectedAmenities.includes(amenity);
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <div
                            key={amenity}
                            onClick={() => toggleAmenity(amenity)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                              isActive
                                ? 'bg-[#4b5e48] border border-[#7a9a7a]'
                                : 'hover:bg-[#3a4835] border border-transparent'
                            }`}
                          >
                            <Checkbox
                              id={`amenity-${amenity}`}
                              checked={isActive}
                              onCheckedChange={() => toggleAmenity(amenity)}
                              onClick={(e) => e.stopPropagation()}
                              className="border-[#7a8a7a] data-[state=checked]:bg-[#7a9a7a] data-[state=checked]:border-[#7a9a7a]"
                            />
                            <Icon
                              className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#9aba9a]' : 'text-[#7a8a7a]'}`}
                            />
                            <Label
                              htmlFor={`amenity-${amenity}`}
                              className={`cursor-pointer text-sm ${isActive ? 'text-[#efece6] font-medium' : 'text-[#cfc9bb]'}`}
                            >
                              {amenity}
                            </Label>
                            {isActive && (
                              <span className="ml-auto w-2 h-2 rounded-full bg-[#9aba9a]" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clear All — only when filters are active */}
                  {isAnyFilterActive && (
                    <Button
                      variant="outline"
                      className="w-full border-[#4b5246] text-[#efece6] bg-[#343a30] hover:bg-white/10"
                      onClick={clearAllFilters}
                    >
                      <X className="w-3.5 h-3.5 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* ══ Room grid ═════════════════════════════════════════════════════ */}
            <div className="flex-1">

              {/* Toolbar: mobile filter toggle + sort */}
              <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`lg:hidden border-[#5b6659] ${isAnyFilterActive ? 'border-[#7a9a7a] text-[#9aba9a]' : ''}`}
                  aria-expanded={showFilters}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {isAnyFilterActive && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#7a9a7a] text-[10px] text-[#1f241f] font-bold">
                      {activeFilterPills.length}
                    </span>
                  )}
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[220px] border-[#5b6659] bg-[#2f3a32] text-[#d7d2c5]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active filter pills */}
              {activeFilterPills.length > 0 && (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#7a8a7a] uppercase tracking-widest">Active:</span>
                  {activeFilterPills.map((pill) => (
                    <span
                      key={pill.key}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#7a9a7a] bg-[#4b5e48] px-3 py-1 text-xs text-[#efece6]"
                    >
                      {pill.label}
                      <button
                        type="button"
                        onClick={pill.onRemove}
                        className="ml-0.5 rounded-full hover:text-red-300 transition-colors"
                        aria-label={`Remove ${pill.label} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs text-[#c9a96e] hover:text-[#e6c57e] underline underline-offset-2 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Loading / error states */}
              {isLoading && (
                <div className="mb-6 rounded-xl border border-[#5b6659] bg-[#2f3a32]/80 px-4 py-3 text-sm text-[#d7d2c5]">
                  Loading rooms...
                </div>
              )}
              {loadError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                  {loadError}
                </div>
              )}

              {/* Room cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <Link
                    key={room.id}
                    to={`/room/${room.id}`}
                    state={{ from: 'rooms' }}
                    className="group rounded-2xl border border-[#5b6659] bg-[#2f3a32]/90 overflow-hidden shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="relative h-40 overflow-hidden">
                      {resolveVideoUrl(room.video) ? (
                        <video
                          src={resolveVideoUrl(room.video)}
                          className="h-full w-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                          poster={resolveImageUrl(room.images[0] || '') || FALLBACK_ROOM_IMAGE}
                        />
                      ) : (
                        <img
                          src={resolveImageUrl(room.images[0] || '') || FALLBACK_ROOM_IMAGE}
                          alt={room.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_ROOM_IMAGE;
                          }}
                        />
                      )}
                      <div className="absolute top-3 left-3 rounded-full bg-[#1e2520]/80 px-3 py-1 text-[10px] text-[#d7d2c5] border border-[#5b6659]">
                        {room.available ? 'Available' : 'Limited'}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base text-[#efece6]" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {room.name}
                          </h3>
                          {room.location ? (
                            <p className="text-xs text-[#cfc9bb] mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {room.location}
                            </p>
                          ) : (
                            <p className="text-xs text-[#cfc9bb] mt-1">Modern cozy suite · 1 queen bed</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[#f0e7d6]">₹{room.price.toLocaleString()} / night</div>
                          <div className="text-[10px] text-[#cfc9bb]">4.9 (84)</div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-[11px] text-[#cfc9bb]">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {room.maxGuests} guests
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5" />
                          {room.size} m²
                        </span>
                      </div>

                      {/* Amenity chips — highlight those matching active filters */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {room.amenities.slice(0, 4).map((amenity: string, idx: number) => {
                          const Icon = getAmenityIcon(amenity);
                          const isFiltered = selectedAmenities.some(
                            (a) => a.toLowerCase() === amenity.toLowerCase()
                          );
                          return (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] transition-colors ${
                                isFiltered
                                  ? 'border-[#7a9a7a] bg-[#4b5e48] text-[#efece6]'
                                  : 'border-[#5b6659] bg-[#243026] text-[#d7d2c5]'
                              }`}
                            >
                              <Icon className="w-3 h-3" />
                              {amenity}
                            </span>
                          );
                        })}
                      </div>

                      <div className="mt-4">
                        <Button className="w-full rounded-full border border-[#5b6659] bg-transparent text-[#efece6] hover:bg-white/10">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Empty state */}
              {!isLoading && filteredRooms.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🏨</div>
                  <h3 className="text-2xl mb-2 text-[#efece6]">No rooms found</h3>
                  <p className="text-[#cfc9bb] mb-6">
                    {isAnyFilterActive
                      ? 'No rooms match the selected filters. Try adjusting or clearing them.'
                      : 'No rooms are available at the moment.'}
                  </p>
                  {isAnyFilterActive && (
                    <Button onClick={clearAllFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer isAdmin={false} />
    </div>
  );
};

export default RoomListing;
