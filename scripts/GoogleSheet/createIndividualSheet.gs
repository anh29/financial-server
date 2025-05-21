function createIndividualSheet(e) {
  // Parse request body
  const requestData = JSON.parse(e.postData.contents);

  if (!requestData.name) {
    return sendResponse(400, { error: "Sheet name is required!" });
  }

  const sheetName = requestData.name;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Check if sheet already exists
  let sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    return sendResponse(400, { error: "Sheet already exists!" });
  }

  // Create new sheet
  sheet = ss.insertSheet(sheetName);

  // Add header row
  const header = requestData.header;
  sheet.getRange(1, 1, 1, header.length).setValues([header]);

  return sendResponse(200, { message: `Sheet "${sheetName}" created successfully!` });
}
