let isSelecting = false;
let startX, startY;
let overlay, selection;

function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'screenshot-overlay';
    document.body.appendChild(overlay);

    selection = document.createElement('div');
    selection.className = 'screenshot-selection';
    overlay.appendChild(selection);

    overlay.addEventListener('mousedown', startSelection);
    overlay.addEventListener('mousemove', updateSelection);
    overlay.addEventListener('mouseup', endSelection);
}

function startSelection(e) {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    selection.style.left = startX + 'px';
    selection.style.top = startY + 'px';
}

function updateSelection(e) {
    if (!isSelecting) return;

    let currentX = e.clientX;
    let currentY = e.clientY;

    let width = Math.abs(currentX - startX);
    let height = Math.abs(currentY - startY);

    selection.style.width = width + 'px';
    selection.style.height = height + 'px';
    selection.style.left = (currentX > startX ? startX : currentX) + 'px';
    selection.style.top = (currentY > startY ? startY : currentY) + 'px';
}

function endSelection(e) {
    isSelecting = false;
    let rect = selection.getBoundingClientRect();
    let scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    let scrollY = window.pageYOffset || document.documentElement.scrollTop;
    let dpr = window.devicePixelRatio || 1;

    // Remove the overlay and selection
    removeOverlay();

    // Wait for the overlay to be fully removed
    setTimeout(() => {
        chrome.runtime.sendMessage({
            action: "captureArea",
            area: {
                x: Math.round((rect.left + scrollX) * dpr),
                y: Math.round((rect.top + scrollY) * dpr),
                width: Math.round(rect.width * dpr),
                height: Math.round(rect.height * dpr),
                dpr: dpr
            }
        });
    }, 100);  // Increased timeout to ensure overlay is fully removed
}

function removeOverlay() {
    if (overlay) {
        document.body.removeChild(overlay);
        overlay = null;
        selection = null;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "initializeSelection") {
        createOverlay();
    }
});