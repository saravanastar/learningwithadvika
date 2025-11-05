// UI Interactions and DOM Manipulation

const CATEGORIES = [
    { id: 'arts-crafts', name: 'Arts & Crafts', icon: '🎨' },
    { id: 'coding', name: 'Coding', icon: '💻' },
    { id: 'cooking', name: 'Cooking', icon: '🍳' },
    { id: 'languages', name: 'Languages', icon: '🌐' },
    { id: 'mechanics', name: 'Mechanics', icon: '🔧' },
    { id: 'math', name: 'Math', icon: '📐' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'reading', name: 'Reading', icon: '📚' }
];

/**
 * Render category cards on the homepage
 */
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;

    grid.innerHTML = CATEGORIES.map(category => {
        const count = getLessonCount(category.id);
        return `
            <div class="category-card ${category.id}" data-category="${category.id}">
                <div class="category-icon">${category.icon}</div>
                <h3>${category.name}</h3>
                <div class="category-count">${count} lesson${count !== 1 ? 's' : ''}</div>
            </div>
        `;
    }).join('');

    // Add click handlers
    grid.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            showLessonsForCategory(category);
        });
    });
}

/**
 * Show lessons for a specific category or all lessons
 * @param {string} category - Category ID or 'all'
 */
function showLessonsForCategory(category) {
    const categoriesGrid = document.getElementById('categoriesGrid');
    const lessonsContainer = document.getElementById('lessonsContainer');
    
    if (!categoriesGrid || !lessonsContainer) return;

    // Hide categories grid, show lessons
    categoriesGrid.style.display = 'none';
    lessonsContainer.style.display = 'block';

    // Update title
    const title = document.getElementById('currentCategoryTitle');
    if (title) {
        if (category === 'all') {
            title.textContent = 'All Lessons';
        } else {
            const cat = CATEGORIES.find(c => c.id === category);
            title.textContent = cat ? cat.name : 'Lessons';
        }
    }

    // Filter and render lessons
    const lessons = filterLessonsByCategory(category);
    renderLessons(lessons);

    // Update active filter button
    updateActiveFilterButton(category);
}

/**
 * Render lessons in the grid
 * @param {Array} lessons - Array of lesson objects
 */
function renderLessons(lessons) {
    const grid = document.getElementById('lessonsGrid');
    if (!grid) return;

    if (lessons.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>No lessons found</h3>
                <p>Click "Add New Lesson" to create your first lesson!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = lessons.map(lesson => createLessonCard(lesson)).join('');

    // Add event listeners to lesson cards
    grid.querySelectorAll('.lesson-card').forEach(card => {
        const lessonId = card.dataset.lessonId;
        
        // View lesson
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.lesson-actions')) {
                viewLesson(lessonId);
            }
        });

        // Edit button (only show for admins)
        const editBtn = card.querySelector('.edit-btn');
        if (editBtn) {
            if (isAdmin()) {
                editBtn.style.display = 'block';
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editLesson(lessonId);
                });
            } else {
                editBtn.style.display = 'none';
            }
        }

        // Delete button (only show for admins)
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
            if (isAdmin()) {
                deleteBtn.style.display = 'block';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteLesson(lessonId);
                });
            } else {
                deleteBtn.style.display = 'none';
            }
        }
    });
}

/**
 * Create HTML for a lesson card
 * @param {Object} lesson - Lesson object
 * @returns {string} HTML string
 */
function createLessonCard(lesson) {
    const category = CATEGORIES.find(c => c.id === lesson.category);
    const categoryName = category ? category.name : lesson.category;
    
    return `
        <div class="lesson-card ${lesson.category}" data-lesson-id="${lesson.id}">
            <div class="lesson-card-header">
                <div>
                    <span class="category-badge ${lesson.category}">${categoryName}</span>
                    <h3>${escapeHtml(lesson.title)}</h3>
                </div>
                <div class="lesson-actions">
                    <button class="edit-btn" title="Edit lesson">✏️</button>
                    <button class="delete-btn" title="Delete lesson">🗑️</button>
                </div>
            </div>
            <div class="lesson-description">${escapeHtml(lesson.description)}</div>
            <div class="lesson-type">${lesson.type === 'video' ? '🎥 Video' : '📝 Interactive'}</div>
        </div>
    `;
}

/**
 * Show the add/edit lesson modal
 * @param {Object|null} lesson - Lesson object to edit, or null for new lesson
 */
