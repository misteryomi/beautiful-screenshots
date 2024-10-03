let currentScreenshotData = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureArea") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, function (dataUrl) {
            cropScreenshot(dataUrl, request.area).then(croppedDataUrl => {
                currentScreenshotData = {
                    dataUrl: croppedDataUrl,
                    width: Math.round(request.area.width / request.area.dpr),
                    height: Math.round(request.area.height / request.area.dpr)
                };
                chrome.windows.create({
                    url: chrome.runtime.getURL("preview.html"),
                    type: "popup",
                    width: Math.min(800, currentScreenshotData.width + 40),
                    height: Math.min(600, currentScreenshotData.height + 80)
                });
            }).catch(error => {
                console.error('Error cropping screenshot:', error);
            });
        });
    } else if (request.action === "getScreenshot") {
        sendResponse(currentScreenshotData);
        return true;
    } else if (request.action === "retakeScreenshot") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "initializeSelection" });
        });
    }
    return true;
});

function cropScreenshot(dataUrl, area) {
    return new Promise((resolve, reject) => {
        fetch(dataUrl)
            .then(response => response.blob())
            .then(blob => createImageBitmap(blob))
            .then(imageBitmap => {
                const canvas = new OffscreenCanvas(area.width, area.height);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(imageBitmap, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
                return canvas.convertToBlob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            })
            .catch(reject);
    });
}