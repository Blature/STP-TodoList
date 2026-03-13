import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export async function appendToSheet(
  employeeName: string,
  rows: (string | number)[][]
) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Check if sheet exists, if not create it
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = meta.data.sheets?.some(
      (s) => s.properties?.title === employeeName
    );

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: employeeName,
                },
              },
            },
          ],
        },
      });
      // Header creation removed as per user request
    }

    // Append Data
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${employeeName}!A2`,
      valueInputOption: "RAW",
      requestBody: {
        values: rows,
      },
    });

    return true;
  } catch (error) {
    console.error("Google Sheets API Error:", error);
    throw error;
  }
}
