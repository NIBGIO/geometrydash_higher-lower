//Author: NIBGIO
//Creation Date: 07.01.2026



// ================================
// GAME STATE & DATA
// ================================

let allLevels = [];
let currentLevel = null;
let nextLevel = null;
let score = 0;
let highScore = localStorage.getItem('gdHighScore') || 0;
let gameOver = false;
let isLoading = true;

// Base URLs
const AREDL_API_URL = 'https://api.aredl.net/v2/api/aredl/levels';
const THUMBNAIL_BASE = 'https://raw.githubusercontent.com/All-Rated-Extreme-Demon-List/Thumbnails/main/levels/full';

// HTML Element References
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const nameElementA = document.getElementById('nameA');
const rankElementA = document.getElementById('rankA');
const nameElementB = document.getElementById('nameB');
const rankElementB = document.getElementById('rankB');
const higherButton = document.getElementById('higherBtn');
const lowerButton = document.getElementById('lowerBtn');
const nextButton = document.getElementById('nextBtn');
const restartGameButton = document.getElementById('restartGameBtn');
const thanNameElement = document.getElementById('thanName');
const videoOverlayA = document.getElementById('videoOverlayA');
const videoOverlayB = document.getElementById('videoOverlayB');
const isTextElement = document.getElementById('isText');
const thanTextElement = document.getElementById('thanText');
const questionElements = document.getElementById('questionElements');

// ================================
// API & DATA FUNCTIONS
// ================================

async function fetchAllLevels() {
    try {
        console.log('Fetching levels from AREDL API...');
        const response = await fetch(AREDL_API_URL);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response sample:', data[0]); // Log first level to see structure
        
        // Filter for extreme demons
        const extremeDemons = data
            .filter(level => level.position)
            .sort((a, b) => a.position - b.position)
            .map(level => {
                // Try to extract video information from level data
                let videoUrl = null;
                
                // Check if the level has a video field in the API
                if (level.video) {
                    // If it's a full URL, use it directly
                    if (level.video.includes('youtube.com') || level.video.includes('youtu.be')) {
                        videoUrl = level.video;
                    } 
                    // If it's just a video ID, construct the URL
                    else if (level.video.length === 11) { // YouTube IDs are 11 characters
                        videoUrl = `https://www.youtube.com/watch?v=${level.video}`;
                    }
                }
                
                // If no video from API, try the hardcoded map
                if (!videoUrl) {
                    videoUrl = getVideoForLevel(level.name);
                }
                
                return {
                    id: level.level_id,
                    name: level.name,
                    rank: level.position,
                    video: videoUrl
                };
            });
        
        console.log(`Loaded ${extremeDemons.length} extreme demons`);
        return extremeDemons;
        
    } catch (error) {
        console.error('Failed to fetch levels from API:', error);
        return getFallbackLevels();
    }
}

function getVideoForLevel(levelName) {
    const videoMap = {
        'Acheron': 'https://www.youtube.com/watch?v=sBKR6aUorzA',
        'Silent clubstep': 'https://www.youtube.com/watch?v=GR4OMkS3SN8',
        'Slaughterhouse': 'https://www.youtube.com/watch?v=kpcF1-QAHQc',
        'Abyss of Darkness': 'https://www.youtube.com/watch?v=ejJkpqcMMCY',
        'Kyouki': 'https://www.youtube.com/watch?v=KDa5c0CJTHs',
        'Tartarus': 'https://www.youtube.com/watch?v=8CQeHhF1MQQ',
        'Bloodbath': 'https://www.youtube.com/watch?v=al5sOhKj9R8',
        'The Golden': 'https://www.youtube.com/watch?v=zyFvO5c8-5E',
        'Codependence': 'https://www.youtube.com/watch?v=9dT2o6L6k2c',
        'The Lightning Rod': 'https://www.youtube.com/watch?v=QoZhE8WqKcM'
    };
    return videoMap[levelName] || null;
}

