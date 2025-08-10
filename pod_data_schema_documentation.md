# POD Data Table Schema Documentation

## Table: `pod_data`

This table stores all POD (Project of Design) data including the main template and additional design rows.

### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `project_id` | `uuid` | NO | - | Foreign key to projects table |
| `scale_list` | `text[]` | YES | `['01/', '02/', '03/']` | Main scale list array |
| `reference_image_url` | `text` | YES | - | Main reference image URL |
| `reference_comment` | `text` | YES | - | Main reference image comment |
| `design_image_url` | `text` | YES | - | Main design image URL |
| `design_comment` | `text` | YES | - | Main design image comment |
| `final_images` | `text[]` | YES | `[]` | Main final design images array |
| `final_comments` | `text[]` | YES | `[]` | Main final design comments array |
| `additional_design_rows` | `jsonb` | YES | `[]` | **NEW**: Additional design rows data |
| `created_at` | `timestamp with time zone` | NO | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | NO | `now()` | Record update timestamp |

### Additional Design Rows Structure

The `additional_design_rows` column stores an array of JSON objects, each representing a complete design row:

```json
[
  {
    "scaleList": ["01/", "02/", "03/"],
    "referenceImage": "https://example.com/image1.jpg",
    "designImage": "https://example.com/image2.jpg", 
    "finalImage": "https://example.com/image3.jpg",
    "referenceComment": "Reference image comment",
    "designComment": "Design image comment",
    "finalComment": "Final design comment",
    "finalImages": ["https://example.com/final1.jpg", "https://example.com/final2.jpg"],
    "finalComments": ["Final design 1 comment", "Final design 2 comment"]
  },
  {
    "scaleList": ["01/", "02/", "03/", "04/"],
    "referenceImage": null,
    "designImage": "https://example.com/design2.jpg",
    "finalImage": null,
    "referenceComment": "",
    "designComment": "Second design comment",
    "finalComment": "",
    "finalImages": [],
    "finalComments": []
  }
]
```

### Indexes

- `idx_pod_data_project_id` - Index on `project_id` for fast lookups
- `idx_pod_data_additional_design_rows` - GIN index on `additional_design_rows` for JSON queries

### Constraints

- Primary Key: `id`
- Foreign Key: `project_id` references `projects(id)`
- Unique: `project_id` (one POD data record per project)

### Usage Examples

#### Insert new POD data
```sql
INSERT INTO pod_data (project_id, scale_list, reference_image_url, final_images)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  ARRAY['01/', '02/', '03/'],
  'https://example.com/reference.jpg',
  ARRAY['https://example.com/final1.jpg', 'https://example.com/final2.jpg']
);
```

#### Update additional design rows
```sql
UPDATE pod_data 
SET additional_design_rows = '[{"scaleList": ["01/", "02/"], "referenceImage": "https://example.com/ref.jpg"}]'::jsonb
WHERE project_id = '123e4567-e89b-12d3-a456-426614174000';
```

#### Query specific design row
```sql
SELECT additional_design_rows->0 as first_design_row
FROM pod_data 
WHERE project_id = '123e4567-e89b-12d3-a456-426614174000';
```

### Migration Notes

1. **Backward Compatibility**: Existing records will have `additional_design_rows = []` by default
2. **JSONB Performance**: The GIN index enables efficient querying of JSON data
3. **Data Integrity**: All JSON objects follow a consistent structure
4. **Auto-save**: The application automatically saves all changes to this table

### Application Integration

The React application uses this schema to:
- Store complete design row data including scale lists, images, and comments
- Support unlimited additional design rows per project
- Maintain independent scale lists for each design row
- Enable individual expanded views for each design row
- Auto-save all changes in real-time
