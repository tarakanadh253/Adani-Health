try {
    const aps = require('./server/aps-service.cjs');
    console.log("Service loaded successfully");
} catch (e) {
    console.error("Error loading service:", e);
}