function getFallbackLevels() {
    return [
        { id: 73667628, name: "Acheron", rank: 1, video: "https://www.youtube.com/watch?v=sBKR6aUorzA" },
        { id: 4125776, name: "Silent clubstep", rank: 2, video: "https://www.youtube.com/watch?v=GR4OMkS3SN8" },
        { id: 64429030, name: "Slaughterhouse", rank: 3, video: "https://www.youtube.com/watch?v=kpcF1-QAHQc" },
        { id: 76687917, name: "Abyss of Darkness", rank: 4, video: "https://www.youtube.com/watch?v=ejJkpqcMMCY" },
        { id: 73801713, name: "Kyouki", rank: 5, video: "https://www.youtube.com/watch?v=KDa5c0CJTHs" },
        { id: 75364906, name: "Codependence", rank: 6, video: "https://www.youtube.com/watch?v=9dT2o6L6k2c" },
        { id: 54042744, name: "Tartarus", rank: 7, video: "https://www.youtube.com/watch?v=8CQeHhF1MQQ" },
        { id: 70407397, name: "The Golden", rank: 8, video: "https://www.youtube.com/watch?v=zyFvO5c8-5E" },
        { id: 10565740, name: "Bloodbath", rank: 9, video: "https://www.youtube.com/watch?v=al5sOhKj9R8" },
        { id: 78492218, name: "The Lightning Rod", rank: 10, video: "https://www.youtube.com/watch?v=QoZhE8WqKcM" }
    ];
}

function getThumbnailUrl(level) {
    if (!level || !level.id) return '';
    return `${THUMBNAIL_BASE}/${level.id}.webp`;
}

function applyThumbnail(containerId, level) {
    if (!containerId || !level) return;
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const thumbnailUrl = getThumbnailUrl(level);
    const testImage = new Image();
    
    testImage.onload = function() {
        container.style.backgroundImage = `url('${thumbnailUrl}')`;
        console.log(`Thumbnail loaded for ${level.name}`);
    };
    testImage.onerror = function() {
        // Fallback gradient if image fails to load
        container.style.backgroundImage = 'linear-gradient(135deg, #4a4a8a 0%, #2a2a5a 100%)';
    };
    testImage.src = thumbnailUrl;
}

// ================================
// CORE GAME FUNCTIONS
// ================================

function getRandomLevel() {
    if (allLevels.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * allLevels.length);
    return allLevels[randomIndex];
}

function showQuestionElements() {
    // Show VS circle
    document.querySelector('.vs-container').style.display = 'flex';
    
    // Show question elements
    isTextElement.style.display = 'block';
    questionElements.style.display = 'flex';
    thanTextElement.style.display = 'block';
    
    // Hide action buttons
    nextButton.style.display = 'none';
    restartGameButton.style.display = 'none';
    
    // Enable choice buttons
    higherButton.disabled = false;
    lowerButton.disabled = false;
}

function hideQuestionElements() {
    // Hide question elements
    isTextElement.style.display = 'none';
    questionElements.style.display = 'none';
    thanTextElement.style.display = 'none';
}

async function startNewRound() {
    if (isLoading) return;

    if (gameOver) {
        await resetGame();
        return;
    }

    // Set next level from last round as current level
    if (nextLevel) {
        currentLevel = nextLevel;
    } else {
        currentLevel = getRandomLevel();
        if (!currentLevel) {
            console.error('Error: No levels available');
            return;
        }
    }
    
    thanNameElement.textContent = currentLevel.name;

    // Pick a new next level (different from current)
    let attempts = 0;
    do {
        nextLevel = getRandomLevel();
        attempts++;
        if (attempts > 20) break;
    } while (nextLevel && nextLevel.name === currentLevel.name);

    if (!nextLevel) {
        console.error('Error: Could not find a new level');
        return;
    }

    // Reset UI state for new round
    showQuestionElements();
    
    // Reset button styles
    higherButton.style.boxShadow = "";
    lowerButton.style.boxShadow = "";
    
    // Update Current Level (LEFT IMAGE)
    nameElementA.textContent = currentLevel.name;
    rankElementA.textContent = `#${currentLevel.rank}`;
    applyThumbnail('imageA', currentLevel);
    
    // Update Next Level (RIGHT IMAGE)
    nameElementB.textContent = nextLevel.name;
    rankElementB.textContent = "#?";
    applyThumbnail('imageB', nextLevel);
    
    // Update video placeholders
    updateVideoLinks();
}

