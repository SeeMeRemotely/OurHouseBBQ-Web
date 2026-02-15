// Google Sheets Menu Loader
// Your published Google Sheet CSV URL
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSobM8bRtCBciTJu4weHyJuklDC70oORiaJsfuI1Zv2blUgWF8-LJv1S7bQ5V8LUL31e6KqtPcQVAP6/pub?gid=339991556&single=true&output=csv';

// Function to load menu from published CSV (simpler method, no API key needed)
async function loadMenuFromCSV() {
    try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        processMenuData(rows);
    } catch (error) {
        console.error('Error loading menu:', error);
        showError();
    }
}

// Simple CSV parser
function parseCSV(text) {
    const lines = text.split('\n');
    return lines.map(line => {
        // Simple CSV parsing (handles basic cases)
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        return values;
    });
}

// Process the menu data and render it
function processMenuData(rows) {
    hideLoading();
    
    // Expected columns: Category, Item Name, Description, Price, Image URL, Badge, Active, Sold Out
    const headers = rows[0];
    const menuData = {};
    
    // Group items by category
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 4) continue; // Skip empty rows
        
        const category = row[0] || '';
        const itemName = row[1] || '';
        const description = row[2] || '';
        const price = row[3] || '';
        const imageUrl = row[4] || '';
        const badge = row[5] || '';
        const active = (row[6] || '').toLowerCase();
        const soldOut = (row[7] || '').toLowerCase();
        
        if (!category || !itemName) continue; // Skip if missing essential data
        
        // Skip inactive items (only show if Active is 'y' or 'yes' or empty/null)
        if (active && active !== 'y' && active !== 'yes') continue;
        
        if (!menuData[category]) {
            menuData[category] = [];
        }
        
        // Determine if item is sold out
        const isSoldOut = soldOut === 'y' || soldOut === 'yes';
        
        menuData[category].push({
            name: itemName,
            description: description,
            price: price,
            image: imageUrl,
            badge: badge,
            soldOut: isSoldOut
        });
    }
    
    renderMenu(menuData);
}

// Render the menu on the page
function renderMenu(menuData) {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    
    // Define category order and styles
    const categoryStyles = {
        'Sandwiches': 'Choice of 1 Side',
        'Gettin\' Loaded': 'Choice of 1 Meat (Brisket & Pork Belly $3 upcharge)',
        'By The LB': '',
        'Plates': 'Choice of 2 Sides',
        'Sides': '',
        'Family Packs': '',
        'Young Guns': 'Kids Menu',
        'Smokehouse Sauces': '',
        'Drinks': ''
    };
    
    // Render each category
    for (const [category, items] of Object.entries(menuData)) {
        const section = document.createElement('section');
        section.className = 'menu-section';
        
        let sectionHTML = `
            <h2 class="section-title">${category}</h2>
        `;
        
        if (categoryStyles[category]) {
            sectionHTML += `<p class="section-subtitle">${categoryStyles[category]}</p>`;
        }
        
        // Determine if this is a compact or full layout category
        const compactCategories = ['By The LB', 'Sides', 'Young Guns', 'Smokehouse Sauces', 'Drinks'];
        const isCompact = compactCategories.includes(category);
        
        if (isCompact) {
            sectionHTML += '<div class="menu-items-compact">';
            items.forEach(item => {
                sectionHTML += renderCompactItem(item);
            });
            sectionHTML += '</div>';
        } else {
            sectionHTML += '<div class="menu-items">';
            items.forEach(item => {
                sectionHTML += renderFullItem(item);
            });
            sectionHTML += '</div>';
        }
        
        section.innerHTML = sectionHTML;
        container.appendChild(section);
    }
}

// Render a full menu item with image
function renderFullItem(item) {
    const imageStyle = item.image 
        ? `background: url('${item.image}') center/cover;` 
        : `background: linear-gradient(135deg, ${getRandomGradient()});`;
    
    const badge = item.badge ? `<span class="item-badge">${item.badge}</span>` : '';
    const soldOutOverlay = item.soldOut ? `<div class="sold-out-overlay">SOLD OUT</div>` : '';
    const highlight = item.badge ? 'highlight' : '';
    const soldOutClass = item.soldOut ? 'sold-out' : '';
    
    // Check if this is a family pack (has list items in description)
    const hasListItems = item.description.includes('•') || item.description.includes('\n-');
    let descriptionHTML = '';
    
    if (hasListItems) {
        const lines = item.description.split('\n').filter(line => line.trim());
        const intro = lines[0];
        const listItems = lines.slice(1);
        
        descriptionHTML = `
            <p class="item-description">${intro}</p>
            <ul class="item-features">
                ${listItems.map(line => `<li>${line.replace(/^[•\-]\s*/, '')}</li>`).join('')}
            </ul>
        `;
    } else {
        descriptionHTML = `<p class="item-description">${item.description}</p>`;
    }
    
    return `
        <div class="menu-item ${highlight} ${soldOutClass}">
            <div class="menu-item-image" style="${imageStyle}">
                ${badge}
                ${soldOutOverlay}
            </div>
            <div class="menu-item-content">
                <div class="item-header">
                    <h3>${item.name}${item.soldOut ? ' <span class="sold-out-text">(Sold Out)</span>' : ''}</h3>
                    ${item.price ? `<span class="item-price">${item.price}</span>` : ''}
                </div>
                ${descriptionHTML}
            </div>
        </div>
    `;
}

// Render a compact menu item
function renderCompactItem(item) {
    const soldOutClass = item.soldOut ? 'sold-out' : '';
    const soldOutText = item.soldOut ? ' <span class="sold-out-text">(Sold Out)</span>' : '';
    
    return `
        <div class="compact-item ${soldOutClass}">
            <div class="item-header">
                <h3>${item.name}${soldOutText}</h3>
                ${item.price ? `<span class="item-price">${item.price}</span>` : ''}
            </div>
            ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
        </div>
    `;
}

// Get random gradient for items without images
function getRandomGradient() {
    const gradients = [
        '#8B4513 0%, #654321 100%',
        '#A0522D 0%, #8B4513 100%',
        '#CD853F 0%, #A0522D 100%',
        '#D2691E 0%, #CD853F 100%',
        '#B8860B 0%, #DAA520 100%',
        '#8B0000 0%, #654321 100%'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
}

// Show/hide loading and error states
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
}

// Initialize menu loading when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadMenuFromCSV();
});
