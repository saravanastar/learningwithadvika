// Video URL Update Utility
// This file uses the centralized `VERIFIED_VIDEO_URLS` defined in `js/video-urls.js`.

// To update existing lessons with new video URLs, run this in browser console:
// updateVideoUrls();

// Function to update video URLs for existing lessons
function updateVideoUrls() {
    const lessons = loadLessons();
    let updated = 0;
    
    lessons.forEach((lesson, index) => {
        if (lesson.type === 'video' && typeof VERIFIED_VIDEO_URLS !== 'undefined' && VERIFIED_VIDEO_URLS[lesson.category]) {
            const categoryVideos = VERIFIED_VIDEO_URLS[lesson.category];
            const videoIndex = index % categoryVideos.length;

            // Update with verified URL
            lesson.videoUrl = categoryVideos[videoIndex];
            updated++;
        }
    });
    
    if (updated > 0) {
        saveLessons(lessons);
        console.log(`Updated ${updated} video URLs. Please refresh the page.`);
        alert(`Updated ${updated} video URLs. Please refresh the page.`);
    } else {
        console.log('No videos to update.');
    }
}

