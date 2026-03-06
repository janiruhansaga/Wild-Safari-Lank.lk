// Google Apps Script - Secure Admin API & Webhook Logger
//
// DEPLOY INSTRUCTIONS:
// 1. Paste this code into Extensions -> Apps Script (replacing any existing code).
// 2. Click "Deploy" -> "New Deployment".
// 3. Select "Web app", Execute as "Me", Who has access "Anyone".
// 4. Copy the resulting Web App URL.
// 5. Use this Web App URL in your admin.html login page and in your index.html form action!

const ADMIN_USER = "admin"; // CHANGE THIS USERNAME
const ADMIN_TOKEN = "admin123"; // CHANGE THIS PASSWORD to secure your dashboard!

function doGet(e) {
    try {
        // Enable CORS for GET
        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        const action = e.parameter.action;
        const user = e.parameter.user;
        const token = e.parameter.token;

        if (action === 'verify') {
            if (user === ADMIN_USER && token === ADMIN_TOKEN) return successRes({ valid: true });
            return errorRes("Invalid Username or Password");
        }

        if (user !== ADMIN_USER || token !== ADMIN_TOKEN) return errorRes("Unauthorized access. Invalid credentials.");

        const sheetApp = SpreadsheetApp.getActiveSpreadsheet();

        if (action === 'getAll') {
            const settingsSheet = sheetApp.getSheetByName("Site_Settings") || sheetApp.getSheetByName("Settings");
            const packagesSheet = sheetApp.getSheetByName("Safari_Packages") || sheetApp.getSheetByName("Packages");
            const bookingsSheet = sheetApp.getSheetByName("Bookings");

            const settings = readData(settingsSheet);
            const packages = readData(packagesSheet);
            const bookings = readData(bookingsSheet);

            return successRes({ settings, packages, bookings });
        }

        return errorRes("Invalid GET action parameter.");
    } catch (err) {
        return errorRes(err.toString());
    }
}

function doPost(e) {
    try {
        const action = e.parameter.action || 'addBooking';
        const sheetApp = SpreadsheetApp.getActiveSpreadsheet();

        // Public Booking Submissions (No token required, called straight from the index.html form)
        if (action === 'addBooking') {
            const sheet = sheetApp.getSheetByName("Bookings");
            if (!sheet) return errorRes("Bookings sheet not found. Please create a tab named 'Bookings'.");

            const name = e.parameter.name || "Unknown";
            const email = e.parameter.email || "Unknown";
            const pkg = e.parameter.package || "None";
            const msg = e.parameter.message || "None";

            sheet.appendRow([new Date(), name, email, pkg, msg]);

            // Return success JSON
            return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Protected Admin Actions (Update Settings / Packages)
        let payload;
        if (e.postData && e.postData.contents && e.postData.type === "application/json") {
            payload = JSON.parse(e.postData.contents);
        } else if (e.parameter.payload) {
            payload = JSON.parse(e.parameter.payload);
        } else {
            return errorRes("No payload provided");
        }

        if (payload.token !== ADMIN_TOKEN || payload.user !== ADMIN_USER) return errorRes("Unauthorized! Invalid User or Password.");

        if (action === 'updateSettings') {
            const sheet = sheetApp.getSheetByName("Site_Settings") || sheetApp.getSheetByName("Settings");
            if (!sheet) return errorRes("Settings sheet not found.");
            writeData(sheet, payload.data);
            return successRes("Site Settings updated successfully!");
        }

        if (action === 'updatePackages') {
            const sheet = sheetApp.getSheetByName("Safari_Packages") || sheetApp.getSheetByName("Packages");
            if (!sheet) return errorRes("Packages sheet not found.");
            writeData(sheet, payload.data);
            return successRes("Safari Packages updated successfully!");
        }

        return errorRes("Invalid POST action parameter.");
    } catch (err) {
        return errorRes("Server error: " + err.toString());
    }
}

// Helper Functions
function readData(sheet) {
    if (!sheet) return [];
    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];

    const headers = data[0];
    const result = [];

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        let obj = {};
        let emptyRow = true;
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j];
            if (row[j] !== "") emptyRow = false;
        }
        if (!emptyRow) result.push(obj); // Skip entirely empty rows
    }
    return result;
}

function writeData(sheet, dataObjects) {
    if (!dataObjects || dataObjects.length === 0) return;

    // Extract headers from keys of the first object
    const headers = Object.keys(dataObjects[0]);

    sheet.clear();
    sheet.appendRow(headers);

    const rows = dataObjects.map(obj => headers.map(h => obj[h] || ""));
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function successRes(data) {
    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
        .setMimeType(ContentService.MimeType.JSON);
}

function errorRes(msg) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: msg }))
        .setMimeType(ContentService.MimeType.JSON);
}
