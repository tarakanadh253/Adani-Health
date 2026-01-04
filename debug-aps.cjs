try {
    console.log("Loading aps-service...");
    const aps = require('./server/aps-service.cjs');
    console.log("Service loaded:", aps);
} catch (e) {
    console.error("CRITICAL ERROR:", e);
}
