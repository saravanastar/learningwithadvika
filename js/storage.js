// localStorage Management Functions

const STORAGE_KEY = 'learningLibraryLessons';
const ADMIN_KEY = 'learningLibraryAdmin';
const ADMIN_PASSWORD = 'admin123'; // Default admin password - change this in production

/**
 * Load all lessons from localStorage
 * @returns {Array} Array of lesson objects
 */
function loadLessons() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading lessons:', error);
        return [];
    }
}

/**
 * Save lessons to localStorage
 * @param {Array} lessons - Array of lesson objects
 */
function saveLessons(lessons) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
        return true;
    } catch (error) {
        console.error('Error saving lessons:', error);
        // Check if it's a quota exceeded error
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            alert('Storage quota exceeded! Please delete some lessons or use smaller video files.');
        }
        return false;
    }
}

/**
 * Get a single lesson by ID
 * @param {string} id - Lesson ID
 * @returns {Object|null} Lesson object or null if not found
 */
function getLessonById(id) {
    const lessons = loadLessons();
    return lessons.find(lesson => lesson.id === id) || null;
}

/**
 * Add a new lesson
 * @param {Object} lessonData - Lesson data object
 * @returns {Object} The created lesson with generated ID
 */
function addLesson(lessonData) {
    const lessons = loadLessons();
    const newLesson = {
        id: generateId(),
        ...lessonData,
        createdAt: new Date().toISOString()
    };
    lessons.push(newLesson);
    if (saveLessons(lessons)) {
        return newLesson;
    }
    return null;
}

/**
 * Update an existing lesson
 * @param {string} id - Lesson ID
 * @param {Object} lessonData - Updated lesson data
 * @returns {Object|null} Updated lesson or null if not found
 */
function updateLesson(id, lessonData) {
    const lessons = loadLessons();
    const index = lessons.findIndex(lesson => lesson.id === id);
    if (index !== -1) {
        lessons[index] = {
            ...lessons[index],
            ...lessonData,
            updatedAt: new Date().toISOString()
        };
        if (saveLessons(lessons)) {
            return lessons[index];
        }
    }
    return null;
}

/**
 * Delete a lesson
 * @param {string} id - Lesson ID
 * @returns {boolean} True if deleted successfully
 */
function deleteLesson(id) {
    const lessons = loadLessons();
    const filtered = lessons.filter(lesson => lesson.id !== id);
    if (filtered.length !== lessons.length) {
        return saveLessons(filtered);
    }
    return false;
}

/**
 * Filter lessons by category
 * @param {string} category - Category name (or 'all' for all lessons)
 * @returns {Array} Filtered array of lessons
 */
function filterLessonsByCategory(category) {
    const lessons = loadLessons();
    if (category === 'all') {
        return lessons;
    }
    return lessons.filter(lesson => lesson.category === category);
}

/**
 * Search lessons by title or description
 * @param {string} query - Search query
 * @returns {Array} Filtered array of lessons
 */
function searchLessons(query) {
    const lessons = loadLessons();
    if (!query || query.trim() === '') {
        return lessons;
    }
    const lowerQuery = query.toLowerCase();
    return lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(lowerQuery) ||
        lesson.description.toLowerCase().includes(lowerQuery) ||
        (lesson.content && lesson.content.toLowerCase().includes(lowerQuery))
    );
}

/**
 * Get lesson count for a category
 * @param {string} category - Category name
 * @returns {number} Count of lessons in category
 */
