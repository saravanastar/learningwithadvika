// Main Application Logic

let currentCategory = 'all';
let currentSearchQuery = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Sync video URLs to session storage on every page load
    // This ensures new browser sessions pick up the latest URLs
    if (typeof syncVideoUrlsToSession === 'function') {
        syncVideoUrlsToSession();
    }
    
    // Initialize pre-populated videos if empty
    initializePrePopulatedVideos();
    
    // Check admin status and update UI
    updateAdminUI();
    
    renderCategories();
    setupEventListeners();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Add lesson button
    const addLessonBtn = document.getElementById('addLessonBtn');
    if (addLessonBtn) {
        addLessonBtn.addEventListener('click', () => {
            showLessonModal();
        });
    }

    // Modal close buttons
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', hideLessonModal);
    }

    const closeViewModal = document.getElementById('closeViewModal');
    if (closeViewModal) {
        closeViewModal.addEventListener('click', hideViewLessonModal);
    }

    // Close modals when clicking outside
    const lessonModal = document.getElementById('lessonModal');
    if (lessonModal) {
        lessonModal.addEventListener('click', (e) => {
            if (e.target === lessonModal) {
                hideLessonModal();
            }
        });
    }

    const viewLessonModal = document.getElementById('viewLessonModal');
    if (viewLessonModal) {
        viewLessonModal.addEventListener('click', (e) => {
            if (e.target === viewLessonModal) {
                hideViewLessonModal();
            }
        });
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideLessonModal);
    }

    // Lesson form submission
    const lessonForm = document.getElementById('lessonForm');
    if (lessonForm) {
        lessonForm.addEventListener('submit', handleLessonSubmit);
    }

    // Lesson type change
    const lessonType = document.getElementById('lessonType');
    if (lessonType) {
        lessonType.addEventListener('change', handleLessonTypeChange);
    }

    // Category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            currentCategory = category;
            applyFilters();
        });
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            applyFilters();
        });
    }

    // Clear search button
    const clearSearch = document.getElementById('clearSearch');
    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchQuery = '';
            applyFilters();
        });
    }

    // Video upload handler
    const videoUpload = document.getElementById('videoUpload');
    if (videoUpload) {
        videoUpload.addEventListener('change', handleVideoUpload);
    }

    // Back to categories button (if needed)
    setupBackNavigation();

    // Admin login button
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            showAdminLoginModal();
        });
    }

    // Admin logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutAdmin();
            updateAdminUI();
            renderCategories();
            applyFilters();
        });
    }

    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // Close admin modal
    const closeAdminModal = document.getElementById('closeAdminModal');
    if (closeAdminModal) {
        closeAdminModal.addEventListener('click', hideAdminLoginModal);
    }

    const cancelAdminLoginBtn = document.getElementById('cancelAdminLoginBtn');
    if (cancelAdminLoginBtn) {
        cancelAdminLoginBtn.addEventListener('click', hideAdminLoginModal);
    }

    const adminLoginModal = document.getElementById('adminLoginModal');
    if (adminLoginModal) {
        adminLoginModal.addEventListener('click', (e) => {
            if (e.target === adminLoginModal) {
                hideAdminLoginModal();
            }
        });
    }
}

/**
 * Handle lesson form submission
 * @param {Event} e - Form submit event
 */
async function handleLessonSubmit(e) {
    e.preventDefault();

    // Check if user is admin
    if (!isAdmin()) {
        alert('Only administrators can add or edit lessons.');
        hideLessonModal();
        return;
    }

    const lessonId = document.getElementById('lessonId').value;
    const category = document.getElementById('lessonCategory').value;
    const title = document.getElementById('lessonTitle').value;
    const description = document.getElementById('lessonDescription').value;
    const type = document.getElementById('lessonType').value;
    const content = document.getElementById('lessonContent').value;
    const videoUrl = document.getElementById('videoUrl').value;
    const videoUpload = document.getElementById('videoUpload');
    
    // Validation
    if (!category || !title || !description || !type) {
        alert('Please fill in all required fields.');
        return;
    }

    if (type === 'interactive' && !content.trim()) {
        alert('Please enter lesson content for interactive lessons.');
        return;
    }

    if (type === 'video' && !videoUrl && !videoUpload.files[0]) {
        alert('Please provide either a video URL or upload a video file.');
        return;
    }

    const lessonData = {
        category,
        title,
        description,
        type,
        content: type === 'interactive' ? content : '',
        videoUrl: videoUrl || '',
        videoData: '',
        videoFileName: ''
    };

    // Handle video upload if present
    if (type === 'video' && videoUpload.files[0]) {
        const file = videoUpload.files[0];
        const validation = validateVideoSize(file);
        
        if (!validation.valid) {
            alert(validation.message);
            return;
        }

        try {
            const videoData = await convertVideoToBase64(file);
            lessonData.videoData = videoData.data;
            lessonData.videoFileName = videoData.fileName;
        } catch (error) {
            console.error('Error converting video:', error);
            alert('Error processing video file. Please try again.');
            return;
        }
    }

    // Save or update lesson
    let savedLesson;
    if (lessonId) {
        // Update existing lesson
        savedLesson = updateLesson(lessonId, lessonData);
    } else {
        // Add new lesson
        savedLesson = addLesson(lessonData);
    }

    if (savedLesson) {
        hideLessonModal();
        renderCategories(); // Update category counts
        applyFilters(); // Refresh lesson display
    } else {
        alert('Error saving lesson. Please try again.');
    }
}

/**
 * Handle video file upload
 * @param {Event} e - File input change event
 */
async function handleVideoUpload(e) {
    const file = e.target.files[0];
    const statusDiv = document.getElementById('videoUploadStatus');
    
    if (!file) {
        statusDiv.innerHTML = '';
        statusDiv.className = '';
        return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
        statusDiv.innerHTML = 'Please select a valid video file.';
        statusDiv.className = 'error';
        e.target.value = '';
        return;
    }

    // Validate file size
    const validation = validateVideoSize(file);
    statusDiv.innerHTML = validation.message;
    statusDiv.className = validation.valid ? 'success' : 'error';

    if (!validation.valid) {
        e.target.value = '';
        return;
    }

    // Show loading message
    statusDiv.innerHTML = 'Processing video...';
    statusDiv.className = '';

    try {
        const videoData = await convertVideoToBase64(file);
        statusDiv.innerHTML = `Video ready: ${videoData.fileName} (${(videoData.size / 1024 / 1024).toFixed(2)}MB)`;
        statusDiv.className = 'success';
    } catch (error) {
        console.error('Error processing video:', error);
        statusDiv.innerHTML = 'Error processing video file.';
        statusDiv.className = 'error';
        e.target.value = '';
    }
}

/**
 * Apply filters (category and search)
 */
function applyFilters() {
    let lessons = [];

    // Filter by category
    if (currentCategory === 'all') {
        lessons = loadLessons();
    } else {
        lessons = filterLessonsByCategory(currentCategory);
    }

    // Filter by search query
    if (currentSearchQuery.trim()) {
        const lowerQuery = currentSearchQuery.toLowerCase();
        lessons = lessons.filter(lesson => 
            lesson.title.toLowerCase().includes(lowerQuery) ||
            lesson.description.toLowerCase().includes(lowerQuery) ||
            (lesson.content && lesson.content.toLowerCase().includes(lowerQuery))
        );
    }

    // Show lessons container if we have filters applied
    const categoriesGrid = document.getElementById('categoriesGrid');
    const lessonsContainer = document.getElementById('lessonsContainer');
    
    if (currentCategory !== 'all' || currentSearchQuery.trim()) {
        if (categoriesGrid) categoriesGrid.style.display = 'none';
        if (lessonsContainer) {
            lessonsContainer.style.display = 'block';
            const title = document.getElementById('currentCategoryTitle');
            if (title) {
                if (currentSearchQuery.trim()) {
                    title.textContent = `Search Results: "${currentSearchQuery}"`;
                } else {
                    const cat = CATEGORIES.find(c => c.id === currentCategory);
                    title.textContent = cat ? cat.name : 'Lessons';
                }
            }
        }
    } else {
        if (categoriesGrid) categoriesGrid.style.display = 'grid';
        if (lessonsContainer) lessonsContainer.style.display = 'none';
    }

    renderLessons(lessons);
    updateActiveFilterButton(currentCategory);
}

/**
 * Edit a lesson
 * @param {string} lessonId - Lesson ID
 */
function editLesson(lessonId) {
    if (!isAdmin()) {
        alert('Only administrators can edit lessons.');
        return;
    }
    const lesson = getLessonById(lessonId);
    if (lesson) {
        showLessonModal(lesson);
    }
}

/**
 * Delete a lesson (UI handler)
 * @param {string} lessonId - Lesson ID
 */
function deleteLesson(lessonId) {
    if (!isAdmin()) {
        alert('Only administrators can delete lessons.');
        return;
    }
    const lesson = getLessonById(lessonId);
    if (!lesson) return;

    if (confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
        // Call storage delete function directly
        const lessons = loadLessons();
        const filtered = lessons.filter(l => l.id !== lessonId);
        if (saveLessons(filtered)) {
            renderCategories(); // Update category counts
            applyFilters(); // Refresh lesson display
        } else {
            alert('Error deleting lesson. Please try again.');
        }
    }
}

/**
 * Setup back navigation to categories
 */
function setupBackNavigation() {
    // Add a back button if we're viewing lessons
    // This could be enhanced with browser history API
}

/**
 * Update UI based on admin status
 */
function updateAdminUI() {
    const isAdminUser = isAdmin();
    const addLessonBtn = document.getElementById('addLessonBtn');
    const adminControls = document.getElementById('adminControls');
    const loginButtonContainer = document.getElementById('loginButtonContainer');

    if (addLessonBtn) {
        addLessonBtn.style.display = isAdminUser ? 'block' : 'none';
    }

    if (adminControls) {
        adminControls.style.display = isAdminUser ? 'block' : 'none';
    }

    if (loginButtonContainer) {
        loginButtonContainer.style.display = isAdminUser ? 'none' : 'block';
    }

    // Re-render lessons to update edit/delete buttons
    if (document.getElementById('lessonsContainer').style.display !== 'none') {
        applyFilters();
    }
}

/**
 * Show admin login modal
 */
function showAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    const form = document.getElementById('adminLoginForm');
    const errorDiv = document.getElementById('loginError');
    
    if (modal && form) {
        form.reset();
        if (errorDiv) errorDiv.style.display = 'none';
        modal.classList.add('active');
    }
}

/**
 * Hide admin login modal
 */
function hideAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Handle admin login
 * @param {Event} e - Form submit event
 */
function handleAdminLogin(e) {
    e.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (loginAdmin(password)) {
        hideAdminLoginModal();
        updateAdminUI();
        renderCategories();
        if (document.getElementById('lessonsContainer').style.display !== 'none') {
            applyFilters();
        }
    } else {
        if (errorDiv) {
            errorDiv.textContent = 'Incorrect password. Please try again.';
            errorDiv.style.display = 'block';
        }
    }
}

