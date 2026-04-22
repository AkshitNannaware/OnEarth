# Offline Bookings Backup & Sync Guide

## Overview
Your hotel booking system now includes offline data backup and import capabilities. This allows you to:
- **Export** all current bookings as a JSON file backup
- **Upload** bookings from offline work to sync back to the database
- **Download** a sample template to understand the required format

## How to Use

### 1. Export Bookings (Backup)
In the Admin Dashboard, go to **All Bookings** section:
- Click the green **Export** button
- A JSON file will download with your current bookings
- Filename format: `bookings_backup_YYYY-MM-DD-HH-MM-SS.json`
- Keep this file safe for offline access and data recovery

### 2. Import Bookings (Sync from Offline)
When you've made changes offline:
- Click the blue **Import** button
- Select your JSON file with the bookings data
- The system will validate and upload all bookings to the database
- You'll see a confirmation message with the count of imported bookings
- Your bookings list will automatically refresh with the new data

### 3. Download Sample Template
- Click the gray **Sample** button to download `sample_bookings.json`
- This shows the exact format required for imports
- Use this as a reference when editing bookings offline
- Contains 3 example bookings with all required fields

## Data Structure

Each booking must include:
```json
{
  "id": "BOOKING-2024-001",
  "roomId": "101",
  "userId": "user_123",
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+1234567890",
  "checkIn": "2024-02-15T10:00:00Z",
  "checkOut": "2024-02-18T11:00:00Z",
  "guests": 2,
  "rooms": 1,
  "totalPrice": 450,
  "roomPrice": 400,
  "taxes": 40,
  "serviceCharges": 10,
  "status": "confirmed",
  "paymentStatus": "completed",
  "idVerified": "approved",
  "bookingDate": "2024-02-10T14:30:00Z"
}
```

### Required Fields
- `id` - Unique booking identifier
- `roomId` - Room ID (must exist in your system)
- `guestName` - Full name of guest
- `guestEmail` - Valid email address
- `guestPhone` - Contact phone number
- `checkIn` - ISO format date string (e.g., "2024-02-15T10:00:00Z")
- `checkOut` - ISO format date string
- `status` - One of: "pending", "confirmed", "checked-in", "checked-out", "cancelled"

### Optional Fields
- `userId` - User ID (defaults to '1')
- `guests` - Number of guests (defaults to 1)
- `rooms` - Number of rooms (defaults to 1)
- `totalPrice` - Total price (defaults to 0)
- `roomPrice`, `taxes`, `serviceCharges` - Pricing breakdown
- `paymentStatus` - Payment status (defaults to "pending")
- `idVerified` - ID verification status (defaults to "pending")
- `idProofUrl` - URL to ID proof image
- `idProofType` - Type of ID proof
- `idProofUploadedAt` - When ID was uploaded

## Workflow for Offline Work

### Before Going Offline
1. Click **Export** to download all current bookings
2. Keep the JSON file on your device or cloud storage
3. Edit the JSON file with your text editor to add/modify bookings
4. Ensure dates are in ISO format (YYYY-MM-DDTHH:MM:SSZ)

### While Offline
- Work with the JSON file locally
- Make any changes you need
- Save the file regularly

### After Coming Online
1. Go to Admin Dashboard > All Bookings
2. Click **Import** button
3. Select your updated JSON file
4. Review the success confirmation
5. Check the bookings have synced correctly

## Format Tips

### Date Format
Always use ISO 8601 format:
- ✅ Correct: `"2024-02-15T10:00:00Z"` or `"2024-02-15T10:00:00+00:00"`
- ❌ Wrong: `"02/15/2024"` or `"2024-02-15 10:00 AM"`

### Phone Numbers
Use international format:
- ✅ Correct: `"+1234567890"` or `"+44 1234 567890"`

### Status Values
Valid statuses (lowercase):
- `pending` - Not confirmed yet
- `confirmed` - Booking confirmed
- `checked-in` - Guest checked in
- `checked-out` - Guest checked out
- `cancelled` - Booking cancelled

### Payment Status
- `pending` - Payment awaiting
- `completed` - Payment received
- `failed` - Payment failed

### ID Verification Status
- `pending` - Not verified yet
- `approved` - ID verified and approved
- `rejected` - ID rejected

## Troubleshooting

### Import Fails with Error
- Check JSON file is valid (use jsonlint.com)
- Verify all required fields are present
- Check date formats are ISO 8601
- Ensure roomIds exist in your system
- Check file encoding is UTF-8

### Bookings Not Appearing After Import
- Refresh the page (Ctrl+R or Cmd+R)
- Check your internet connection
- Verify you're logged in as admin
- Look for error messages in browser console

### File Too Large
- For large backups (1000+ bookings), file might be large
- Use a text editor that can handle large files
- Or split into multiple smaller files to import separately

## Security Notes

- Exported files contain all booking information
- Store backups in a secure location
- Don't share files with sensitive guest data
- Only admins can import/export bookings (requires login)
- All imports are logged and validated

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify JSON format matches the sample
3. Look for error messages in the browser console (F12)
4. Contact your system administrator
