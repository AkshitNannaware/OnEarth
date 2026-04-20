import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { CheckCircle, Download, Home, Clock, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useBooking } from '../context/BookingContext';
import { format } from 'date-fns';
import type { Room } from '../types/room';

const PaymentSuccess = () => {
  // Support both /payment-success/:bookingId and /payment-success/service/:serviceBookingId
  const params = useParams();
  const bookingId = params.bookingId;
  const serviceBookingIdFromParams = params.serviceBookingId;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const payAtCheckin = searchParams.get('payAtCheckin') === 'true';
  const { bookings, updateBookingStatus, updatePaymentStatus, refreshBookings } = useBooking();
  const [booking, setBooking] = React.useState<any | null>(
    bookings.find(b => b.id === bookingId) || null
  );
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [room, setRoom] = React.useState<Room | null>(null);
  const [roomLoadError, setRoomLoadError] = React.useState<string | null>(null);
  
  // Service booking success state
  const [service, setService] = React.useState<any | null>(null);
  const [serviceBooking, setServiceBooking] = React.useState<any | null>(null);
  const [serviceImage, setServiceImage] = React.useState<string | null>(null);
  const [serviceError, setServiceError] = React.useState<string | null>(null);

  // Try to refresh service bookings in Profile if available
  React.useEffect(() => {
    if (serviceBookingIdFromParams || searchParams.get('serviceBookingId')) {
      window.dispatchEvent(new Event('refreshServiceBookings'));
    }
  }, [serviceBookingIdFromParams, searchParams]);

  // If this is a service payment success, try to get service booking details
  React.useEffect(() => {
    // Prefer /payment-success/service/:serviceBookingId, fallback to ?serviceBookingId=...
    const serviceBookingId = serviceBookingIdFromParams || searchParams.get('serviceBookingId');
    if (!serviceBookingId) return;
    
    (async () => {
      try {
        setServiceError(null);
        const token = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : null;
        
        // First, fetch the service booking details
        const res = await fetch(`${API_BASE}/api/service-bookings/${serviceBookingId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch service booking: ${res.status}`);
        }
        
        const data = await res.json();
        setServiceBooking(data);
        
        // Fetch service details
        if (data.serviceId) {
          const sres = await fetch(`${API_BASE}/api/services/${data.serviceId}`);
          if (sres.ok) {
            const sdata = await sres.json();
            setService(sdata);
            setServiceImage(sdata.image || null);
          }
        }

        // Always update paymentStatus after payment
        if (token) {
          let patchBody;
          if (data.status !== 'confirmed') {
            patchBody = {
              status: 'confirmed',
              paymentStatus: 'paid',
              paymentMethod: 'online'
            };
          } else {
            patchBody = {
              paymentStatus: 'paid',
              paymentMethod: 'online'
            };
          }
          // Try multiple possible endpoints
          const endpoint = `${API_BASE}/api/service-bookings/${serviceBookingId}/payment-status`;
          try {
            const updateRes = await fetch(endpoint, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(patchBody),
            });
            if (updateRes.ok) {
              console.log('Successfully updated service booking at:', endpoint);
            } else {
              console.log('Failed to update service booking at:', endpoint, updateRes.status);
            }
          } catch (e) {
            console.log(`Failed at endpoint ${endpoint}:`, e);
          }
        }
      } catch (error) {
        console.error('Error fetching service booking:', error);
        setServiceError(error instanceof Error ? error.message : 'Failed to load service booking');
      }
    })();
  }, [searchParams, API_BASE, serviceBookingIdFromParams]);

  React.useEffect(() => {
    // If booking is not found in context, fetch from backend
    if (!bookingId) return;
    if (!booking) {
      (async () => {
        try {
          const token = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : null;
          const res = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (res.ok) {
            const data = await res.json();
            setBooking({ ...data, id: data._id || data.id });
            // Optionally refresh context
            refreshBookings && refreshBookings();
          }
        } catch (error) {
          console.error('Error fetching booking:', error);
        }
      })();
      return;
    }
    
    // If booking is found, sync statuses as before
    const syncStatuses = async () => {
      if (booking.status !== 'confirmed') {
        await updateBookingStatus(booking.id, 'confirmed');
      }
      if (payAtCheckin) {
        if (booking.paymentStatus !== 'pending') {
          await updatePaymentStatus(booking.id, 'pending');
        }
      } else {
        if (booking.paymentStatus !== 'paid') {
          await updatePaymentStatus(booking.id, 'paid');
        }
      }
    };
    syncStatuses().catch(() => {});
  }, [bookingId, booking, payAtCheckin, updateBookingStatus, updatePaymentStatus, refreshBookings, API_BASE]);

  React.useEffect(() => {
    const loadRoom = async () => {
      setRoomLoadError(null);
      try {
        const response = await fetch(`${API_BASE}/api/rooms/${booking?.roomId}`);
        if (!response.ok) {
          throw new Error(`Failed to load room (${response.status})`);
        }
        const data = await response.json();
        setRoom({
          id: data._id || data.id,
          name: data.name,
          type: data.type,
          price: data.price,
          images: data.images || [],
          description: data.description || '',
          amenities: data.amenities || [],
          maxGuests: data.maxGuests || 1,
          size: data.size || 0,
          available: data.available ?? true,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load room';
        setRoomLoadError(message);
      }
    };

    if (booking?.roomId) {
      loadRoom();
    }
  }, [API_BASE, booking?.roomId]);

  // If this is a service payment success, do not show "Booking not found" if serviceBooking exists
  const serviceBookingId = serviceBookingIdFromParams || searchParams.get('serviceBookingId');
  
  if (!booking && !serviceBookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Booking not found</h2>
          <Button onClick={() => navigate('/rooms')}>Browse Rooms</Button>
        </div>
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    if (!booking) return;

    const nights =
      booking.checkIn && booking.checkOut
        ? Math.max(1, Math.round((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86400000))
        : 1;
    const checkInStr = booking.checkIn ? format(new Date(booking.checkIn), 'MMM dd, yyyy') : 'N/A';
    const checkOutStr = booking.checkOut ? format(new Date(booking.checkOut), 'MMM dd, yyyy') : 'N/A';
    const issuedDate = format(new Date(), 'MMM dd, yyyy');
    const roomType = room?.type || 'Suite';
    const pricePerNight = booking.totalPrice && nights ? (booking.totalPrice / nights).toFixed(2) : '0.00';
    const totalPrice = booking.totalPrice?.toFixed(2) ?? '0.00';

    const receiptHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Receipt – ${booking.id}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #3f4a40; color: #efece6; padding: 40px 20px; min-height: 100vh; }
    .card { max-width: 700px; margin: 0 auto; background: #3a4035; border: 1px solid #4b5246; border-radius: 24px; box-shadow: 0 8px 40px rgba(0,0,0,0.45); overflow: hidden; }

    /* Header */
    .header { background: #2e3628; padding: 36px 40px 28px; border-bottom: 1px solid #4b5246; position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(75,92,72,0.35) 0%, transparent 60%); pointer-events: none; }
    .hotel-name { font-family: 'Playfair Display', serif; font-size: 13px; letter-spacing: 0.35em; text-transform: uppercase; color: #c9c3b6; margin-bottom: 12px; }
    .header h1 { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 600; color: #efece6; letter-spacing: 0.02em; margin-bottom: 6px; }
    .header .sub { font-size: 13px; color: #9aa191; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: #4b5e48; color: #d7d0bf; font-size: 10px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-top: 16px; letter-spacing: 0.12em; text-transform: uppercase; border: 1px solid #5a7056; }

    /* Body */
    .body { padding: 36px 40px; }
    .section-title { font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #7a9177; margin-bottom: 18px; font-weight: 600; }
    .divider { border: none; border-top: 1px solid #4b5246; margin: 28px 0; }

    /* Detail grid */
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 32px; margin-bottom: 4px; }
    .field label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #8a9e87; display: block; margin-bottom: 5px; }
    .field span { font-size: 14px; color: #efece6; font-weight: 500; }

    /* Totals */
    .totals { background: #2f3a32; border: 1px solid #4b5246; border-radius: 14px; padding: 22px 24px; }
    .totals-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #c9c3b6; margin-bottom: 10px; }
    .totals-row:last-child { margin-bottom: 0; }
    .totals-row.total { font-size: 16px; font-weight: 700; color: #efece6; padding-top: 14px; margin-top: 6px; border-top: 1px solid #4b5246; }
    .totals-row.total span:last-child { color: #d7d0bf; }
    .totals-row .label { color: #9aa191; }

    /* Footer */
    .footer { padding: 20px 40px; background: #2a332a; border-top: 1px solid #4b5246; text-align: center; font-size: 11px; color: #7a9177; letter-spacing: 0.04em; }

    @media print {
      body { background: #3f4a40; padding: 0; }
      .card { box-shadow: none; border-radius: 0; border: none; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="hotel-name">On Earth Hotel</div>
      <h1>Booking Receipt</h1>
      <div class="sub">Issued on ${issuedDate}</div>
      <div class="badge">✓ &nbsp;Payment Confirmed</div>
    </div>

    <div class="body">
      <div class="section-title">Booking Details</div>
      <div class="grid">
        <div class="field"><label>Booking ID</label><span>${booking.id}</span></div>
        <div class="field"><label>Guest Name</label><span>${booking.guestName || 'N/A'}</span></div>
        <div class="field"><label>Check-in</label><span>${checkInStr}</span></div>
        <div class="field"><label>Check-out</label><span>${checkOutStr}</span></div>
        <div class="field"><label>Room Type</label><span>${roomType}</span></div>
        <div class="field"><label>Guests</label><span>${booking.guests ?? 1}</span></div>
        <div class="field"><label>Nights</label><span>${nights}</span></div>
        <div class="field"><label>Rooms</label><span>${booking.rooms ?? 1}</span></div>
        ${booking.guestEmail ? `<div class="field"><label>Email</label><span>${booking.guestEmail}</span></div>` : ''}
        ${booking.guestPhone ? `<div class="field"><label>Phone</label><span>${booking.guestPhone}</span></div>` : ''}
      </div>
      <div class="divider"></div>
      <div class="section-title">Payment Summary</div>
      <div class="totals">
        <div class="totals-row"><span class="label">Room (${roomType}) × ${nights} night${nights > 1 ? 's' : ''}</span><span>₹${pricePerNight} / night</span></div>
        <div class="totals-row"><span class="label">Subtotal</span><span>₹${totalPrice}</span></div>
        <div class="totals-row"><span class="label">Taxes &amp; Fees</span><span>Included</span></div>
        <div class="totals-row total"><span>Total Paid</span><span>₹${totalPrice}</span></div>
      </div>
    </div>

    <div class="footer">Thank you for choosing On Earth Hotel &nbsp;·&nbsp; We look forward to welcoming you &nbsp;·&nbsp; Official payment receipt</div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(receiptHTML);
      win.document.close();
      // Short delay so the page fully renders before print dialog opens
      setTimeout(() => win.print(), 400);
    }
  };

  // If service payment success, show service details
  if (serviceBookingId) {
    // Show loading state
    if (!serviceBooking || !service) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl w-full mx-auto rounded-3xl border border-[#4b5246] bg-[#3a4035]/95 shadow-2xl overflow-hidden p-8 text-center">
            <div className="w-14 h-14 bg-[#d7d0bf] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#1f241f]" />
            </div>
            <h1 className="text-2xl sm:text-3xl text-[#efece6] mb-2">Processing your booking...</h1>
            <p className="text-sm text-[#c9c3b6] mb-8">Please wait while we confirm your service booking.</p>
            {serviceError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                {serviceError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button onClick={() => navigate('/services')} className="rounded-xl border border-[#5b6255] bg-transparent text-[#d7d0bf] hover:bg-white/10" variant="outline">
                Browse More Services
              </Button>
              <Button onClick={() => navigate('/')} className="rounded-xl border border-[#5b6255] bg-[#d7d0bf] text-[#1f241f] hover:bg-[#e5ddca]">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Show service booking details
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full mx-auto rounded-3xl border border-[#4b5246] bg-[#3a4035]/95 shadow-2xl overflow-hidden p-8 text-center">
          <div className="w-14 h-14 bg-[#d7d0bf] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#1f241f]" />
          </div>
          <h1 className="text-2xl sm:text-3xl text-[#efece6] mb-2">Congrats! Your service booking is confirmed.</h1>
          <p className="text-sm text-[#c9c3b6] mb-8">Your payment was successful. Check your email for the invoice.</p>
          <div className="bg-[#23271f] border border-[#4b5246] rounded-xl p-6 mb-6 text-left flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
            <div className="flex-1">
              <div className="uppercase text-xs text-[#9aa191] mb-2 tracking-widest">Confirmation Summary</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-[#c9c3b6]">Booking ID</div>
                  <div className="font-medium text-[#efece6]">{serviceBooking._id || serviceBooking.id}</div>
                </div>
                <div>
                  <div className="text-[#c9c3b6]">Guest Name</div>
                  <div className="font-medium text-[#efece6]">{serviceBooking.guestName}</div>
                </div>
                <div>
                  <div className="text-[#c9c3b6]">Date</div>
                  <div className="font-medium text-[#efece6]">{new Date(serviceBooking.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-[#c9c3b6]">Time</div>
                  <div className="font-medium text-[#efece6]">{serviceBooking.time}</div>
                </div>
                <div>
                  <div className="text-[#c9c3b6]">Guests</div>
                  <div className="font-medium text-[#efece6]">{serviceBooking.guests}</div>
                </div>
                <div>
                  <div className="text-[#c9c3b6]">Service</div>
                  <div className="font-medium text-[#efece6]">{service.name}</div>
                </div>
                <div>
                  <div className="text-[#c9c3b6]">Category</div>
                  <div className="font-medium text-[#efece6]">{service.category}</div>
                </div>
                <div>
                  <div className="text-[#c9c3b6]">Price Range</div>
                  <div className="font-medium text-[#efece6]">{service.priceRange}</div>
                </div>
              </div>
            </div>
            {serviceImage && (
              <img
                src={serviceImage.startsWith('http') ? serviceImage : `${API_BASE}/${serviceImage.replace(/^\/+/, '')}`}
                alt={service.name}
                className="w-32 h-32 object-cover rounded-2xl border border-[#4b5246] mx-auto"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button onClick={() => navigate('/services')} className="rounded-xl border border-[#5b6255] bg-transparent text-[#d7d0bf] hover:bg-white/10" variant="outline">
              Browse More Services
            </Button>
            <Button onClick={() => navigate('/profile')} className="rounded-xl border border-[#5b6255] bg-transparent text-[#d7d0bf] hover:bg-white/10" variant="outline">
              View My Bookings
            </Button>
            <Button onClick={() => navigate('/')} className="rounded-xl border border-[#5b6255] bg-[#d7d0bf] text-[#1f241f] hover:bg-[#e5ddca]">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Room booking success view
  return (
    <div className="min-h-screen bg-[#474d41] text-[#efece6]">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 10%, rgba(86,98,85,0.35), transparent 60%), radial-gradient(circle at 80% 70%, rgba(74,92,80,0.35), transparent 60%), linear-gradient(180deg, rgba(10,12,10,0.9), rgba(10,12,10,0.6))',
          }}
        ></div>
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,rgba(235,230,220,0.08)_1px,transparent_1px)] bg-[size:220px_100%]" />

        <div className="relative max-w-5xl mx-auto px-4 py-12">
          <div className="rounded-[2rem] border border-[#4b5246] bg-[#3a4035]/95 shadow-2xl overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-[#4b5246]">
              <div className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.25em] text-[#c9c3b6]">
                {[
                  'Select Dates & Guests',
                  'Choose Your Room',
                  'Guest Information',
                  'Payment',
                ].map((label, index) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full border border-[#9aa191] text-[#9aa191] text-[9px] flex items-center justify-center">
                      OK
                    </div>
                    <span>{label}</span>
                    {index < 3 && <span className="h-px w-8 bg-[#5b6255]" />}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="h-9 w-9 rounded-full border border-[#5b6255] text-[#d7d0bf] hover:bg-white/10 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-10 text-center">
              <div className="w-14 h-14 bg-[#d7d0bf] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#1f241f]" />
              </div>
              <h1 className="text-2xl sm:text-3xl text-[#efece6] mb-2">
                Congrats! Your booking is confirmed.
              </h1>
              <p className="text-sm text-[#c9c3b6] mb-8">
                {payAtCheckin
                  ? 'Payment will be collected at check-in.'
                  : 'Your payment was successful. Check your email for the invoice.'}
              </p>

              {booking ? (
                <div className="max-w-2xl mx-auto rounded-2xl border border-[#4b5246] bg-[#343a30] p-6 text-left">
                  <div className="text-xs uppercase tracking-[0.2em] text-[#c9c3b6] mb-3">Confirmation summary</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#d7d0bf]">
                    <div>
                      <div className="text-xs text-[#9aa191]">Booking ID</div>
                      <div>{booking.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#9aa191]">Guest Name</div>
                      <div>{booking.guestName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#9aa191]">Check-in</div>
                      <div>{format(new Date(booking.checkIn), 'MMM dd, yyyy')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#9aa191]">Check-out</div>
                      <div>{format(new Date(booking.checkOut), 'MMM dd, yyyy')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#9aa191]">Room Type</div>
                      <div>{room?.type || 'Suite'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#9aa191]">Room Count</div>
                      <div>{booking.rooms || 1}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-400">Booking not found</div>
              )}
              {roomLoadError && !room && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                  {roomLoadError}
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-[#4b5246] flex items-center justify-between text-[#efece6]">
                <span>Total Payment</span>
                <span className="text-xl">₹{booking?.totalPrice?.toFixed(2) ?? '0.00'}</span>
              </div>
              {payAtCheckin && (
                <div className="mt-3 flex items-center gap-2 text-xs text-[#c9c3b6]">
                  <Clock className="w-4 h-4" />
                  Pay at hotel reception with cash or card.
                </div>
              )}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleDownloadInvoice}
                  className="rounded-xl border border-[#5b6255] bg-transparent text-[#d7d0bf] hover:bg-white/10"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipts
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  className="rounded-xl border border-[#5b6255] bg-transparent text-[#d7d0bf] hover:bg-white/10"
                  variant="outline"
                >
                  View My Booking
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="rounded-xl border border-[#5b6255] bg-[#d7d0bf] text-[#1f241f] hover:bg-[#e5ddca]"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentSuccess;