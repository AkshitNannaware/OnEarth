const XLSX = require('xlsx');
const path = require('path');

// Sample booking data
const data = [
  {
    'Booking ID': 'BOOKING-001',
    'Guest Name': 'John Doe',
    'Guest Email': 'john@example.com',
    'Guest Phone': '+1234567890',
    'Room ID': '101',
    'Check-In': '2/15/2024',
    'Check-Out': '2/18/2024',
    'Status': 'confirmed',
    'ID Verified': 'approved',
    'Total Price': 450,
    'Payment Status': 'completed',
  },
  {
    'Booking ID': 'BOOKING-002',
    'Guest Name': 'Jane Smith',
    'Guest Email': 'jane@example.com',
    'Guest Phone': '+1987654321',
    'Room ID': '102',
    'Check-In': '2/20/2024',
    'Check-Out': '2/23/2024',
    'Status': 'pending',
    'ID Verified': 'pending',
    'Total Price': 900,
    'Payment Status': 'pending',
  },
  {
    'Booking ID': 'BOOKING-003',
    'Guest Name': 'Robert Johnson',
    'Guest Email': 'robert@example.com',
    'Guest Phone': '+1555666777',
    'Room ID': '301',
    'Check-In': '2/25/2024',
    'Check-Out': '2/26/2024',
    'Status': 'checked-in',
    'ID Verified': 'approved',
    'Total Price': 250,
    'Payment Status': 'completed',
  },
];

// Create workbook
const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Bookings');

// Write file
const filePath = path.join(__dirname, 'Hotel', 'public', 'sample_bookings.xlsx');
XLSX.writeFile(wb, filePath);
console.log(`Sample bookings file created at ${filePath}`);
