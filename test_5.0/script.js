// Initial transparent image (1x1 transparent pixel, alpha=0)
const blankWhiteImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NgAAIAAAUAAR4f7BQAAAAASUVORK5CYII=';

// Transparent pixel for cleared state
const transparentImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NgAAIAAAUAAR4f7BQAAAAASUVORK5CYII=';

// Color mapping
const colorMap = {
    'red': '#E74C3C',
    'yellow': '#F1C40F',
    'green': '#2ECC71',
    'blue': '#3498DB'
};

// Get all cards and initialize each one
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    // Get elements scoped to this specific card
    const smallCards = card.querySelectorAll('.small-card');
    const largeCardImg = card.querySelector('.large-card img');
    const colorButtons = card.querySelectorAll('.color-button');
    const clearButton = card.querySelector('.clear-button');
    
    // Set initial blank white image for this card
    largeCardImg.src = blankWhiteImage;
    
    // Add click event listener to each small card in this card
    smallCards.forEach(smallCard => {
        smallCard.addEventListener('click', () => {
            // Remove active class from all small cards in this card only
            smallCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            smallCard.classList.add('active');
            
            // Get the background image from the clicked card's computed styles
            const computedStyle = window.getComputedStyle(smallCard);
            const backgroundImage = computedStyle.backgroundImage;
            
            // Extract the URL from background-image (removes 'url("...")' wrapper)
            const imageUrl = backgroundImage.slice(5, -2);
            
            // Set the large card image source
            largeCardImg.src = imageUrl;
            largeCardImg.alt = `Selected: ${smallCard.dataset.key}`;
        });
    });
    
    // Add click event listener to each color button in this card
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const colorName = button.dataset.color;
            const colorValue = colorMap[colorName];
            
            // Set background color only (keeps the selected rhythm image)
            largeCardImg.style.backgroundColor = colorValue;
        });
    });
    
    // Add click event listener to clear button in this card
    clearButton.addEventListener('click', () => {
        // Remove active class from all small cards in this card only
        smallCards.forEach(c => c.classList.remove('active'));
        
        // Reset image to transparent pixel
        largeCardImg.src = transparentImage;
        
        // Remove background color
        largeCardImg.style.backgroundColor = '';
    });
});
