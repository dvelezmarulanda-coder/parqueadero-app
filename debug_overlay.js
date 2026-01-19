(function () {
    // Create debug container
    const debugContainer = document.createElement('div');
    debugContainer.id = 'debug-overlay';
    debugContainer.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 200px;
        background: rgba(0, 0, 0, 0.85);
        color: #ff4444;
        font-family: monospace;
        font-size: 12px;
        padding: 10px;
        overflow-y: auto;
        z-index: 10000;
        border-top: 2px solid #ff0000;
        pointer-events: none;
        display: none; 
    `;
    document.body.appendChild(debugContainer);

    function showDebug() {
        debugContainer.style.display = 'block';
        debugContainer.style.pointerEvents = 'auto';
    }

    function logError(source, message) {
        showDebug();
        const line = document.createElement('div');
        line.style.borderBottom = '1px solid #333';
        line.style.padding = '2px 0';
        line.innerHTML = `<strong>[${source}]</strong> ${message}`;
        debugContainer.prepend(line);
    }

    // Capture Global Errors
    window.onerror = function (msg, url, lineNo, columnNo, error) {
        logError('Global Error', `${msg} <br/> <small>${url}:${lineNo}:${columnNo}</small>`);
        return false;
    };

    // Capture Unhandled Rejections (Promises)
    window.onunhandledrejection = function (event) {
        logError('Unhandled Promise', event.reason);
    };

    // Override Console.error
    const originalError = console.error;
    console.error = function (...args) {
        logError('Console Error', args.join(' '));
        originalError.apply(console, args);
    };

    // Override Console.warn
    const originalWarn = console.warn;
    console.warn = function (...args) {
        // Optional: show warnings too if needed, or just log to console
        // logError('Console Warn', args.join(' ')); 
        originalWarn.apply(console, args);
    };

    console.log('🐞 Debug Overlay Initialized');
})();
