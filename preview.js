let screenshotDataUrl;

document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({ action: "getScreenshot" }, (response) => {
        if (response && response.dataUrl) {
            screenshotDataUrl = response.dataUrl;
            const previewImg = document.getElementById('preview');
            previewImg.src = screenshotDataUrl;
            previewImg.style.width = `${response.width}px`;
            previewImg.style.height = `${response.height}px`;
        }
    });

    document.getElementById('download').addEventListener('click', () => {
        if (screenshotDataUrl) {
            const link = document.createElement('a');
            link.href = screenshotDataUrl;
            link.download = 'screenshot.png';
            link.click();
        }
    });

    document.getElementById('retake').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "retakeScreenshot" }, () => {
            window.close();
        });
    });
});