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

  return addRecordGeneric({ postData: { contents: JSON.stringify([params]) } }, TABLES.users);
}

function signIn(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TABLES.users);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const params = JSON.parse(e.postData.contents);
  const { email, username, password, via_google } = params;

  if (!email && !username) {
    return sendResponse(400, { error: "Missing login credentials: email or username is required." });
  }

  const users = data.slice(1).map(row => {
    const user = {};
    headers.forEach((key, i) => user[key] = row[i]);
    return user;
  });

  const matchUser = users.find(user =>
    (via_google && email && user.email?.toLowerCase() === email.toLowerCase()) ||
    (!via_google && (
      (email && user.email?.toLowerCase() === email.toLowerCase()) ||
      (username && user.username?.toLowerCase() === username.toLowerCase())
    ))
  );

  // === CASE 1: Sign-in via Google ===
  if (via_google === true) {
    if (!email) return sendResponse(400, { error: "Email is required for Google sign-in." });

    if (!matchUser) {
      // Auto-register user
      const newUser = {
        id: Utilities.getUuid(),
        email: email,
        username: username || email.split('@')[0],
        avatar: avatar || '',
        email_verified: true,
        via_google: true,
        created_at: new Date().toISOString()
      };

      const newRow = headers.map(h => newUser[h] || '');
      sheet.appendRow(newRow);

      return sendResponse(201, {
        message: "User signed in with Google and auto-registered.",
        data: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          avatar: newUser.avatar,
          email_verified: true,
          via_google: true
        }
      });
    }

    // Existing Google user
    if (!matchUser.via_google) {
      return sendResponse(403, { error: "This account was not registered via Google." });
    }

    const { id, username, email: savedEmail, avatar, email_verified } = matchUser;
    return sendResponse(200, {
      message: "Signed in with Google successfully.",
      data: {
        id, username, email: savedEmail, avatar,
        email_verified: email_verified === 'TRUE',
        via_google: true
      }
    });
  }

  // === CASE 2: Normal sign-in ===
  if (!password) {
    return sendResponse(400, { error: "Missing password." });
  }

  if (!matchUser) {
    return sendResponse(404, { error: "User not found." });
  }

  if (matchUser.via_google === 'TRUE') {
    return sendResponse(403, { error: "This account was registered via Google. Please sign in with Google." });
  }

  const hashedPassword = hashPassword(password);

  if (matchUser.password !== hashedPassword) {
    return sendResponse(401, { error: "Password doesn't match." });
  }

  const { id, username: uname, email: em, avatar: av, email_verified: verified } = matchUser;

  return sendResponse(200, {
    message: "Signed in successfully.",
    data: {
      id, username: uname, email: em, avatar: av,
      email_verified: verified === 'TRUE',
      via_google: false
    }
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
