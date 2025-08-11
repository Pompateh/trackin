# Drive Link Functionality Setup

This document explains how to set up and use the new drive link functionality in the POD (Proof of Design) template.

## Database Setup

1. **Run the SQL script** in your Supabase SQL Editor:
   ```sql
   -- Add drive_link field to projects table
   ALTER TABLE projects 
   ADD COLUMN IF NOT EXISTS drive_link TEXT;
   
   -- Add a comment to describe the field
   COMMENT ON COLUMN projects.drive_link IS 'Google Drive link for project files and resources';
   ```

2. **Verify the column was added** by checking your projects table structure.

## Features Added

### 1. Upload Drive Link Button
- Located next to the "Delete Project" button in the POD header
- Opens a modal to input Google Drive links
- Updates the project's drive_link field in the database

### 2. Drive Link Display
- Shows a "📁 View Project Files" link below the date when a drive link exists
- Clicking the link opens the Google Drive folder in a new tab
- Only displays when a drive link has been set

### 3. Drive Link Modal
- Clean, consistent UI matching the existing design
- URL input field with proper validation
- Cancel and Update buttons
- Success/error feedback

## How to Use

1. **Set a Drive Link:**
   - Click the "Upload Drive Link" button in the POD header
   - Enter the Google Drive URL in the modal
   - Click "Update Drive Link" to save

2. **Access Project Files:**
   - When a drive link is set, a "📁 View Project Files" link appears below the date
   - Click the link to open the Google Drive folder in a new tab

3. **Update Drive Link:**
   - Click "Upload Drive Link" again to modify the existing link
   - The modal will show the current link for editing

## Technical Implementation

### State Management
- `driveLink`: Stores the current drive link value
- `showDriveLinkModal`: Controls modal visibility

### Database Operations
- `loadDriveLink()`: Fetches existing drive link on component mount
- `handleDriveLinkUpdate()`: Updates the drive_link field in the projects table

### UI Components
- Drive link button in header
- Modal with URL input
- Display link below date (when exists)
- Consistent styling with existing components

## Security Considerations

- Drive links are stored as plain text URLs
- Links open in new tabs with `rel="noopener noreferrer"`
- Only project members can view and update drive links (enforced by existing RLS policies)

## Future Enhancements

Potential improvements could include:
- Link validation (ensure it's a valid Google Drive URL)
- File preview integration
- Multiple drive links per project
- Link sharing permissions
- Drive API integration for file listing
