function createUser(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TABLES.users);
  const headers = sheet.getDataRange().getValues()[0];
  const params = JSON.parse(e.postData.contents || '{}');

  // Define required fields
  const requiredFields = ['email', 'username'];
  const missingFields = requiredFields.filter(f => !params[f]);

  if (missingFields.length > 0) {
    return sendResponse(400, { error: `Missing required fields: ${missingFields.join(', ')}` });
  }

  const existingData = sheet.getDataRange().getValues();
  const emailIndex = headers.indexOf("email");
  const idIndex = headers.indexOf("id");

  for (let i = 1; i < existingData.length; i++) {
    const row = existingData[i];
    if (row[emailIndex] === params.email) {
      if (!params.via_google) {
        return sendResponse(400, { error: "Email already exists." });
      } else {
        return sendResponse(200, {
          data: {
            id: row[idIndex],
            email_verified: true,
            avatar: params.avatar || "",
            username: params.username
          },
          message: "Login successfully."
        });
      }
    }
  }

  if (params.password) {
    params.password = hashPassword(params.password);
  }

  return addRecordGeneric(e, TABLES.users, params);
}

function signIn(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TABLES.users);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const params = JSON.parse(e.postData.contents);

  if (!params.email && !params.username) {
    return sendResponse(400, { error: "Missing login credentials: email or username is required." });
  }

  if (!params.password && !params.via_google) {
    return sendResponse(400, { error: "Missing password." });
  }

  const hashedPassword = hashPassword(params.password);  // Hash the password

  const users = data.slice(1).map(row => {
    const user = {};
    headers.forEach((key, i) => user[key] = row[i]);
    return user;
  });

  const matchUser = users.find(user =>
    (params.email && user.email?.toLowerCase() === params.email.toLowerCase()) ||
    (params.username && user.username?.toLowerCase() === params.username.toLowerCase())
  );

  if (!matchUser) {
    return sendResponse(404, { error: "User not found." });
  }

  // Now compare the hashed password
  if (matchUser.password !== hashedPassword) {
    return sendResponse(401, { error: "Password doesn't match." });
  }

  const { id, username, email, avatar, email_verified, via_google } = matchUser;

  return sendResponse(200, {
    data: { id, username, email, avatar, email_verified, via_google },
    message: "Sign-in successful."
  });
}

function updateUser(e) {
  const userObj = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActive().getSheetByName(TABLES.users);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const userIdIndex = headers.indexOf('id');
  const passwordIndex = headers.indexOf('password');

  let updatedRow = null;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][userIdIndex]) === String(userObj.id)) {
      headers.forEach((key, colIndex) => {
        if (userObj[key] !== undefined) {
          let value = userObj[key];

          // Hash password if it's being updated
          if (key === 'password') {
            const currentPassword = data[i][passwordIndex];
            if (value !== currentPassword) {
              value = hashPassword(value);
            }
          }

          sheet.getRange(i + 1, colIndex + 1).setValue(value);
        }
      });
      updatedRow = userObj;
      break;
    }
  }

  if (updatedRow) {
    return sendResponse(200, {
      message: `User ${userObj.id} updated successfully.`,
      data: updatedRow
    });
  } else {
    return sendResponse(404, {
      message: `User with id ${userObj.id} not found.`
    });
  }
}
