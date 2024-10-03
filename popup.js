document.getElementById('captureBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "initializeSelection" });
        window.close(); // Close the popup
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "processScreenshot") {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = request.area.width;
            canvas.height = request.area.height;
            ctx.drawImage(img,
                request.area.x, request.area.y, request.area.width, request.area.height,
                0, 0, request.area.width, request.area.height);

            const link = document.createElement('a');
            link.download = 'screenshot.png';
            link.href = canvas.toDataURL();
            link.click();
        };

        img.src = request.screenshotUrl;
    }
});