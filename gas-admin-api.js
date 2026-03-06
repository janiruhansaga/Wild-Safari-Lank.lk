// Google Apps Script (GAS) - Admin API & Form Logger
// Replace all code in Code.gs with this script

const ADMIN_PASSWORD = "admin"; // <--- CHANGE THIS BEFORE DEPLOYING

// Handles GET requests for Dashboard (Fetch Settings, Packages, Bookings)
function doGet(e) {
    const action = e.parameter.action;
    const pwd = e.parameter.pwd;

    // Basic security check
    if (pwd !== ADMIN_PASSWORD) {
        return respondJSON({ status: "error", message: "Unauthorized: Incorrect Password" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "ping") {
        return respondJSON({ status: "success", message: "Pong" });
    }

    if (action === "getSettings") {
        const sheet = ss.getSheetByName("Site_Settings") || ss.getSheetByName("Settings");
        if (!sheet) return respondJSON({ status: "error", message: "Settings sheet not found." });
        return respondJSON({ status: "success", data: getSheetDataAsObject(sheet) });
    }

    if (action === "getPackages") {
        const sheet = ss.getSheetByName("Safari_Packages") || ss.getSheetByName("Packages") || ss.getSheetByName("Sheet1");
        if (!sheet) return respondJSON({ status: "error", message: "Packages sheet not found." });
        return respondJSON({ status: "success", data: getSheetDataAsArray(sheet) });
    }

    if (action === "getBookings") {
        const sheet = ss.getSheetByName("Bookings");
        if (!sheet) return respondJSON({ status: "error", message: "Bookings sheet not found." });
        return respondJSON({ status: "success", data: getSheetDataAsArray(sheet) });
    }

    return respondJSON({ status: "error", message: "Invalid action" });
}

// Handles POST requests (Update Settings, Packages, New Bookings)
function doPost(e) {
    try {
        let payload;

        // Check if it's a JSON payload (From Dashboard)
        if (e.postData && (e.postData.type === "application/json" || e.postData.type === "text/plain")) {
            payload = JSON.parse(e.postData.contents);
        } else {
            // Legacy Form submit from Public Website Contact Form
            return handleLegacyBooking(e);
        }

        // Dashboard Authentication Check
        if (payload.pwd !== ADMIN_PASSWORD) {
            return respondJSON({ status: "error", message: "Unauthorized" });
        }

        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const action = payload.action;

        if (action === "updateSettings") {
            const sheet = ss.getSheetByName("Site_Settings") || ss.getSheetByName("Settings");
            updateSettingsSheet(sheet, payload.data);
            return respondJSON({ status: "success" });
        }

        if (action === "updatePackage") {
            const sheet = ss.getSheetByName("Safari_Packages") || ss.getSheetByName("Packages") || ss.getSheetByName("Sheet1");
            updatePackageRow(sheet, payload.data);
            return respondJSON({ status: "success" });
        }

        return respondJSON({ status: "error", message: "Invalid action" });

    } catch (err) {
        return respondJSON({ status: "error", message: err.toString() });
    }
}

// Handle standard HTML form submission
function handleLegacyBooking(e) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Bookings");

    if (!sheet) throw new Error("Bookings sheet missing!");

    const name = e.parameter.name || "Unknown";
    const email = e.parameter.email || "Unknown";
    const packageSelection = e.parameter.package || "None";
    const message = e.parameter.message || "None";

    sheet.appendRow([new Date(), name, email, packageSelection, message]);

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
        .setMimeType(ContentService.MimeType.JSON);
}

// Helper: Wrap replies in JSON
function respondJSON(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}

// Helper: Convert array rows to object arrays based on headers
function getSheetDataAsArray(sheet) {
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    const headers = data[0];
    const rows = [];
    for (let i = 1; i < data.length; i++) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = data[i][j];
        }
        rows.push(obj);
    }
    return rows;
}

// Helper: Convert sheet to object properties
function getSheetDataAsObject(sheet) {
    const data = sheet.getDataRange().getValues();
    // Key-Value vertical format check
    if (data[0] && data[0][0] === "Key" && data[0][1] === "Value") {
        const obj = {};
        for (let i = 1; i < data.length; i++) {
            if (data[i][0]) obj[data[i][0]] = data[i][1];
        }
        return obj;
    }
    // Single row tabular format check
    if (data.length >= 2) {
        const obj = {};
        for (let j = 0; j < data[0].length; j++) {
            obj[data[0][j]] = data[1][j];
        }
        return obj;
    }
    return {};
}

// Helper: Update settings dynamically
function updateSettingsSheet(sheet, updates) {
    const data = sheet.getDataRange().getValues();
    // Key-Value vertical format
    if (data[0] && data[0][0] === "Key" && data[0][1] === "Value") {
        const keys = {};
        for (let i = 1; i < data.length; i++) {
            keys[data[i][0]] = i + 1; // row index in sheet (1-based)
        }
        for (const [k, v] of Object.entries(updates)) {
            if (v === undefined || v === null) continue;
            if (keys[k]) {
                sheet.getRange(keys[k], 2).setValue(v);
            } else {
                sheet.appendRow([k, v]);
            }
        }
    } else {
        // Tabular single row format (Assuming headers are row 1, values row 2)
        const headers = data[0];
        if (data.length < 2) sheet.appendRow(new Array(headers.length).fill(''));
        for (const [k, v] of Object.entries(updates)) {
            if (v === undefined || v === null) continue;
            const colIndex = headers.indexOf(k);
            if (colIndex !== -1) {
                sheet.getRange(2, colIndex + 1).setValue(v);
            } else {
                const newCol = headers.length + 1;
                sheet.getRange(1, newCol).setValue(k);
                sheet.getRange(2, newCol).setValue(v);
                headers.push(k);
            }
        }
    }
}

// Helper: Update a single package row
function updatePackageRow(sheet, payload) {
    const rowNum = payload.index + 2; // Offset for headers + array base
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    for (const [k, v] of Object.entries(payload)) {
        if (k === 'index' || v === undefined || v === null) continue;
        const colIndex = headers.indexOf(k);
        if (colIndex !== -1) {
            sheet.getRange(rowNum, colIndex + 1).setValue(v);
        }
    }
}