function getLessonCount(category) {
    const lessons = loadLessons();
    if (category === 'all') {
        return lessons.length;
    }
    return lessons.filter(lesson => lesson.category === category).length;
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Convert video file to base64
 * @param {File} file - Video file
 * @returns {Promise<Object>} Promise that resolves to {data, fileName, size}
 */
function convertVideoToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve({
                data: reader.result,
                fileName: file.name,
                size: file.size
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Validate video file size
 * @param {File} file - Video file
 * @param {number} maxSizeMB - Maximum size in MB (default: 5)
 * @returns {Object} {valid: boolean, message: string}
 */
function validateVideoSize(file, maxSizeMB = 5) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            message: `Video file is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is ${maxSizeMB}MB.`
        };
    }
    return {
        valid: true,
        message: `Video file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
}

/**
 * Check if user is admin
 * @returns {boolean} True if admin is logged in
 */
function isAdmin() {
    return localStorage.getItem(ADMIN_KEY) === 'true';
}

/**
 * Login as admin
 * @param {string} password - Admin password
 * @returns {boolean} True if login successful
 */
function loginAdmin(password) {
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem(ADMIN_KEY, 'true');
        return true;
    }
    return false;
}

/**
 * Logout admin
 */
function logoutAdmin() {
    localStorage.removeItem(ADMIN_KEY);
}

/**
 * Initialize with pre-populated beginner videos
 */
function initializePrePopulatedVideos() {
    const lessons = loadLessons();
    if (lessons.length > 0) {
        return; // Already initialized
    }

    const prePopulatedVideos = [
        // Arts & Crafts
        { category: 'arts-crafts', title: 'Easy Paper Crafts for Beginners', description: 'Learn basic paper folding and crafting techniques', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=21Z4Vu3okws', content: '' },
        { category: 'arts-crafts', title: 'How to Draw - Basic Drawing Techniques', description: 'Introduction to fundamental drawing skills', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=5Vvhe4qdTgo', content: '' },
        { category: 'arts-crafts', title: 'Watercolor Painting for Beginners', description: 'Learn watercolor basics and techniques', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=7ZLL3T7nJ4k', content: '' },
        { category: 'arts-crafts', title: 'DIY Origami - Simple Projects', description: 'Create beautiful origami figures step by step', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=JlJsU8tspfc', content: '' },
        { category: 'arts-crafts', title: 'Knitting 101 - Getting Started', description: 'Basic knitting stitches and techniques for beginners', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=OnW9OMB8kAk', content: '' },
        { category: 'arts-crafts', title: 'Sewing Basics - Hand Stitching', description: 'Learn essential hand sewing stitches', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=O1eTdxucsaE', content: '' },
        { category: 'arts-crafts', title: 'DIY Friendship Bracelets', description: 'Create colorful bracelets with simple patterns', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=Hk5s7A2fGqY', content: '' },
        { category: 'arts-crafts', title: 'Clay Sculpting for Beginners', description: 'Introduction to working with clay', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=5K7v7X2m7qU', content: '' },
        { category: 'arts-crafts', title: 'Candle Making Tutorial', description: 'Learn to make your own scented candles', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=7XWqA2FJqyI', content: '' },
        { category: 'arts-crafts', title: 'DIY Room Decor Ideas', description: 'Easy and affordable home decoration projects', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8XjJ8Q6XqjM', content: '' },
        
        // Coding
        { category: 'coding', title: 'Programming with Python - Full Course for Beginners', description: 'Complete Python programming tutorial for absolute beginners', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw', content: '' },
        { category: 'coding', title: 'JavaScript Crash Course', description: 'Learn JavaScript fundamentals in one video', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c', content: '' },
        { category: 'coding', title: 'HTML & CSS Full Course', description: 'Build websites from scratch with HTML and CSS', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=mU6anWqZJcc', content: '' },
        { category: 'coding', title: 'Java Programming for Beginners', description: 'Introduction to Java programming language', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=eIrMbAQSU34', content: '' },
        { category: 'coding', title: 'C++ Tutorial for Beginners', description: 'Learn C++ programming from scratch', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y', content: '' },
        { category: 'coding', title: 'Git & GitHub for Beginners', description: 'Version control and collaboration basics', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=RGOj5yH7evk', content: '' },
        { category: 'coding', title: 'Web Development Roadmap', description: 'Complete guide to becoming a web developer', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=nkZ5rB3F7_k', content: '' },
        { category: 'coding', title: 'SQL Tutorial for Beginners', description: 'Learn database management with SQL', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', content: '' },
        { category: 'coding', title: 'React.js Crash Course', description: 'Build modern web apps with React', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', content: '' },
        { category: 'coding', title: 'Data Structures and Algorithms', description: 'Fundamental CS concepts explained simply', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', content: '' },
        
        // Cooking
        { category: 'cooking', title: 'Cooking Basics - Knife Skills', description: 'Master essential knife techniques for safe and efficient cooking', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=G-Fg7l7G1zw', content: '' },
        { category: 'cooking', title: 'How to Cook Perfect Rice', description: 'Learn to make fluffy, non-sticky rice every time', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=s6nGqJ7w3go', content: '' },
        { category: 'cooking', title: 'Easy Pancake Recipe', description: 'Simple and delicious pancakes from scratch', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=FLd00Bx4tOk', content: '' },
        { category: 'cooking', title: 'Basic Pasta Making', description: 'Learn to make fresh pasta at home', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=5_dgYFH5QnE', content: '' },
        { category: 'cooking', title: 'How to Cook Eggs - 3 Ways', description: 'Master boiled, scrambled, and fried eggs', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=7XWqA2FJqyI', content: '' },
        { category: 'cooking', title: 'Baking Bread for Beginners', description: 'Simple bread recipe you can make at home', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=2FR6rJqJ7yc', content: '' },
        { category: 'cooking', title: 'Chocolate Chip Cookies Recipe', description: 'Classic cookie recipe that never fails', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=3vUtRRZG0xY', content: '' },
        { category: 'cooking', title: 'Grilling Basics', description: 'Introduction to grilling meats and vegetables', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=4KvJ3a1QnYk', content: '' },
        { category: 'cooking', title: 'Making Healthy Smoothies', description: 'Nutritious smoothie recipes for any time', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8XjJ8Q6XqjM', content: '' },
        { category: 'cooking', title: 'Vegetable Stir-Fry Basics', description: 'Quick and healthy stir-fry techniques', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=1k3w4UJ5K0k', content: '' },
        
        // Languages
        { category: 'languages', title: 'Learn Spanish - Beginners Course', description: 'Complete Spanish course for absolute beginners', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=kJQjXAVEWt0', content: '' },
        { category: 'languages', title: 'French for Beginners', description: 'Start learning French from the basics', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=YdAxN4_0o7Q', content: '' },
        { category: 'languages', title: 'German Language Basics', description: 'Introduction to German for beginners', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=ruZH7Pj2r8E', content: '' },
        { category: 'languages', title: 'Learn Italian - First Steps', description: 'Beginner Italian language course', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=1k3w4UJ5K0k', content: '' },
        { category: 'languages', title: 'Japanese for Beginners', description: 'Start your Japanese learning journey', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8XjJ8Q6XqjM', content: '' },
        { category: 'languages', title: 'Chinese Mandarin Basics', description: 'Learn basic Mandarin Chinese', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=4KvJ3a1QnYk', content: '' },
        { category: 'languages', title: 'Portuguese for Beginners', description: 'Introduction to Portuguese language', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=7n0d0JX7r_s', content: '' },
        { category: 'languages', title: 'Learn Korean - Hangul Basics', description: 'Master the Korean alphabet', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=OFOkctxeZ2k', content: '' },
        { category: 'languages', title: 'Russian for Complete Beginners', description: 'Start learning Russian from scratch', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=p_R1UDsNOMk', content: '' },
        { category: 'languages', title: 'Arabic Language Basics', description: 'Introduction to Arabic for beginners', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=wL0Xb6bC2KY', content: '' },
        
        // Mechanics
        { category: 'mechanics', title: 'Car Maintenance Basics', description: 'Essential car maintenance every driver should know', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=6QqBvy_yO_M', content: '' },
        { category: 'mechanics', title: 'How to Change Oil', description: 'Step-by-step guide to changing your car oil', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=0fEMJp70tGU', content: '' },
        { category: 'mechanics', title: 'Changing a Flat Tire', description: 'Learn to change a tire safely', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=KfnyopxdJXQ', content: '' },
        { category: 'mechanics', title: 'Bicycle Repair Basics', description: 'Basic bike maintenance and repairs', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw', content: '' },
        { category: 'mechanics', title: 'Home Tool Basics', description: 'Essential tools and how to use them', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c', content: '' },
        { category: 'mechanics', title: 'Fixing a Leaky Faucet', description: 'Simple plumbing repair tutorial', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=mU6anWqZJcc', content: '' },
        { category: 'mechanics', title: 'Electrical Safety Basics', description: 'Important electrical safety tips for DIY', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=eIrMbAQSU34', content: '' },
        { category: 'mechanics', title: 'Engine Troubleshooting', description: 'Basic engine problem diagnosis', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y', content: '' },
        { category: 'mechanics', title: 'Brake System Basics', description: 'Understanding how car brakes work', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=RGOj5yH7evk', content: '' },
        { category: 'mechanics', title: 'Welding for Beginners', description: 'Introduction to basic welding techniques', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=nkZ5rB3F7_k', content: '' },
        
        // Math
        { category: 'math', title: 'Algebra Basics', description: 'Introduction to algebra concepts', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=NybHckSEQBI', content: '' },
        { category: 'math', title: 'Geometry for Beginners', description: 'Learn basic geometry shapes and formulas', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=302eJ3TzJQU', content: '' },
        { category: 'math', title: 'Fractions Made Easy', description: 'Understanding and working with fractions', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=4LoyIcQ8Vmc', content: '' },
        { category: 'math', title: 'Basic Statistics', description: 'Introduction to statistics and data analysis', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=uhxtUt_-GyM', content: '' },
        { category: 'math', title: 'Calculus Basics', description: 'Fundamental calculus concepts explained', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=WUvTyaaNkzM', content: '' },
        { category: 'math', title: 'Trigonometry Introduction', description: 'Learn sine, cosine, and tangent basics', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=PJ010m-pcVU', content: '' },
        { category: 'math', title: 'Multiplication Tables', description: 'Master multiplication with fun techniques', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=9XzfQUjjePs', content: '' },
        { category: 'math', title: 'Percentages Explained', description: 'Easy way to understand and calculate percentages', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=rR95CbcjzrU', content: '' },
        { category: 'math', title: 'Introduction to Probability', description: 'Learn probability concepts and calculations', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=KzfWUEJjG18', content: '' },
        { category: 'math', title: 'Linear Equations', description: 'Solving linear equations step by step', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=9XzfQUjjePs', content: '' },
        
        // Science
        { category: 'science', title: 'Biology Basics', description: 'Introduction to life sciences', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=8m6hHRlKwxY', content: '' },
        { category: 'science', title: 'Chemistry Fundamentals', description: 'Learn the basics of chemistry', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=FSyAehMdpyI', content: '' },
        { category: 'science', title: 'Physics for Beginners', description: 'Introduction to physics concepts', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=ZM8ECpBuQYE', content: '' },
        { category: 'science', title: 'Astronomy Basics', description: 'Explore the universe and stars', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=0fEMJp70tGU', content: '' },
        { category: 'science', title: 'Earth Science Introduction', description: 'Understanding our planet', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=KfnyopxdJXQ', content: '' },
        { category: 'science', title: 'Human Anatomy Basics', description: 'Learn about the human body', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=6QqBvy_yO_M', content: '' },
        { category: 'science', title: 'Photosynthesis Explained', description: 'How plants make food', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=sQK3Yr4Sc_k', content: '' },
        { category: 'science', title: 'The Periodic Table', description: 'Understanding chemical elements', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=0fEMJp70tGU', content: '' },
        { category: 'science', title: 'Newton\'s Laws of Motion', description: 'Fundamental physics laws explained', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=KfnyopxdJXQ', content: '' },
        { category: 'science', title: 'Climate Science Basics', description: 'Understanding weather and climate', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=6QqBvy_yO_M', content: '' },
        
        // Reading
        { category: 'reading', title: 'Reading Comprehension Strategies', description: 'Improve your reading skills and understanding', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=wL0Xb6bC2KY', content: '' },
        { category: 'reading', title: 'Phonics for Beginners', description: 'Learn to read with phonics', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=0fEMJp70tGU', content: '' },
        { category: 'reading', title: 'Speed Reading Techniques', description: 'Read faster while maintaining comprehension', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=KfnyopxdJXQ', content: '' },
        { category: 'reading', title: 'Vocabulary Building', description: 'Strategies to expand your vocabulary', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=6QqBvy_yO_M', content: '' },
        { category: 'reading', title: 'Reading Aloud Tips', description: 'Improve your reading aloud skills', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=wL0Xb6bC2KY', content: '' },
        { category: 'reading', title: 'Understanding Literature', description: 'Analyze and appreciate literary works', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=0fEMJp70tGU', content: '' },
        { category: 'reading', title: 'Note-Taking While Reading', description: 'Effective note-taking strategies', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=KfnyopxdJXQ', content: '' },
        { category: 'reading', title: 'Reading for Different Purposes', description: 'Adapt your reading style to your goals', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=6QqBvy_yO_M', content: '' },
        { category: 'reading', title: 'Critical Reading Skills', description: 'Develop analytical thinking through reading', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=wL0Xb6bC2KY', content: '' },
        { category: 'reading', title: 'Reading Fluency Practice', description: 'Improve reading speed and accuracy', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=0fEMJp70tGU', content: '' }
    ];

    // Add IDs and timestamps
    const lessonsWithIds = prePopulatedVideos.map(video => ({
        id: generateId(),
        ...video,
        createdAt: new Date().toISOString()
    }));

    saveLessons(lessonsWithIds);
}

