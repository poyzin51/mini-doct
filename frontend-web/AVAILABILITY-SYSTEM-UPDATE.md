# Availability System Update

## Overview

The availability management system has been completely updated to provide a more intuitive and efficient way for medical professionals to manage their schedules. The new system introduces **Availability Ranges** as the primary way to set up recurring availability patterns.

## Key Changes

### 1. New Availability Range System

**Before**: Professionals had to manually add individual time slots one by one.

**Now**: Professionals can define recurring availability patterns using ranges:
- Set which day of the week they're available (Monday, Tuesday, etc.)
- Define start and end times for that day
- Choose interval duration (15min, 30min, 1hr, etc.)
- Automatically generate time slots for the next 4 weeks

### 2. Updated User Interface

#### New Tab Structure:
1. **Availability Ranges** (Default tab) - Manage recurring patterns
2. **Calendar View** - Visual calendar of available slots
3. **Time Slots List** - List view of individual time slots

#### New Components:
- `AvailabilityRangeForm` - Form to add new availability ranges
- `AvailabilityRangesList` - List to manage existing ranges

### 3. Backend Integration

The frontend now properly integrates with the updated backend that supports:
- Java `DayOfWeek` enum (1=Monday, 2=Tuesday, etc.)
- Automatic time slot generation from ranges
- Proper availability range CRUD operations

## How to Use the New System

### For Professionals:

1. **Set Up Availability Ranges**:
   - Go to the "Availability Ranges" tab
   - Click "Add Availability Range"
   - Select day of week, time range, and interval
   - Check "Generate time slots immediately" to create bookable slots

2. **Generate Time Slots**:
   - Time slots are automatically generated for the next 4 weeks
   - Click "Generate Time Slots" button to refresh slots from ranges
   - Individual slots can still be managed in the "Time Slots List" tab

3. **View Your Schedule**:
   - Use the "Calendar View" to see availability visually
   - Use the "Time Slots List" for detailed slot management

### Example Workflow:

1. Professional sets up: "Every Monday from 9:00 AM to 5:00 PM with 30-minute intervals"
2. System generates: Monday slots at 9:00, 9:30, 10:00, 10:30... for next 4 weeks
3. Patients can book any of these generated slots
4. Booked slots are automatically removed from availability

## Technical Details

### API Updates:
- `POST /api/professionals/{id}/availability-ranges` - Add availability range
- `DELETE /api/professionals/{id}/availability-ranges/{index}` - Remove range
- `GET /api/professionals/{id}/generate-time-slots` - Generate slots from ranges

### Day of Week Mapping:
- Frontend uses JavaScript convention (0=Sunday, 1=Monday, etc.)
- Backend uses Java DayOfWeek enum (1=Monday, 2=Tuesday, etc.)
- Proper conversion is handled in the API layer

### Data Flow:
1. Professional creates availability range
2. Range is saved to database
3. Time slots are generated from range for next 4 weeks
4. Generated slots are available for patient booking
5. Booked slots are removed from available slots

## Benefits

1. **Efficiency**: Set schedule once, generate many slots
2. **Consistency**: Regular patterns are maintained automatically
3. **Flexibility**: Different intervals for different days
4. **Time-saving**: No need to manually add individual slots
5. **Professional**: Clean, intuitive interface

## Migration Notes

- Existing individual time slots are preserved
- New availability ranges work alongside existing slots
- Professionals can gradually migrate to the new system
- Both old and new methods can be used simultaneously

## Future Enhancements

- Bulk operations for time slots
- Export/import functionality
- Advanced recurring patterns (every 2 weeks, monthly, etc.)
- Integration with external calendar systems
- Automated slot generation based on appointment history