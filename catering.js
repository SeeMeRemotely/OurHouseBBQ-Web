const config = window.CATERING_CONFIG || {};
const menuStatusEl = document.getElementById("menuStatus");
const menuContainerEl = document.getElementById("menuContainer");
const formEl = document.getElementById("cateringForm");
const formMessageEl = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");

let activeMenuItems = [];

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase();
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function parseCSV(text) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter(line => line.trim() !== "");

  if (!lines.length) return [];

  const headers = parseCSVLine(lines[0]).map(normalizeHeader);

  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = (values[index] || "").trim();
    });
    return row;
  });
}

function isYes(value) {
  return String(value || "").trim().toLowerCase() === "y";
}

function buildMenuItem(row, index) {
  return {
    id: `item_${index + 1}`,
    category: row["category"] || "Other",
    name: row["item name"] || "",
    description: row["description"] || "",
    price: row["price"] || "",
    badge: row["badge"] || "",
    active: isYes(row["active"]),
    soldOut: isYes(row["sold out"])
  };
}

function groupByCategory(items) {
  const map = new Map();

  items.forEach(item => {
    if (!map.has(item.category)) {
      map.set(item.category, []);
    }
    map.get(item.category).push(item);
  });

  return Array.from(map.entries());
}

function renderMenu(items) {
  if (!items.length) {
    menuStatusEl.textContent = "No active catering items are available right now.";
    return;
  }

  menuStatusEl.style.display = "none";

  const grouped = groupByCategory(items);

  menuContainerEl.innerHTML = grouped.map(([category, categoryItems]) => `
    <section class="category-block">
      <div class="category-title">${escapeHtml(category)}</div>
      <div class="item-list">
        ${categoryItems.map(item => `
          <div class="menu-item">
            <div class="item-main">
              <div class="item-topline">
                <div class="item-name">${escapeHtml(item.name)}</div>
                ${item.price ? `<div class="item-price">${escapeHtml(item.price)}</div>` : ""}
                ${item.badge ? `<div class="item-badge">${escapeHtml(item.badge)}</div>` : ""}
              </div>
              ${item.description ? `<div class="item-desc">${escapeHtml(item.description)}</div>` : ""}
            </div>
            <div class="qty-wrap">
              <label for="${escapeHtml(item.id)}">Quantity</label>
              <input
                id="${escapeHtml(item.id)}"
                class="qty-input"
                type="number"
                min="0"
                max="1000"
                step="1"
                inputmode="numeric"
                data-item-name="${escapeHtml(item.name)}"
                data-item-category="${escapeHtml(item.category)}"
                data-item-price="${escapeHtml(item.price)}"
                value="0"
              />
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `).join("");
}

async function loadMenu() {
  try {
    const response = await fetch(config.menuCsvUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Menu fetch failed: ${response.status}`);

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    activeMenuItems = rows
      .map(buildMenuItem)
      .filter(item => item.name && item.active && !item.soldOut);

    renderMenu(activeMenuItems);
  } catch (error) {
    console.error(error);
    menuStatusEl.textContent = "We couldn't load the catering menu right now. Please try again later.";
  }
}

function getRequestedItems() {
  const inputs = Array.from(document.querySelectorAll(".qty-input"));

  return inputs
    .map(input => {
      let quantity = Number(input.value || 0);

      if (!Number.isFinite(quantity) || quantity < 0) quantity = 0;
      if (quantity > 1000) quantity = 1000;
      quantity = Math.floor(quantity);

      input.value = String(quantity);

      return {
        category: input.dataset.itemCategory || "",
        name: input.dataset.itemName || "",
        price: input.dataset.itemPrice || "",
        quantity
      };
    })
    .filter(item => item.quantity > 0);
}

function setMessage(text, type = "") {
  formMessageEl.textContent = text;
  formMessageEl.className = `form-message ${type}`.trim();
}

function validateForm(data) {
  if (!data.customerName.trim()) return "Please enter your name.";
  if (!data.customerPhone.trim()) return "Please enter your phone number.";
  if (!data.customerEmail.trim()) return "Please enter your email address.";
  if (!data.eventDate.trim()) return "Please select an event date.";
  if (!data.serviceType.trim()) return "Please choose pickup or delivery.";
  if (!data.items.length) return "Please add at least one requested item.";
  return "";
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");

  const payload = {
    customerName: document.getElementById("customerName").value.trim(),
    customerPhone: document.getElementById("customerPhone").value.trim(),
    customerEmail: document.getElementById("customerEmail").value.trim(),
    eventName: document.getElementById("eventName").value.trim(),
    eventDate: document.getElementById("eventDate").value,
    eventTime: document.getElementById("eventTime").value,
    serviceType: document.getElementById("serviceType").value,
    guestCount: document.getElementById("guestCount").value.trim(),
    eventAddress: document.getElementById("eventAddress").value.trim(),
    notes: document.getElementById("notes").value.trim(),
    website: document.getElementById("website").value.trim(),
    items: getRequestedItems()
  };

  const validationError = validateForm(payload);
  if (validationError) {
    setMessage(validationError, "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  try {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || "Request failed.");
    }

    formEl.reset();
    Array.from(document.querySelectorAll(".qty-input")).forEach(input => {
      input.value = "0";
    });

    setMessage("Thanks — your catering request has been sent. We’ll contact you to confirm details.", "success");
  } catch (error) {
    console.error(error);
    setMessage("Sorry, something went wrong sending your request. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Catering Request";
  }
});

loadMenu();
