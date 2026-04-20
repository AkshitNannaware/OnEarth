import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import Footer from '../components/Footer';

type Offer = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  badgeText: string;
  expiryDate?: string | null;
  ctaText: string;
  image: string;
  active: boolean;
};

const Offers = () => {
  const API_BASE = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:5000';
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const resolveImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    const trimmed = imageUrl.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('/uploads/')) {
      return `${API_BASE}${trimmed}`;
    }
    if (trimmed.startsWith('uploads/')) {
      return `${API_BASE}/${trimmed}`;
    }
    if (trimmed.startsWith('/')) {
      return `${API_BASE}${trimmed}`;
    }
    return `${API_BASE}/${trimmed}`;
  };

  const formatExpiry = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    const loadOffers = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(`${API_BASE}/api/offers`);
        if (!response.ok) {
          throw new Error(`Failed to load offers (${response.status})`);
        }
        const data = (await response.json()) as any[];
        const normalized = (Array.isArray(data) ? data : []).map((offer) => ({
          id: offer._id || offer.id,
          title: offer.title || '',
          subtitle: offer.subtitle || '',
          description: offer.description || '',
          price: Number(offer.price || 0),
          rating: Number(offer.rating || 4.9),
          reviewCount: Number(offer.reviewCount || 0),
          badgeText: offer.badgeText || '',
          expiryDate: offer.expiryDate || null,
          ctaText: offer.ctaText || 'Check availability',
          image: offer.image || '',
          active: offer.active ?? true,
        }));
        setOffers(normalized);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load offers';
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOffers();
  }, [API_BASE]);

  const activeOffers = useMemo(() => offers.filter((offer) => offer.active), [offers]);

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
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#cfc9bb]">Home &gt; Offers</p>
              <h1
                className="text-4xl md:text-5xl text-[#efece6] mt-3"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                Seasonal Offers
              </h1>
              <p className="text-sm text-[#cfc9bb] mt-3 max-w-xl">
                Limited-time escapes curated by our concierge team. Book direct and unlock member-only rates.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-[#5b6659] bg-[#2f3a32]/70 px-4 py-2 text-xs text-[#d7d2c5]">
                {activeOffers.length} active offers
              </span>
              <span className="rounded-full border border-[#5b6659] bg-[#2f3a32]/70 px-4 py-2 text-xs text-[#d7d2c5]">
                Flexible dates
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#cfc9bb]">Featured</span>
            <Button
              variant="outline"
              className="rounded-full border-[#5b6659] bg-[#2f3a32]/70 text-[#d7d2c5] hover:bg-white/10"
            >
              Filters
            </Button>
          </div>

          {isLoading && (
            <div className="mb-6 rounded-xl border border-[#5b6659] bg-[#2f3a32]/80 px-4 py-3 text-sm text-[#d7d2c5]">
              Loading offers...
            </div>
          )}
          {loadError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {loadError}
            </div>
          )}

          {!isLoading && !loadError && activeOffers.length === 0 && (
            <div className="rounded-2xl border border-[#5b6659] bg-[#2f3a32]/80 px-6 py-10 text-center text-[#d7d2c5]">
              No offers are available right now.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOffers.map((offer) => {
              const imageUrl = resolveImageUrl(offer.image);
              const expiryLabel = formatExpiry(offer.expiryDate);
              return (
                <div
                  key={offer.id}
                  className="group flex flex-col rounded-3xl border border-[#5b6659] bg-[#2a3529]/90 shadow-xl overflow-hidden hover:border-[#8a9e87] hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-[#1f261f]">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={offer.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[#232b24]">
                        <span className="text-[#5b6659] text-sm">No image</span>
                      </div>
                    )}
                    {/* Badge */}
                    {offer.badgeText && (
                      <div className="absolute top-3 left-3 rounded-full bg-[#d9c47c]/90 text-[#1f241f] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]">
                        {offer.badgeText}
                      </div>
                    )}
                    {/* Expiry pill */}
                    {expiryLabel && (
                      <div className="absolute top-3 right-3 rounded-full bg-[#1e2520]/80 border border-[#5b6659] px-3 py-1 text-[10px] text-[#d7d2c5] tracking-wide">
                        Expires {expiryLabel}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <div>
                      <h2
                        className="text-xl text-[#efece6] leading-snug"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {offer.title}
                      </h2>
                      {offer.subtitle && (
                        <p className="text-xs text-[#a9b3a2] mt-1 uppercase tracking-wide">{offer.subtitle}</p>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 text-[#d9c47c]">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={`w-3 h-3 ${idx < Math.round(offer.rating) ? 'fill-current' : 'opacity-30'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-[#d7d2c5]">{offer.rating.toFixed(1)}</span>
                      {offer.reviewCount > 0 && (
                        <span className="text-xs text-[#a9b3a2]">· {offer.reviewCount} reviews</span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[#cfc9bb] leading-relaxed line-clamp-3 flex-1">
                      {offer.description || 'Reward yourself with a seasonal retreat and curated extras.'}
                    </p>

                    {/* Divider */}
                    <div className="h-px bg-[#3d4f40] mt-1" />

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-xl font-semibold text-[#efece6]">₹{offer.price.toFixed(0)}</div>
                        <div className="text-[10px] text-[#a9b3a2] mt-0.5">
                          {expiryLabel ? `Valid till ${expiryLabel}` : 'Limited availability'}
                        </div>
                      </div>
                      <Link to="/rooms">
                        <Button
                          size="sm"
                          className="rounded-full bg-[#d7d0bf] text-[#1f241f] hover:bg-[#efece6] font-medium text-xs px-4"
                        >
                          {offer.ctaText || 'Book Now'}
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <Footer isAdmin={false} />
    </div>
  );
};

export default Offers;
