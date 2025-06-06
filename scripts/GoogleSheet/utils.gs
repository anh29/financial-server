// 📁 utils.gs
// Utility functions for interacting with Sheets in a modular way

const TABLES = {
  users: 'Users',
  accounts: 'Accounts',
  transactions: 'Transactions',
  budgets: 'Budgets',
  goals: 'Goals',
  goalContributions: 'GoalContributions',
  monthlyBudgets: 'MonthlyBudgets',
  monthlyBudgetAllocations: 'MonthlyBudgetAllocations',
  bills: 'Bills',
  billsPayments: 'BillsPayments',
};

const CATEGORIES_DURATION = { shopping: 90, food_drink: 3, moving: 7, house: 90, health: 30, entertainment: 7, investigation: 365, sociality: 1 };

function sortByCreatedAtDesc(records) {
  return records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// Function to hash the password using SHA-256
function hashPassword(password) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function sendResponse(statusCode, payload) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: statusCode, ...payload }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetHeaders(sheetName) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function sheetToObjects(sheetName) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
}

function addRecordGeneric(e, sheetName) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  const headers = getSheetHeaders(sheetName);
  const bodyArray = JSON.parse(e.postData.contents); // should be an array of records

  if (!Array.isArray(bodyArray)) {
    return sendResponse(400, { message: "Expected an array of records." });
  }

  const newRows = bodyArray.map(body => 
    headers.map(header => {
      if (header === 'id') return body[header] || Utilities.getUuid();
      if (header === 'created_at') return new Date().toISOString();
      return body.hasOwnProperty(header) ? body[header] : '';
    })
  );

  sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);

  const newObjects = newRows.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i]])));

  return sendResponse(200, {
    message: `Added ${newRows.length} record(s) to ${sheetName} successfully.`,
    data: sortByCreatedAtDesc(newObjects)
  });
}

function updateRecordByIdGeneric(e, sheetName) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  const headers = getSheetHeaders(sheetName);
  const data = sheet.getDataRange().getValues();
  const body = JSON.parse(e.postData.contents);
  const { id, ...fields } = body;
  if (!id) return sendResponse(400, { message: "Missing 'id'." });

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      headers.forEach((h, idx) => {
        if (fields.hasOwnProperty(h)) {
          data[i][idx] = fields[h];
        }
      });

      sheet.getRange(i + 1, 1, 1, headers.length).setValues([data[i]]);

      const updatedRow = Object.fromEntries(headers.map((h, idx) => [h, data[i][idx]]));
      return sendResponse(200, { message: `Updated in ${sheetName}`, data: updatedRow });
    }
  }

  return sendResponse(404, { message: `ID ${id} not found.` });
}

function deleteRecordByIdGeneric(id, sheetName) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return sendResponse(200, { message: `Deleted from ${sheetName}` });
    }
  }
  return sendResponse(404, { message: `ID ${id} not found.` });
}

function getRecordByIdGeneric(e, sheetName) {
  const { id } = e.parameter;
  const records = sheetToObjects(sheetName);
  const record = records.find(r => r.id === id);
  return record ? sendResponse(200, { message: 'Found', data: record }) : sendResponse(404, { message: 'Not found' });
}

function getRecordsByUserIdGeneric(e, sheetName) {
  const { userId } = e.parameter;
  const records = sheetToObjects(sheetName).filter(r => r.userId == userId);
  return sendResponse(200, { message: `Fetched records for user ${userId}`, data: sortByCreatedAtDesc(records) });
}

function getAllRecordsGeneric(sheetName) {
  return sendResponse(200, { message: `Fetched all from ${sheetName}`, data: sortByCreatedAtDesc(sheetToObjects(sheetName)) });
}  
