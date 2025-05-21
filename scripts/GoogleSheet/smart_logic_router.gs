function monthStr(month) {
  const date = (month instanceof Date) ? month : new Date(month);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getExpensesTransactions(e) {
  const { userId } = e.parameter;
  if (!userId) return sendResponse(400, { message: "Missing userId" });

  const transactions = sheetToObjects(TABLES.transactions);
  const userExpenses = transactions
    .filter(transaction => transaction.userId === userId && transaction.type === 'expense');

  return sendResponse(200, {
    message: `Fetched expending transaction for user ${userId}`,
    data: userExpenses
  });
}

function getUserIncomeAndBudgets(e) {
  const { userId } = e.parameter;
  if (!userId) return sendResponse(400, { message: "Missing userId" });

  const budgets = sheetToObjects(TABLES.budgets);
  const transactions = sheetToObjects(TABLES.transactions);

  const userBudgets = budgets
    .filter(b => b.userId === userId);

  // Calculate total income
  const incomeTransactions = transactions
    .filter(t => t.userId === userId && t.type === 'income');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const income = {
    id: Utilities.getUuid(),
    userId: userId,
    description: 'Tổng thu nhập',
    amount: totalIncome,
    created_at: new Date().toISOString(),
    updated_at: ''
  };

  const response = {
    budgets: userBudgets,
    income,
  };

  return sendResponse(200, {
    message: `Fetched latest transaction per category for user ${userId}`,
    data: response
  });
}

function getMonthlyBudgetWithAllocations(e) {
  const { userId, month } = e.parameter;

  if (!userId || !month) {
    return sendResponse(400, { message: "Missing 'userId' or 'month' parameter." });
  }

  const budgets = sheetToObjects(TABLES.monthlyBudgets);
  const allocations = sheetToObjects(TABLES.monthlyBudgetAllocations);

  const budget = budgets.find(b => {
    const recordMonth = new Date(b.month);
    const recordMonthStr = monthStr(recordMonth);
    return b.userId === userId && recordMonthStr === month;
  });

  if (!budget) {
    return sendResponse(200, { message: `No budget found for ${month}`, data: {} });
  }

  const items = allocations.filter(a => {
    const allocationMonth = new Date(a.monthly_budget_id);
    const allocationMonthStr = monthStr(allocationMonth);
    return a.userId === userId && allocationMonthStr === month;
  });

  return sendResponse(200, {
    message: `Budget and allocations for ${month}`,
    data: {
      ...budget,
      allocations: items
    }
  });
}

function getHistoricalExpenditures(e) {
  const { userId } = e.parameter;
  if (!userId) return sendResponse(400, { message: "Missing userId" });

  const budgets = sheetToObjects(TABLES.monthlyBudgets);
  const allocations = sheetToObjects(TABLES.monthlyBudgetAllocations);
  const transactions = sheetToObjects(TABLES.transactions);


  const allMonths = new Set();

  budgets.forEach(b => {
    if (b.userId === userId) allMonths.add(monthStr(b.month));
  });

  transactions.forEach(t => {
    if (t.userId === userId && t.type === 'expense') {
      const amortized = t.is_amortized === true || t.is_amortized === 'TRUE';
      const startDate = new Date(t.date);
      const days = amortized ? parseInt(t.amortized_days || 0, 10) : 0;
      const affectedMonths = getMonthsInRange(startDate, days);
      affectedMonths.forEach(m => allMonths.add(m));
    }
  });

  const monthList = Array.from(allMonths).sort().reverse();

  const result = [];

  monthList.forEach(month => {
    console.log(`\n📆 Processing month: ${month}`);

    const budget = budgets
      .filter(b => b.userId === userId && monthStr(b.month) === month)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    const totalBudget = budget?.amount || 0;
    console.log("  ➤ Budget:", totalBudget);

    const monthAllocations = allocations.filter(a => {
      const allocMonthStr = monthStr(a.monthly_budget_id);
      return a.userId === userId && allocMonthStr === month;
    });

    const structuredAllocations = monthAllocations.map(a => ({
      description: a.description,
      amount: a.amount
    }));

    const totalAllocated = monthAllocations.reduce((sum, a) => sum + a.amount, 0);
    console.log("  ➤ Total allocated:", totalAllocated);

    const spentByCategory = {};

    transactions.forEach(t => {
      if (t.userId !== userId || t.type !== 'expense') return;

      const cat = t.category || 'Không xác định';
      const isAmortized = t.is_amortized === true || t.is_amortized === 'TRUE';
      const transAmount = Number(t.amount || 0);
      const transDate = new Date(t.date);

      if (!isAmortized) {
        if (monthStr(t.date) === month) {
          spentByCategory[cat] = (spentByCategory[cat] || 0) + transAmount;
          console.log(`    [NORMAL] +${transAmount} to "${cat}"`);
        }
      } else {
        const amortizedDays = parseInt(t.amortized_days || 0, 10);
        const daysPerMonth = getAmortizedDaysByMonth(transDate, amortizedDays);
        console.log('daysPerMonth', daysPerMonth)
        console.log('transAmount', transAmount)
        console.log('amortizedDays', amortizedDays)
        if (daysPerMonth[month]) {
          const allocated = (daysPerMonth[month] / amortizedDays) * transAmount;
          spentByCategory[cat] = (spentByCategory[cat] || 0) + Math.round(allocated);
          console.log(`    [AMORTIZED] +${Math.round(allocated)} to "${cat}" from "${monthStr(transDate)}" spread over ${amortizedDays} days`);
        }
      }
    });

    result.push({
      month,
      total: totalBudget,
      disposable: totalBudget - totalAllocated,
      allocations: structuredAllocations,
      spent: spentByCategory
    });
  });

  console.log("✅ Final result:", JSON.stringify(result, null, 2));

  return sendResponse(200, {
    message: `Fetched latest transaction per category for user ${userId}`,
    data: result
  });
}

// getHistoricalExpenditures({
//   'parameter': {
//     'userId': '1af8adf5-9cb0-4220-918c-f6dd1c7bbf5b',
//   }
// })

// Get array of months spanned by startDate + days
function getMonthsInRange(startDate, numDays) {
  if (!numDays || numDays <= 0) return [monthStr(startDate)];
  const months = new Set();
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    months.add(monthStr(date));
  }
  return Array.from(months);
}

