// 📁 router.gs
// Central router that connects HTTP requests to util handlers

function doPost(e) {
  const path = e.parameter.path;

  switch (path) {
    case 'createUser': return createUser(e);
    case 'signIn': return signIn(e);
    case 'createIndividualSheet': return createIndividualSheet(e);

    case 'predictUsageDuration': return predictUsageDuration(e);
    case 'confirmOCRTransaction': return confirmOCRTransaction(e);

    case 'addBillsPayments': return addBillsPayments(e);
    
    case 'cancelGoal': return cancelGoal(e);

    // Generic add routes
    case 'addAccounts': return addRecordGeneric(e, TABLES.accounts);
    case 'addTransactions': return addRecordGeneric(e, TABLES.transactions);
    case 'addCategories': return addRecordGeneric(e, TABLES.categories);
    case 'addTags': return addRecordGeneric(e, TABLES.tags);
    case 'addTransactionTags': return addRecordGeneric(e, TABLES.transactionTags);
    case 'addBudgets': return addRecordGeneric(e, TABLES.budgets);
    case 'addGoals': return addRecordGeneric(e, TABLES.goals);
    case 'addRecurringPatterns': return addRecordGeneric(e, TABLES.recurringPatterns);
    case 'addOCRReceipts': return addRecordGeneric(e, TABLES.ocrReceipts);
    case 'addActivityLogs': return addRecordGeneric(e, TABLES.activityLogs);
    case 'addNotifications': return addRecordGeneric(e, TABLES.notifications);
    case 'addMonthlyBudgets': return addRecordGeneric(e, TABLES.monthlyBudgets);
    case 'addMonthlyBudgetAllocations': return addRecordGeneric(e, TABLES.monthlyBudgetAllocations);
    case 'addGoalContributions': return addGoalContributions(e);
    case 'addBills': return addRecordGeneric(e, TABLES.bills);

    // Generic update routes
    case 'updateUsers': return updateUser(e);
    case 'updateAccounts': return updateRecordByIdGeneric(e, TABLES.accounts);
    case 'updateTransactions': return updateRecordByIdGeneric(e, TABLES.transactions);
    case 'updateCategories': return updateRecordByIdGeneric(e, TABLES.categories);
    case 'updateTags': return updateRecordByIdGeneric(e, TABLES.tags);
    case 'updateTransactionTags': return updateRecordByIdGeneric(e, TABLES.transactionTags);
    case 'updateBudgets': return updateRecordByIdGeneric(e, TABLES.budgets);
    case 'updateGoals': return updateRecordByIdGeneric(e, TABLES.goals);
    case 'updateRecurringPatterns': return updateRecordByIdGeneric(e, TABLES.recurringPatterns);
    case 'updateOCRReceipts': return updateRecordByIdGeneric(e, TABLES.ocrReceipts);
    case 'updateActivityLogs': return updateRecordByIdGeneric(e, TABLES.activityLogs);
    case 'updateNotifications': return updateRecordByIdGeneric(e, TABLES.notifications);
    case 'updateMonthlyBudgets': return updateRecordByIdGeneric(e, TABLES.monthlyBudgets);
    case 'updateMonthlyBudgetAllocations': return updateRecordByIdGeneric(e, TABLES.monthlyBudgetAllocations);
    case 'updateGoalContributions': return updateRecordByIdGeneric(e, TABLES.goalContributions);
    case 'updateBills': return updateBills(e, TABLES.bills);

    default:
      return sendResponse(400, { message: `Unknown POST path: ${path}` });
  }
}

