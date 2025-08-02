# Brief Functionality Setup

## Overview
The brief functionality allows admins to create and edit project briefs directly in the project interface without opening the full step template. The brief uses the same text editing capabilities as the step template but in a simplified inline interface.

## Database Setup

1. Run the SQL commands in `brief_table.sql` to create the `brief_data` table:

```sql
-- Execute the contents of brief_table.sql in your Supabase SQL editor
```

## Features

### Brief Editor
- **Inline Editing**: Click on the "Brief" section in the project index to open the brief editor
- **Text Formatting**: Full text formatting capabilities including:
  - Font size adjustment
  - Font family selection (Gothic A1, Crimson Pro)
  - Text styling (Bold, Italic, Underline)
  - Title, subtitle, and body text sections
- **Real-time Saving**: All changes are automatically saved to the database
- **Visibility Toggle**: Each text section can be hidden/shown

### Integration
- **PDF Export**: Brief content is included in PDF exports
- **Printable View**: Brief appears in the printable project view
- **Project Context**: Brief is tied to specific projects and respects user permissions

## Usage

1. Navigate to a project
2. Click on the "Brief" section in the index
3. The brief editor will appear inline
4. Click "Edit Brief" to enable editing mode
5. Click on any text area to edit content
6. Use the formatting toolbar to adjust text styling
7. Click "Done Editing" when finished

## Components

- `BriefEditor.jsx`: Main brief editing component
- `Project.jsx`: Updated to handle brief section clicks
- `SectionList.jsx`: Modified to handle brief section differently
- `PrintableProject.jsx`: Updated to include brief in exports

## Database Schema

The `brief_data` table stores:
- `project_id`: Reference to the project
- `title_text`, `subtitle_text`, `body_text`: Content fields
- `is_title_visible`, `is_subtitle_visible`, `is_body_visible`: Visibility flags
- Font size, family, and styling fields for each text section
- Timestamps for creation and updates

## Security

- Row Level Security (RLS) is enabled
- Users can only access brief data for projects they have access to
- All operations require proper authentication 