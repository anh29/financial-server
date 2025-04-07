const REQUEST_TYPES = {
  // GET types
  GET_USER_BY_USERID: 'getUserByUserId',
  GET_CATEGORY_DATA: 'getCategoryData',
  GET_ALL_TRANSACTIONS: 'getAllTransactions',
  GET_TRANSACTIONS_BY_USER: 'getTransactionsByUser',
  GET_RECURRING_PATTERNS_BY_USERID: 'getRecurringPatternsByUserId',
  GET_TRANSACTIONS_AMORTIZED_BY_USERID: 'getAllTransactionsAmortizedByUserId',

  // POST types
  ADD_KEYWORDS: 'addKeywords',
  CREATE_INDIVIDUAL_SHEET: 'createIndividualSheet',
  CREATE_USER: 'createUser',
  SIGN_IN: 'signIn',
  UPDATE_USER: 'updateUser',
  ADD_TRANSACTION: 'addTransaction',
  UPDATE_TRANSACTION_BY_ID: 'updateTransactionById',
  ADD_RECURRING_PATTERN: 'addRecurringPattern',
  UPDATE_RECURRING_PATTERN: 'updateRecurringPattern'
};

module.exports = {
  REQUEST_TYPES
};