function doGet(e) {
  const path = e.parameter.path;

  switch (path) {
    case 'getLatestTransaction': return getLatestTransactionPerCategory(e);
    case 'detectNewRecurringPatterns': return detectNewRecurringPatterns(e);
    case 'getPendingOCRReview': return getPendingOCRReview(e);
    case 'suggestSmartGoals': return suggestSmartGoals(e);
    case 'checkBudgetAlerts': return checkBudgetAlerts(e);
    case 'checkGoalReminders': return checkGoalReminders(e);
    case 'getMonthlyBudgetWithAllocations': return getMonthlyBudgetWithAllocations(e);
    case 'getHistoricalExpenditures': return getHistoricalExpenditures(e);
    case 'getUserIncomeAndBudgets': return getUserIncomeAndBudgets(e);
    case 'getExpensesTransactions': return getExpensesTransactions(e);
    case 'getUserGoalsWithProgress': return getUserGoalsWithProgress(e);
    case 'saveGoalContribution': return saveGoalContribution(e);
    case 'getRemainingBudget': return getRemainingBudget(e);
    case 'allocateSavingToGoals': return allocateSavingToGoals(e);

    case 'getMonthlyCategoryExpenses': return getMonthlyCategoryExpenses(e);
    case 'suggestSmartBudget': return suggestSmartBudget(e);
    
    // Users
    case 'getAllUsers': return getAllRecordsGeneric(TABLES.users);
    case 'getUsersById': return getRecordByIdGeneric(e, TABLES.users);
    case 'getUsersByUser': return getRecordsByUserIdGeneric(e, TABLES.users);
    case 'deleteUsersById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.users);

    case 'getUserDashboardStats': return getUserDashboardStats(e);
    case 'predictRecurringTransactions': return predictRecurringTransactions(e);
    case 'getExpenseByCategory': return getExpenseByCategory(e);
    case 'getSmartSuggestions': return getSmartSuggestions(e);

    // Repeat for other tables
    case 'getAllMonthlyBudgets': return getAllRecordsGeneric(TABLES.monthlyBudgets);
    case 'getMonthlyBudgetsByUser': return getRecordsByUserIdGeneric(e, TABLES.monthlyBudgets);
    case 'deleteMonthlyBudgetsById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.monthlyBudgets);
    case 'deleteMonthlyBudgetAllocationsById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.monthlyBudgetAllocations);

    case 'getAllMonthlyBudgetAllocations': return getAllRecordsGeneric(TABLES.monthlyBudgetAllocations);
    case 'getMonthlyBudgetAllocationsByUser': return getRecordsByUserIdGeneric(e, TABLES.monthlyBudgetAllocations);

    case 'getAllAccounts': return getAllRecordsGeneric(TABLES.accounts);
    case 'getAccountsById': return getRecordByIdGeneric(e, TABLES.accounts);
    case 'getAccountsByUser': return getRecordsByUserIdGeneric(e, TABLES.accounts);
    case 'deleteAccountsById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.accounts);

    case 'getAllTransactions': return getAllRecordsGeneric(TABLES.transactions);
    case 'getTransactionsById': return getRecordByIdGeneric(e, TABLES.transactions);
    case 'getTransactionsByUser': return getRecordsByUserIdGeneric(e, TABLES.transactions);
    case 'deleteTransactionsById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.transactions);

    case 'getAllBills': return getAllRecordsGeneric(TABLES.bills);
    case 'getBillsById': return getBillDetails(e);
    case 'getBillsByUser': return getBillsByUser(e);
    case 'deleteBillsById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.bills);

    case 'getAllCategories': return getAllRecordsGeneric(TABLES.categories);
    case 'getCategoriesById': return getRecordByIdGeneric(e, TABLES.categories);
    case 'getCategoriesByUser': return getRecordsByUserIdGeneric(e, TABLES.categories);
    case 'deleteCategoriesById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.categories);

    case 'getAllTags': return getAllRecordsGeneric(TABLES.tags);
    case 'getTagsById': return getRecordByIdGeneric(e, TABLES.tags);
    case 'getTagsByUser': return getRecordsByUserIdGeneric(e, TABLES.tags);
    case 'deleteTagsById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.tags);

    case 'getAllTransactionTags': return getAllRecordsGeneric(TABLES.transactionTags);
    case 'getTransactionTagsById': return getRecordByIdGeneric(e, TABLES.transactionTags);
    case 'getTransactionTagsByUser': return getRecordsByUserIdGeneric(e, TABLES.transactionTags);
    case 'deleteTransactionTagsById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.transactionTags);

    case 'getAllBudgets': return getAllRecordsGeneric(TABLES.budgets);
    case 'getBudgetsById': return getRecordByIdGeneric(e, TABLES.budgets);
    case 'getBudgetsByUser': return getRecordsByUserIdGeneric(e, TABLES.budgets);
    case 'deleteBudgetsById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.budgets);

    case 'getAllGoals': return getAllRecordsGeneric(TABLES.goals);
    case 'getGoalsById': return getRecordByIdGeneric(e, TABLES.goals);
    case 'getGoalsByUser': return getRecordsByUserIdGeneric(e, TABLES.goals);
    case 'deleteGoalsById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.goals);

    case 'getAllRecurringPatterns': return getAllRecordsGeneric(TABLES.recurringPatterns);
    case 'getRecurringPatternsById': return getRecordByIdGeneric(e, TABLES.recurringPatterns);
    case 'getRecurringPatternsByUser': return getRecordsByUserIdGeneric(e, TABLES.recurringPatterns);
    case 'deleteRecurringPatternsById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.recurringPatterns);

    case 'getAllOCRReceipts': return getAllRecordsGeneric(TABLES.ocrReceipts);
    case 'getOCRReceiptsById': return getRecordByIdGeneric(e, TABLES.ocrReceipts);
    case 'getOCRReceiptsByUser': return getRecordsByUserIdGeneric(e, TABLES.ocrReceipts);
    case 'deleteOCRReceiptsById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.ocrReceipts);

    case 'getAllActivityLogs': return getAllRecordsGeneric(TABLES.activityLogs);
    case 'getActivityLogsById': return getRecordByIdGeneric(e, TABLES.activityLogs);
    case 'getActivityLogsByUser': return getRecordsByUserIdGeneric(e, TABLES.activityLogs);
    case 'deleteActivityLogsById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.activityLogs);

    case 'getAllNotifications': return getAllRecordsGeneric(TABLES.notifications);
    case 'getNotificationsById': return getRecordByIdGeneric(e, TABLES.notifications);
    case 'getNotificationsByUser': return getRecordsByUserIdGeneric(e, TABLES.notifications);
    case 'deleteNotificationsById': return deleteRecordByIdGeneric(e.parameter.id, TABLES.notifications);

    default:
      return sendResponse(400, { message: `Unknown GET path: ${path}` });
  }
}

// doGet({
//   parameter: {
//     'path': 'getUserDashboardStats',
//     'userId': '93e03eee-055f-4fb0-bce2-5f628d4528f6'
//   }
// })
