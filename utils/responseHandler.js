function handleGoogleAppsScriptResponse(res, data) {
  if (data.status === 200) {
    res.status(200).json({
      message: data.message,
      data: data.data,
    });
  } else {
    res.status(data.status || 400).json({
      error: data.error || 'An error occurred while processing the request.',
    });
  }
}

module.exports = { handleGoogleAppsScriptResponse };