// Return a map of { YYYY-MM: number of amortized days in that month }
function getAmortizedDaysByMonth(startDate, numDays) {
  const map = {};
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const m = monthStr(date);
    map[m] = (map[m] || 0) + 1;
  }
  return map;
}

// getHistoricalExpenditures({
//   "parameter": {
//     "userId": "1af8adf5-9cb0-4220-918c-f6dd1c7bbf5b"
//   }
// })

function getLatestTransactionPerCategory(e) {
  const sheetName = TABLES.transactions;
  const userId = e.parameter.userId;
  if (!userId) return sendResponse(400, { message: "Missing userId" });

  const transactions = sheetToObjects(sheetName)
    .filter(tx => tx.userId === userId); // ✅ Filter by userId

  const parsedTransactions = transactions.map(tx => ({
    ...tx,
    _parsedDate: tx.date ? new Date(tx.date) : new Date(tx.created_at),
  }));

  const latestByCategory = {};
  for (const tx of parsedTransactions) {
    const catId = tx.category || 'uncategorized';
    if (!latestByCategory[catId] || latestByCategory[catId]._parsedDate < tx._parsedDate) {
      latestByCategory[catId] = tx;
    }
  }

  const result = Object.values(latestByCategory);
  return sendResponse(200, {
    message: `Fetched latest transaction per category for user ${userId}`,
    data: result
  });
}

function getUserDashboardStats(e) {
  const { userId } = e.parameter;

  if (!userId) return sendResponse(400, { message: 'Missing userId' });
  const tx = sheetToObjects(TABLES.transactions).filter(t => t.userId === userId);
  const budgets = sheetToObjects(TABLES.budgets).filter(b => b.userId === userId);
  const goals = sheetToObjects(TABLES.goals).filter(g => g.userId === userId);
  const totalIncome = tx.filter(t => t.type === 'income').reduce((a, b) => a + +b.amount, 0);
  console.log('totalIncome', totalIncome)

  const totalExpense = tx.filter(t => t.type === 'expense').reduce((a, b) => a + +b.amount, 0);
  console.log('totalExpense', totalExpense)

  const budgetUsage = budgets.map(b => {
    const spent = tx.filter(t => t.category === b.category && t.type === 'expense').reduce((s, t) => s + +t.amount, 0);
    return { category: b.category, budget_amount: +b.amount, spent, remaining: +b.amount - spent };
  });
  console.log('budgetUsage', budgetUsage)

  const goalProgress = goals.map(g => {
    const saved = tx.filter(t => t.category === g.category && t.type === 'income').reduce((s, t) => s + +t.amount, 0);
    return { goal_id: g.id, title: g.title, target_amount: +g.amount, saved, progress_percent: Math.min(100, Math.round(saved / g.amount * 100)) };
  });
  console.log('goalProgress', goalProgress)

  return sendResponse(200, { message: 'Fetched dashboard stats', data: { totalIncome, totalExpense, netSavings: totalIncome - totalExpense, budgetUsage, goalProgress } });
}

