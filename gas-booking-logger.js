// Google Apps Script (GAS) to log form submissions into Google Sheets
// 
// INSTRUCTIONS FOR THE ADMIN:
// 1. Open your Google Sheet.
// 2. Click on "Extensions" -> "Apps Script".
// 3. Delete any code in the code editor, and paste all the code from this file.
// 4. In your Sheet, make sure you have a tab exactly named "Bookings".
// 5. In the "Bookings" tab, set Row 1 with the exact headers: Timestamp | Customer Name | Email/Phone | Selected Package | Message
// 6. Go to "Deploy" (top right) -> "New deployment".
// 7. Select "Web app" as the type.
// 8. Execute as: "Me", Who has access: "Anyone".
// 9. Click "Deploy". Authorize the necessary permissions.
// 10. Copy the resulting "Web app URL" you are given.
// 11. Go back to index.html on your website, find the `<form id="contact-form">` tag, 
//     and replace the `action="https://formspree.io/..."` link with your new Web app URL!
//
// That's it! Every time someone submits the contact form, it will bypass Formspree and drop directly into your Bookings sheet.

function doPost(e) {
    try {
        const sheetApp = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = sheetApp.getSheetByName("Bookings"); // Targets the 'Bookings' tab

        // Parse form data received
        const name = e.parameter.name || "Unknown";
        const email = e.parameter.email || "Unknown";
        const packageSelection = e.parameter.package || "None";
        const message = e.parameter.message || "None";
        const timestamp = new Date();

        // Append the row to the bottom of the Bookings sheet
        sheet.appendRow([timestamp, name, email, packageSelection, message]);

        // Return a success JSON response
        return ContentService.createTextOutput(JSON.stringify({ "result": "success", "data": e.parameter }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // Return error if something goes wrong
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