function updateVideoLinks() {
    // Helper function to create search URL
    function createYouTubeSearchUrl(levelName) {
        // Create a search query that looks for verified completions
        const searchTerms = [
            levelName,
            "verified"
        ].join(" ");
        
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`;
    }
    
    // Current level video (LEFT SIDE)
    if (currentLevel && currentLevel.name) {
        const youtubeLink = videoOverlayA.querySelector('.youtube-button');
        youtubeLink.href = createYouTubeSearchUrl(currentLevel.name);
        videoOverlayA.classList.remove('no-video');
        youtubeLink.target = "_blank"; // Ensure it opens in new tab
    } else {
        const youtubeLink = videoOverlayA.querySelector('.youtube-button');
        youtubeLink.href = '#';
        videoOverlayA.classList.add('no-video');
    }
    
    // Next level video (RIGHT SIDE)
    if (nextLevel && nextLevel.name) {
        const youtubeLink = videoOverlayB.querySelector('.youtube-button');
        youtubeLink.href = createYouTubeSearchUrl(nextLevel.name);
        videoOverlayB.classList.remove('no-video');
        youtubeLink.target = "_blank"; // Ensure it opens in new tab
    } else {
        const youtubeLink = videoOverlayB.querySelector('.youtube-button');
        youtubeLink.href = '#';
        videoOverlayB.classList.add('no-video');
    }
}

function checkGuess(guess) {
    if (gameOver || !currentLevel || !nextLevel) return;

    // Reveal the hidden rank on the right card
    rankElementB.textContent = `#${nextLevel.rank}`;

    // Hide question elements after making a guess
    hideQuestionElements();

    // Game logic
    let correctAnswer;
    
    if (nextLevel.rank < currentLevel.rank) {
        correctAnswer = 'higher';
    } else if (nextLevel.rank > currentLevel.rank) {
        correctAnswer = 'lower';
    } else {
        correctAnswer = guess;
    }

    // Check if guess was correct
    if (guess === correctAnswer) {
        // CORRECT
        score++;
        scoreElement.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('gdHighScore', highScore);
        }
        
        // Show NEXT LEVEL button
        nextButton.style.display = "flex";
        restartGameButton.style.display = "none";
    } else {
        // WRONG - GAME OVER
        gameOver = true;
        
        // Show RESTART button
        nextButton.style.display = "none";
        restartGameButton.style.display = "flex";
        
        // Briefly show the correct answer
        const correctButton = correctAnswer === 'higher' ? higherButton : lowerButton;
        correctButton.style.boxShadow = "0 0 20px #00ffcc";
        
        setTimeout(() => {
            correctButton.style.boxShadow = "";
        }, 1500);
    }
}

async function resetGame() {
    score = 0;
    gameOver = false;
    currentLevel = null;
    nextLevel = null;
    scoreElement.textContent = "0";
    
    // Reset button visibility
    nextButton.style.display = "none";
    restartGameButton.style.display = "none";
    
    // If levels aren't loaded yet, wait for them
    if (allLevels.length === 0) return;
    
    await startNewRound();
}

// ================================
// INITIALIZATION
// ================================

async function initGame() {
    isLoading = true;
    console.log('Loading AREDL data...');
    highScoreElement.textContent = highScore;
    
    try {
        allLevels = await fetchAllLevels();
        if (allLevels.length === 0) {
            allLevels = getFallbackLevels();
            console.log('Using fallback levels');
        }
        
        console.log(`Game initialized with ${allLevels.length} levels`);
        console.log('Sample level with video:', allLevels.find(level => level.video));
        
        isLoading = false;
        await resetGame();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        console.log('Failed to load levels. Using fallback.');
        allLevels = getFallbackLevels();
        isLoading = false;
        await resetGame();
    }
}

// ================================
// EVENT LISTENERS
// ================================

higherButton.addEventListener('click', () => checkGuess('higher'));
lowerButton.addEventListener('click', () => checkGuess('lower'));
nextButton.addEventListener('click', () => startNewRound());
restartGameButton.addEventListener('click', () => resetGame());

// ================================
// START THE GAME!
// ================================


window.addEventListener('DOMContentLoaded', initGame);
