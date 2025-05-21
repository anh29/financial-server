# Google Apps Script Backend

This directory contains the Google Apps Script files that serve as the backend for the Financial Server. These scripts handle data storage, processing, and business logic in Google Sheets.

## Files Overview

### Core Files
- `router.gs` - Main router for handling API requests
- `utils.gs` - Utility functions for common operations
- `auth.gs` - Authentication and user management functions
- `createIndividualSheet.gs` - Functions for creating and managing user sheets
- `smart_logic_router.gs` - Router for smart financial features

## Setup Instructions

1. Create a new Google Apps Script project in your Google Drive
2. Copy each `.gs` file into the project
3. Deploy the project as a web app:
   - Click "Deploy" > "New deployment"
   - Choose "Web app"
   - Set the following:
     - Execute as: "Me"
     - Who has access: "Anyone"
   - Click "Deploy"
4. Copy the deployment URL and use it in your server's environment variables

## Sheet Structure

The script expects the following sheet structure:

1. **Users Sheet**
   - User information
   - Authentication data
   - Preferences

2. **Individual User Sheets**
   - Transactions
   - Budgets
   - Goals
   - Categories

## API Integration

The scripts are designed to work with the Node.js server through HTTP requests. Each function in the scripts corresponds to an endpoint in the server.

### Example Integration
```javascript
// Server-side code
const response = await callGAS('functionName', 'GET', { param1: 'value1' });
```

## Error Handling

The scripts implement error handling for:
- Invalid parameters
- Missing data
- Sheet access issues
- Processing errors

## Security

- All user data is stored in separate sheets
- Access is controlled through Google's authentication
- Sensitive operations require proper authorization

## Development

1. Make changes to the `.gs` files
2. Test in the Google Apps Script editor
3. Deploy a new version
4. Update the server's environment variables if needed

## Best Practices

1. Always validate input parameters
2. Use try-catch blocks for error handling
3. Log important operations
4. Keep functions modular and reusable
5. Document function parameters and return values

## Troubleshooting

Common issues and solutions:

1. **Permission Denied**
   - Check deployment settings
   - Verify user access to sheets

2. **Function Not Found**
   - Verify function name spelling
   - Check if function is exported

3. **Data Not Found**
   - Verify sheet structure
   - Check user permissions

## Contributing

1. Follow the existing code style
2. Add comments for complex logic
3. Test thoroughly before deploying
4. Update documentation for new features
