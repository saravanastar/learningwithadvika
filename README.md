# Interactive Learning Website

A static website for creating and organizing interactive lessons and videos into categories.

## Features

- **8 Categories**: Arts & Crafts, Coding, Cooking, Languages, Mechanics, Math, Science, Reading
- **Interactive Lessons**: Create text-based lessons with content, questions, and activities
- **Video Lessons**: Embed YouTube/Vimeo videos or upload local video files
- **Search & Filter**: Search lessons and filter by category
- **Local Storage**: All data is stored in your browser's localStorage (no backend required)

## Getting Started

1. Open `index.html` in your web browser
2. Click on any category card to view lessons in that category
3. Click "Add New Lesson" to create a new lesson
4. Fill in the form and choose between Interactive or Video lesson type
5. For videos, you can either:
   - Paste a YouTube or Vimeo URL
   - Upload a local video file (recommended size: <5MB due to browser storage limits)

## Usage

### Creating a Lesson

1. Click the "+ Add New Lesson" button
2. Select a category
3. Enter title and description
4. Choose lesson type:
   - **Interactive**: Enter text content, questions, or step-by-step instructions
   - **Video**: Provide a YouTube/Vimeo URL or upload a video file
5. Click "Save Lesson"

### Viewing Lessons

- Click on a category card to see all lessons in that category
- Use the filter buttons to switch between categories
- Use the search bar to find lessons by title or description
- Click on a lesson card to view its full content

### Editing/Deleting Lessons

- Click the edit icon (✏️) on a lesson card to edit it
- Click the delete icon (🗑️) on a lesson card to delete it

## Technical Details

- **Pure HTML/CSS/JavaScript**: No frameworks or dependencies
- **LocalStorage**: Data persists in your browser
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Video Support**: 
  - YouTube: Full URL support (youtube.com/watch?v=, youtu.be, youtube.com/embed/)
  - Vimeo: Full URL support
  - Local uploads: Converted to base64 and stored in localStorage

## File Structure

```
library/
├── index.html          # Main page
├── css/
│   └── style.css      # All styling
├── js/
│   ├── storage.js     # localStorage management
│   ├── ui.js          # UI rendering and interactions
│   └── app.js         # Main application logic
└── README.md          # This file
```

## Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- localStorage API
- FileReader API (for video uploads)
- CSS Grid and Flexbox

## Notes

- Video file uploads are limited by browser localStorage size (typically 5-10MB total)
- Large video files may cause performance issues or storage errors
- For best results with video uploads, keep files under 5MB
- All data is stored locally in your browser - clearing browser data will delete all lessons

## License

Free to use and modify.