function showLessonModal(lesson = null) {
    const modal = document.getElementById('lessonModal');
    const form = document.getElementById('lessonForm');
    const modalTitle = document.getElementById('modalTitle');
    
    if (!modal || !form) return;

    // Reset form
    form.reset();
    document.getElementById('lessonId').value = '';
    document.getElementById('videoUploadStatus').innerHTML = '';
    document.getElementById('videoUploadStatus').className = '';

    if (lesson) {
        // Edit mode
        modalTitle.textContent = 'Edit Lesson';
        document.getElementById('lessonId').value = lesson.id;
        document.getElementById('lessonCategory').value = lesson.category;
        document.getElementById('lessonTitle').value = lesson.title;
        document.getElementById('lessonDescription').value = lesson.description;
        document.getElementById('lessonType').value = lesson.type;
        
        if (lesson.type === 'interactive') {
            document.getElementById('lessonContent').value = lesson.content || '';
        } else {
            if (lesson.videoUrl) {
                document.getElementById('videoUrl').value = lesson.videoUrl;
            } else if (lesson.videoData) {
                // Show uploaded video info
                document.getElementById('videoUploadStatus').innerHTML = 
                    `Current video: ${lesson.videoFileName || 'Uploaded video'}`;
                document.getElementById('videoUploadStatus').className = 'success';
            }
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Lesson';
    }

    // Show/hide content fields based on type
    handleLessonTypeChange();
    
    modal.classList.add('active');
}

/**
 * Hide the lesson modal
 */
function hideLessonModal() {
    const modal = document.getElementById('lessonModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Show the view lesson modal
 * @param {string} lessonId - Lesson ID
 */
function viewLesson(lessonId) {
    const lesson = getLessonById(lessonId);
    if (!lesson) return;

    const modal = document.getElementById('viewLessonModal');
    const content = document.getElementById('viewLessonContent');
    
    if (!modal || !content) return;

    const category = CATEGORIES.find(c => c.id === lesson.category);
    const categoryName = category ? category.name : lesson.category;

    let videoHtml = '';
    if (lesson.type === 'video') {
        if (lesson.videoUrl) {
            videoHtml = embedVideo(lesson.videoUrl);
        } else if (lesson.videoData) {
            videoHtml = `<video controls style="width: 100%; border-radius: 8px;">
                <source src="${lesson.videoData}" type="video/mp4">
                Your browser does not support the video tag.
            </video>`;
        }
    }

    content.innerHTML = `
        <h2>${escapeHtml(lesson.title)}</h2>
        <div class="lesson-meta">
            <span class="category-badge ${lesson.category}">${categoryName}</span>
            <span class="lesson-type">${lesson.type === 'video' ? '🎥 Video Lesson' : '📝 Interactive Lesson'}</span>
        </div>
        <p><strong>Description:</strong></p>
        <p>${escapeHtml(lesson.description)}</p>
        ${lesson.type === 'interactive' ? 
            `<div class="lesson-content">${escapeHtml(lesson.content || 'No content available.')}</div>` : 
            `<div class="video-container">${videoHtml}</div>`
        }
    `;

    modal.classList.add('active');
}

/**
 * Hide the view lesson modal
 */
function hideViewLessonModal() {
    const modal = document.getElementById('viewLessonModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Handle lesson type change in form
 */
function handleLessonTypeChange() {
    const type = document.getElementById('lessonType').value;
    const interactiveGroup = document.getElementById('interactiveContentGroup');
    const videoUrlGroup = document.getElementById('videoUrlGroup');
    const videoUploadGroup = document.getElementById('videoUploadGroup');
    const lessonContent = document.getElementById('lessonContent');
    const videoUrl = document.getElementById('videoUrl');
    const videoUpload = document.getElementById('videoUpload');

    if (type === 'interactive') {
        interactiveGroup.style.display = 'block';
        videoUrlGroup.style.display = 'none';
        videoUploadGroup.style.display = 'none';
        lessonContent.required = true;
        videoUrl.required = false;
        videoUpload.required = false;
    } else if (type === 'video') {
        interactiveGroup.style.display = 'none';
        videoUrlGroup.style.display = 'block';
        videoUploadGroup.style.display = 'block';
        lessonContent.required = false;
        videoUrl.required = false;
        videoUpload.required = false;
    } else {
        interactiveGroup.style.display = 'none';
        videoUrlGroup.style.display = 'none';
        videoUploadGroup.style.display = 'none';
        lessonContent.required = false;
        videoUrl.required = false;
        videoUpload.required = false;
    }
}

/**
 * Embed YouTube or Vimeo video
 * @param {string} url - Video URL
 * @returns {string} HTML string for iframe
 */
function embedVideo(url) {
    if (!url) return '';

    let embedUrl = '';
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('watch?v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }
        
        if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
    }
    // Vimeo
    else if (url.includes('vimeo.com')) {
        let videoId = '';
        if (url.includes('vimeo.com/')) {
            videoId = url.split('vimeo.com/')[1].split('?')[0];
        }
        
        if (videoId) {
            embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }
    }

    if (embedUrl) {
        return `<iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }

    return '<p>Invalid video URL. Please provide a valid YouTube or Vimeo link.</p>';
}

/**
 * Update active filter button
 * @param {string} category - Category ID
 */
function updateActiveFilterButton(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

