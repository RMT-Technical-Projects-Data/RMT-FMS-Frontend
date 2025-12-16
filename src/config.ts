// Global API Configuration
// You can toggle these comments to switch between environments manually if needed,
// but the dynamic configuration below handles standard Local vs Deployment automatically.

// Force Production (Uncomment if testing Prod DB from Localhost)
// Force Production (Uncomment if testing Prod DB from Localhost)
// export const API_BASE_URL = "https://rmtfms.duckdns.org/api";

// Force Local (Uncomment if needed)
// export const API_BASE_URL = "http://localhost:3000/api";

// Dynamic Configuration (Default)
export const API_BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:3000/api"
        : "https://rmtfms.duckdns.org/api";