function predictRecurringTransactions(e) {
  const { userId } = e.parameter;
  if (!userId) return sendResponse(400, { message: 'Missing userId' });
  const patterns = sheetToObjects(TABLES.recurringPatterns).filter(p => p.userId === userId);
  const result = patterns.map(p => ({ keyword: p.keyword, predicted_amount: p.avg_amount, predicted_category: p.category, predicted_next_date: new Date(new Date(p.last_seen).getTime() + +p.predicted_period * 86400000).toISOString().split('T')[0] }));
  return sendResponse(200, { message: 'Predicted recurring transactions', data: result });
}

function detectNewRecurringPatterns(e) {
  const { userId } = e.parameter;
  if (!userId) return sendResponse(400, { message: 'Missing userId' });
  const tx = sheetToObjects(TABLES.transactions).filter(t => t.userId === userId && t.type === 'expense');
  const groups = {};
  for (let t of tx) {
    const key = `${t.category}-${t.description?.toLowerCase().split(' ').slice(0, 2).join(' ')}`;
    groups[key] = groups[key] || [];
    groups[key].push(new Date(t.date));
  }
  const patterns = Object.entries(groups).map(([key, dates]) => {
    if (dates.length >= 3) {
      dates.sort((a, b) => a - b);
      const avg = dates.slice(1).map((d, i) => (d - dates[i]) / 86400000).reduce((a, b) => a + b) / (dates.length - 1);
      return { keyword: key.split('-')[1], predicted_period: Math.round(avg), last_seen: dates.at(-1).toISOString().split('T')[0] };
    }
    return null;
  }).filter(Boolean);
  return sendResponse(200, { message: 'Recurring patterns detected', data: patterns });
}

function getSmartSuggestions(e) {
  const { userId } = e.parameter;
  const tx = sheetToObjects(TABLES.transactions).filter(t => t.userId === userId);
  const goals = sheetToObjects(TABLES.goals).filter(g => g.userId === userId);
  const income = tx.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0);
  const expense = tx.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0);
  const savingsRate = income ? (income - expense) / income : 0;
  const tips = [];
  if (savingsRate < 0.1) tips.push('⚠️ Your savings rate is low. Try cutting non-essential spending.');
  if (goals.length === 0) tips.push('🎯 Set financial goals to guide your saving habits.');
  if (tx.length === 0) tips.push('📝 Start logging expenses to build financial awareness.');
  return sendResponse(200, { message: 'Smart suggestions generated', data: tips });
}

function getExpenseByCategory(e) {
  const { userId } = e.parameter;
  const tx = sheetToObjects(TABLES.transactions).filter(t => t.userId === userId && t.type === 'expense');
  const categories = sheetToObjects(TABLES.categories);
  const total = {};
  tx.forEach(t => total[t.category] = (total[t.category] || 0) + +t.amount);
  const result = Object.entries(total).map(([id, amount]) => {
    const label = categories.find(c => c.id === id)?.label || 'Unknown';
    return { category: id, category_label: label, total: Math.round(amount * 100) / 100 };
  });
  return sendResponse(200, { message: 'Categorised spending', data: result });
}

function getPendingOCRReview(e) {
  const { userId } = e.parameter;
  const receipts = sheetToObjects(TABLES.ocrReceipts).filter(r => r.userId === userId && r.status === 'pending');
  const preview = receipts.map(r => ({ id: r.id, file_url: r.file_url, extracted_description: r.extracted_description, extracted_amount: r.extracted_amount, predicted_category: r.predicted_category, predicted_date: r.predicted_date }));
  return sendResponse(200, { message: 'OCR pending review', data: preview });
}

function confirmOCRTransaction(e) {
  const body = JSON.parse(e.postData.contents);
  const { ocrId, userId, accountId, confirmed_category, confirmed_date, confirmed_amount, confirmed_description } = body;
  if (!ocrId || !userId || !accountId) return sendResponse(400, { message: 'Missing required fields' });
  const tx = {
    id: Utilities.getUuid(),
    userId,
    accountId,
    amount: confirmed_amount,
    type: 'expense',
    description: confirmed_description || '',
    category: confirmed_category,
    date: confirmed_date,
    source: 'ocr',
    is_amortized: '',
    amortized_days: '',
    created_at: new Date().toISOString()
  };
  const headers = getSheetHeaders(TABLES.transactions);
  SpreadsheetApp.getActive().getSheetByName(TABLES.transactions).appendRow(headers.map(h => tx[h] || ''));
  const receiptSheet = SpreadsheetApp.getActive().getSheetByName(TABLES.ocrReceipts);
  const data = receiptSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === ocrId) {
      const idx = getSheetHeaders(TABLES.ocrReceipts).indexOf('status');
      receiptSheet.getRange(i + 1, idx + 1).setValue('confirmed');
      break;
    }
  }
  return sendResponse(201, { message: 'Transaction saved from OCR', data: tx });
}

