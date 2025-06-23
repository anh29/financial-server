function monthlyCategoryExpenses(userId) {
  const today = new Date();
  const currentMonth = monthStr(today);
  const toMonth = currentMonth;

  const fromDate = new Date(today);
  fromDate.setMonth(fromDate.getMonth() - 5);
  const fromMonth = monthStr(fromDate);

  const tx = sheetToObjects(TABLES.transactions)
    .filter(t => t.userId === userId);

  const expenses = tx.filter(t => t.type === 'expense');
  const incomes = tx.filter(t => t.type === 'income');

  const expenseMap = {}; // { [month]: { [category]: amount } }
  const incomeMap = {};  // { [month]: totalIncome }

  // Xử lý chi tiêu
  expenses.forEach((t, index) => {
    const amount = Number(t.amount || 0);
    if (!amount || isNaN(amount)) return;

    const category = t.category || "Không xác định";
    const date = new Date(t.date || t.created_at);
    const month = monthStr(date);

    if (t.is_amortized === true || t.is_amortized === 'TRUE') {
      const amortizedDays = parseInt(t.amortized_days || 0, 10);
      const daysPerMonth = getAmortizedDaysByMonth(date, amortizedDays);

      for (let m in daysPerMonth) {
        if (m < fromMonth || m > toMonth) continue;
        const proportion = daysPerMonth[m] / amortizedDays;
        const allocated = Math.round(amount * proportion);

        if (!expenseMap[m]) expenseMap[m] = {};
        expenseMap[m][category] = (expenseMap[m][category] || 0) + allocated;
      }
    } else {
      if (month < fromMonth || month > toMonth) return;

      if (!expenseMap[month]) expenseMap[month] = {};
      expenseMap[month][category] = (expenseMap[month][category] || 0) + amount;
    }
  });

  // Xử lý thu nhập
  incomes.forEach(t => {
    const amount = Number(t.amount || 0);
    if (!amount || isNaN(amount)) return;

    const date = new Date(t.date || t.created_at);
    const month = monthStr(date);
    if (month < fromMonth || month > toMonth) return;

    incomeMap[month] = (incomeMap[month] || 0) + amount;
  });

  // Tổng hợp kết quả
  const allMonths = new Set([...Object.keys(expenseMap), ...Object.keys(incomeMap)]);
  const formatted = Array.from(allMonths).sort().map(month => {
    const categoriesRaw = expenseMap[month] || {};
    const categoryEntries = Object.entries(categoriesRaw)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => ({
        category: cat,
        amount: Math.round(amt)
      }));

    const totalSpent = categoryEntries.reduce((sum, c) => sum + c.amount, 0);
    const totalIncome = Math.round(incomeMap[month] || 0);

    return {
      month,
      totalIncome,
      totalSpent,
      categories: categoryEntries
    };
  });

  return formatted;
}

function getMonthlyCategoryExpenses(e) {
  const { userId } = e.parameter;
  if (!userId) return sendResponse(400, { message: "Missing userId" });

  const monthlyExpenses = monthlyCategoryExpenses(userId);

  return sendResponse(200, {
    message: "Monthly category spending with totals",
    data: monthlyExpenses
  });
}

// getMonthlyCategoryExpenses({
//   "parameter": {
//     "userId": "user123"
//   }
// })

function getSimpleBills(userId) {
  const bills = sheetToObjects(TABLES.bills).filter(b => b.userId === userId && b.status === 'active');

  const simplified = bills.map(b => ({
    title: b.title || '',
    category: b.category,
    amount: Number(b.amount || 0)
  }));

  return simplified;
}

function suggestSmartBudget(e) {
  const { userId } = e.parameter;
  if (!userId) return sendResponse(400, { message: "Missing userId" });

  const monthlyBudgets = monthlyCategoryExpenses(userId);
  const bills = getSimpleBills(userId);

  return sendResponse(200, {
    message: "data suggest smart budget",
    data: {
      monthlyBudgets,
      bills
    }
  });
}

// suggestSmartBudget({
//   "parameter": {
//     "userId": "user123"
//   }
// })
