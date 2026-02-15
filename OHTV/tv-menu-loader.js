// TV Menu Loader for Our House BBQ
// Your published Google Sheet CSV URL

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSobM8bRtCBciTJu4weHyJuklDC70oORiaJsfuI1Zv2blUgWF8-LJv1S7bQ5V8LUL31e6KqtPcQVAP6/pub?gid=339991556&single=true&output=csv';

// Load menu from published CSV
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

// Process menu data
function processMenuData(rows) {
    hideLoading();
    
    const menuData = {};
    
    // Group items by category (skip header row)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 4) continue;
        
        const category = row[0] || '';
        const itemName = row[1] || '';
        const description = row[2] || '';
        const price = row[3] || '';
        const imageUrl = row[4] || '';
        const badge = row[5] || '';
        const active = (row[6] || '').toLowerCase();
        const soldOut = (row[7] || '').toLowerCase();
        
        if (!category || !itemName) continue;
        
        // Skip inactive items
        if (active && active !== 'y' && active !== 'yes') continue;
        
        if (!menuData[category]) {
            menuData[category] = [];
        }
        
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
    
    // Auto-refresh every 5 minutes to get updates
    setTimeout(loadMenuFromCSV, 5 * 60 * 1000);
}

// Render menu for TV display
function renderMenu(menuData) {
    const container = document.getElementById('tv-menu-container');
    container.innerHTML = '';
    
    // Category subtitles
    const categorySubtitles = {
        'Sandwiches': 'Choice of 1 Side',
        'Gettin\' Loaded': 'Choice of 1 Meat (Brisket & Pork Belly $3 upcharge)',
        'Plates': 'Choice of 2 Sides'
    };
    
    // Compact layout categories
    const compactCategories = ['By The LB', 'Sides', 'Young Guns', 'Smokehouse Sauces', 'Drinks'];
    
    for (const [category, items] of Object.entries(menuData)) {
        const section = document.createElement('div');
        section.className = 'tv-section';
        
        let html = `<h2 class="tv-section-title">${category}</h2>`;
        
        if (categorySubtitles[category]) {
            html += `<p class="tv-section-subtitle">${categorySubtitles[category]}</p>`;
        }
        
        const isCompact = compactCategories.includes(category);
        
        if (isCompact) {
            html += '<div class="tv-items-compact">';
            items.forEach(item => {
                html += renderCompactItem(item);
            });
            html += '</div>';
        } else {
            html += '<div class="tv-items">';
            items.forEach(item => {
                html += renderFullItem(item);
            });
            html += '</div>';
        }
        
        section.innerHTML = html;
        container.appendChild(section);
    }
}

// Render full item for TV
function renderFullItem(item) {
    const soldOutClass = item.soldOut ? 'sold-out' : '';
    const soldOutBadge = item.soldOut ? '<span class="tv-sold-out-badge">Sold Out</span>' : '';
    const badge = item.badge && !item.soldOut ? `<span class="tv-item-badge">${item.badge}</span>` : '';
    
    // Check for list items in description
    const hasListItems = item.description.includes('•') || item.description.includes('\n-');
    let descriptionHTML = '';
    
    if (hasListItems) {
        const lines = item.description.split('\n').filter(line => line.trim());
        const intro = lines[0];
        const listItems = lines.slice(1);
        
        descriptionHTML = `
            <div class="tv-item-description">${intro}</div>
            <ul class="tv-item-features">
                ${listItems.map(line => `<li>${line.replace(/^[•\-]\s*/, '')}</li>`).join('')}
            </ul>
        `;
    } else if (item.description) {
        descriptionHTML = `<div class="tv-item-description">${item.description}</div>`;
    }
    
    return `
        <div class="tv-item ${soldOutClass}">
            <div class="tv-item-info">
                <div class="tv-item-header">
                    <span class="tv-item-name">${item.name}</span>
                    ${badge}
                    ${soldOutBadge}
                </div>
                ${descriptionHTML}
            </div>
            ${item.price ? `<div class="tv-item-price">${item.price}</div>` : ''}
        </div>
    `;
}

// Render compact item for TV
function renderCompactItem(item) {
    const soldOutClass = item.soldOut ? 'sold-out' : '';
    const soldOutBadge = item.soldOut ? '<span class="tv-sold-out-badge">Sold Out</span>' : '';
    
    return `
        <div class="tv-item-compact ${soldOutClass}">
            <span class="tv-item-name">${item.name}</span>
            ${soldOutBadge}
            ${item.price ? `<div class="tv-item-price">${item.price}</div>` : ''}
            ${item.description ? `<div class="tv-item-description">${item.description}</div>` : ''}
        </div>
    `;
}

// Show/hide loading
function hideLoading() {
    document.getElementById('tv-loading').style.display = 'none';
}

function showError() {
    document.getElementById('tv-loading').style.display = 'none';
    document.getElementById('tv-error').style.display = 'flex';
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadMenuFromCSV();
});