function predictUsageDuration(e) {
  const body = JSON.parse(e.postData.contents);
  const { userId, category, amount } = body;

  if (!userId || !category || !amount) {
    return sendResponse(400, { message: 'Missing userId, category or amount' });
  }

  const tx = sheetToObjects(TABLES.transactions)
    .filter(t =>
      t.userId === userId &&
      t.type === 'expense' &&
      t.category === category &&
      t.date &&
      t.amount
    );

  if (tx.length < 2) {
    const fallback = CATEGORIES_DURATION[category] || 30;
    return sendResponse(200, {
      message: 'Not enough data, using fallback',
      data: fallback
    });
  }

  const sorted = tx.sort((a, b) => new Date(a.date) - new Date(b.date));

  const ratios = [];

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date);
    const currDate = new Date(sorted[i].date);
    const days = (currDate - prevDate) / 86400000;
    const amt = Number(sorted[i - 1].amount);

    if (days > 0 && amt > 0 && days < 180) {
      const daysPerAmount = days / amt;
      ratios.push(daysPerAmount);
    }
  }

  if (ratios.length === 0) {
    const fallback = CATEGORIES_DURATION[category] || 30;
    return sendResponse(200, {
      message: 'Invalid intervals or amounts, using fallback',
      data: fallback
    });
  }

  const avgDaysPerAmount = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  const predictedDays = Math.round(amount * avgDaysPerAmount);

  return sendResponse(200, {
    message: 'Predicted using amount × average days/amount',
    data: predictedDays
  });
}

function suggestSmartGoals(e) {
  const { userId } = e.parameter;
  const goals = sheetToObjects(TABLES.goals).filter(g => g.userId === userId);
  if (goals.length >= 3) return sendResponse(200, { message: 'Max goals reached', data: [] });
  const tx = sheetToObjects(TABLES.transactions).filter(t => t.userId === userId && t.type === 'expense');
  const cats = sheetToObjects(TABLES.categories);
  const top = Object.entries(tx.reduce((map, t) => (map[t.category] = (map[t.category] || 0) + +t.amount, map), {}))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([catId]) => cats.find(c => c.id === catId)?.label || 'Unnamed');
  const result = top.map(label => `💡 Create a savings goal for upcoming '${label}' expenses.`);
  return sendResponse(200, { message: 'Goal suggestions', data: result });
}

function checkBudgetAlerts(e) {
  const { userId } = e.parameter;
  const budgets = sheetToObjects(TABLES.budgets).filter(b => b.userId === userId);
  const tx = sheetToObjects(TABLES.transactions).filter(t => t.userId === userId && t.type === 'expense');
  const alerts = budgets.map(b => {
    const spent = tx.filter(t => t.category === b.category).reduce((s, t) => s + +t.amount, 0);
    const percent = spent / +b.amount;
    return percent >= 0.9 ? `⚠️ Budget ${b.category} is at ${Math.round(percent * 100)}% usage!` : null;
  }).filter(Boolean);
  return sendResponse(200, { message: 'Budget alerts', data: alerts });
}

function checkGoalReminders(e) {
  const { userId } = e.parameter;
  const goals = sheetToObjects(TABLES.goals).filter(g => g.userId === userId && g.status === 'active');
  const tx = sheetToObjects(TABLES.transactions).filter(t => t.userId === userId && t.type === 'income');
  const now = new Date();
  const alerts = goals.map(goal => {
    const saved = tx.filter(t => t.category === goal.category).reduce((s, t) => s + +t.amount, 0);
    const daysLeft = Math.ceil((new Date(goal.target_date) - now) / 86400000);
    const percent = saved / +goal.amount;
    return daysLeft <= 7 && percent < 0.9 ? `⏳ Goal '${goal.title}' is ${Math.round(percent * 100)}% funded with ${daysLeft} days left.` : null;
  }).filter(Boolean);
  return sendResponse(200, { message: 'Goal deadline alerts', data: alerts });
}
