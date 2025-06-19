/** 
 * SMART MODULES: All below are reusable, atomic logic handlers
 */
function monthStr(month) {
  const date = (month instanceof Date) ? month : new Date(month);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthDiffStrict(start, end, frequency) {
  const startDate = new Date(monthStr(start) + "-01");
  const endDate = new Date(monthStr(end) + "-01");

  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
               (endDate.getMonth() - startDate.getMonth()) + 1;

  if (frequency === "quarterly") return Math.ceil(months / 3);
  return months;
}

function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function findRowIndexById(sheetName, id) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idColIndex = headers.indexOf('id');

  if (idColIndex === -1) return -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][idColIndex] === id) {
      return i - 1; // Trả về chỉ số trong sheetToObjects (bỏ dòng header)
    }
  }

  return -1;
}

function appendRow(sheetName, rowObject) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => rowObject[h] !== undefined ? rowObject[h] : '');
  sheet.appendRow(row);
}

function monthDiff(start, end, frequency) {
  const startDate = new Date(monthStr(start) + "-01");
  const endDate = new Date(monthStr(end) + "-01");

  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();

  const totalMonths = years * 12 + months;
  if (frequency === "quarterly") return Math.ceil(totalMonths / 3) + 1;
  return totalMonths + 1;
}

function addPeriod(date, frequency, step = 1) {
  const d = new Date(date); // clone để không mutate
  if (frequency === 'quarterly') {
    d.setMonth(d.getMonth() + 3 * step);
  } else if (frequency === 'monthly') {
    d.setMonth(d.getMonth() + step);
  } else if (frequency === 'yearly') {
    d.setFullYear(d.getFullYear() + step);
  }
  return d;
}

function getDueDate(startDateStr, dayOfMonth, frequency, today = new Date()) {
  const start = new Date(startDateStr);
  const base = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);

  // nếu chưa tới hạn tháng này → lấy kỳ này
  if (base >= start && base >= today) return base;

  // nếu đã qua → cộng kỳ tiếp theo
  const next = new Date(base);
  next.setMonth(base.getMonth() + (frequency === 'quarterly' ? 3 : 1));
  return next;
}

function getBillDetails(e) {
  const { userId, bill_id } = e.parameter;
  if (!userId || !bill_id) return sendResponse(400, { message: "Missing userId or bill_id" });

  const today = new Date();
  const bills = sheetToObjects(TABLES.bills);
  const bill = bills.find(b => b.id === bill_id && b.userId === userId);
  if (!bill) return sendResponse(404, { message: "Bill not found" });

  const payments = sheetToObjects(TABLES.bill_payments)
    .filter(p => p.bill_id === bill_id && p.userId === userId)
    .sort((a, b) => new Date(b.date_paid) - new Date(a.date_paid)); // Descending

  const paidMonths = new Set(payments.map(p => monthStr(p.month_paid)));
  const lastPayment = payments[0] || null;

  const dueDay = Number(bill.day_of_month || 1);
  const dueDateThisMonth = new Date(today.getFullYear(), today.getMonth(), dueDay);
  const frequency = bill.frequency || "monthly";

  // ❗ Fix: Nếu chưa tới hạn thì kỳ này vẫn là tháng hiện tại
  const currentDueDate = (today <= dueDateThisMonth)
    ? dueDateThisMonth
    : addPeriod(dueDateThisMonth, frequency, 1);

  const dueMonthKey = monthStr(currentDueDate);
  const hasPaidThisPeriod = paidMonths.has(dueMonthKey);

  const monthsLeft = bill.end_date ? monthDiffStrict(today, bill.end_date, frequency) : null;
  const totalMonths = bill.end_date ? monthDiffStrict(bill.start_date, bill.end_date, frequency) : null;
  const progressRatio = totalMonths ? Math.min(1, payments.length / totalMonths) : null;

  return sendResponse(200, {
    message: `Fetched detail for bill ${bill.title}`,
    data: {
      bill_id: bill.id,
      title: bill.title,
      amount: Number(bill.amount),
      category: bill.category,
      frequency: bill.frequency,
      start_date: bill.start_date,
      end_date: bill.end_date || null,
      day_of_month: bill.day_of_month,
      status: bill.status,
      next_due_date: formatDate(currentDueDate),
      due_day: dueDay,
      paid_this_period: hasPaidThisPeriod,
      payment_status: hasPaidThisPeriod ? 'paid' : 'unpaid',
      last_paid_info: lastPayment ? {
        amount: Number(lastPayment.amount),
        month_paid: lastPayment.month_paid,
        date_paid: lastPayment.date_paid
      } : null,
      total_paid_count: payments.length,
      months_left: monthsLeft,
      progress_ratio: progressRatio,
      history: payments.map(p => ({
        payment_id: p.id,
        month_paid: p.month_paid,
        amount: Number(p.amount),
        date_paid: p.date_paid
      }))
    }
  });
}

function addBillsPayments(e) {
  const body = JSON.parse(e.postData.contents);
  const { bill_id, userId, amount, date_paid, month_paid } = body;
  const paidDate = new Date(date_paid || new Date());
  const paidMonth = monthStr(month_paid || paidDate);

  if (!bill_id || !userId || !amount || isNaN(amount)) {
    return sendResponse(400, { message: "Missing or invalid parameters" });
  }

  const billsSheet = TABLES.bills;
  const paymentsSheet = TABLES.billsPayments;
  const transactionsSheet = TABLES.transactions;

  const allBills = sheetToObjects(billsSheet);
  const bill = allBills.find(b => b.id === bill_id && b.userId === userId && b.status === 'active');
  if (!bill) {
    return sendResponse(404, { message: "Bill not found or not active" });
  }

  const { title, category, frequency, start_date, end_date } = bill;

  // Lấy danh sách thanh toán của bill
  const allPayments = sheetToObjects(paymentsSheet)
    .filter(p => p.bill_id === bill_id && p.userId === userId);

  // ❗ Kiểm tra đã thanh toán tháng này chưa
  const alreadyPaid = allPayments.some(p => monthStr(p.month_paid) === paidMonth);
  if (alreadyPaid) {
    return sendResponse(400, {
      message: `Already paid for this period: ${paidMonth}`
    });
  }

  // 1. Ghi vào bảng BillPayments
  const paymentRow = {
    id: Utilities.getUuid(),
    bill_id,
    userId,
    month_paid: paidMonth,
    date_paid: formatDate(paidDate),
    amount: Number(amount),
    created_at: new Date().toISOString()
  };
  appendRow(paymentsSheet, paymentRow);

  // 2. Kiểm tra trạng thái achieved nếu có end_date
  let isAchieved = false;
  if (end_date) {
    const totalMonths = monthDiffStrict(start_date, end_date, frequency);
    const uniqueMonthsPaid = new Set(allPayments.map(p => monthStr(p.month_paid)));
    uniqueMonthsPaid.add(paidMonth); // Tính thêm tháng hiện tại
    if (uniqueMonthsPaid.size >= totalMonths) {
      const idx = findRowIndexById(billsSheet, bill_id);
      if (idx !== -1) {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(billsSheet);
        sheet.getRange(idx + 2, getColumnIndex(billsSheet, 'status') + 1).setValue('achieved');
        isAchieved = true;
      }
    }
  }

  // 3. Ghi vào bảng Transactions
  const isRecurring = frequency === 'monthly' || frequency === 'quarterly';
  const amortizedDays = isRecurring ? 30 * (frequency === 'quarterly' ? 3 : 1) : '';

  const transactionRow = {
    id: Utilities.getUuid(),
    userId,
    amount: Number(amount),
    type: 'expense',
    description: `${title} ${paidMonth}`,
    category: category || 'Other',
    date: paidMonth,
    source: 'bill',
    is_amortized: isRecurring,
    amortized_days: amortizedDays,
    created_at: new Date().toISOString()
  };
  appendRow(transactionsSheet, transactionRow);

  return sendResponse(200, {
    message: `Added bill payment for ${title}${isAchieved ? ' and marked as achieved' : ''}`,
    data: {
      bill_id,
      payment_id: paymentRow.id,
      transaction_id: transactionRow.id,
      achieved: isAchieved
    }
  });
}

function getBillsByUser(e) {
  const { userId } = e.parameter;
  if (!userId) return sendResponse(400, { message: "Missing userId" });

  const timezone = Session.getScriptTimeZone();
  const today = new Date();
  const bills = sheetToObjects(TABLES.bills).filter(b => b.userId === userId && b.status === "active");
  const payments = sheetToObjects(TABLES.billsPayments).filter(p => p.userId === userId);

  const normalizeMonthKey = (val) => {
    try {
      const d = new Date(val);
      if (!isNaN(d)) return Utilities.formatDate(d, timezone, "yyyy-MM");
    } catch (e) {}
    return val?.slice?.(0, 7) || null;
  };

  function getFirstDueDate(start, dayOfMonth, interval = 1) {
    let year = start.getFullYear();
    let month = start.getMonth();
    while (true) {
      const trial = new Date(year, month, dayOfMonth);
      if (trial >= start) return trial;
      month += interval;
    }
  }

  const result = bills.map(bill => {
    const start = new Date(bill.start_date);
    const repeatType = bill.frequency || 'monthly';
    const interval = repeatType === 'quarterly' ? 3 : 1;
    const dayOfMonth = Number(bill.day_of_month || 1);

    const billPayments = payments.filter(p => p.bill_id == bill.id);
    const lastPayment = billPayments.sort((a, b) => new Date(b.date_paid) - new Date(a.date_paid))[0];
    const paidMonthSet = new Set(billPayments.map(p => normalizeMonthKey(p.month_paid)));

    let cycleDate = getFirstDueDate(start, dayOfMonth, interval);
    let dueDate = cycleDate;
    while (cycleDate <= today) {
      const key = Utilities.formatDate(cycleDate, timezone, "yyyy-MM");
      if (!paidMonthSet.has(key)) {
        dueDate = cycleDate;
        break;
      }
      cycleDate.setMonth(cycleDate.getMonth() + interval);
      dueDate = cycleDate;
    }

    const dueKey = Utilities.formatDate(dueDate, timezone, "yyyy-MM");
    const hasPaidThisPeriod = paidMonthSet.has(dueKey);

    // 🔍 Kiểm tra các kỳ chưa thanh toán trước kỳ hiện tại
    let isOverdue = false;
    let overdueDays = null;
    let checkDate = getFirstDueDate(start, dayOfMonth, interval);
    while (checkDate < dueDate) {
      const checkKey = Utilities.formatDate(checkDate, timezone, "yyyy-MM");
      const paid = paidMonthSet.has(checkKey);
      if (!paid && checkDate < today) {
        isOverdue = true;
        overdueDays = Math.floor((today - checkDate) / (1000 * 60 * 60 * 24));
        break;
      }
      checkDate.setMonth(checkDate.getMonth() + interval);
    }

    // ✅ Kiểm tra luôn chính kỳ hạn hiện tại nếu đã quá hạn mà chưa thanh toán
    if (!isOverdue && dueDate < today && !hasPaidThisPeriod) {
      isOverdue = true;
      overdueDays = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    }

    const nextDueDate = new Date(dueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + interval);

    let monthsLeft = null;
    let progressRatio = null;
    if (bill.end_date) {
      const totalMonths = monthDiffStrict(bill.start_date, bill.end_date, repeatType);
      monthsLeft = totalMonths - paidMonthSet.size;
      progressRatio = totalMonths > 0 ? parseFloat((paidMonthSet.size / totalMonths).toFixed(2)) : null;
    }

    return {
      bill_id: bill.id,
      title: bill.title,
      amount: Number(bill.amount),
      category: bill.category,
      repeat_type: repeatType,
      due_date: formatDate(dueDate),
      next_due_date: formatDate(nextDueDate),
      paid_this_period: hasPaidThisPeriod,
      payment_status: hasPaidThisPeriod ? "paid" : "unpaid",
      is_overdue: isOverdue,
      overdue_days: isOverdue ? overdueDays : null,
      days_until_due: !isOverdue ? Math.floor((dueDate - today) / (1000 * 60 * 60 * 24)) : null,
      last_paid_info: lastPayment
        ? {
            payment_date: lastPayment.date_paid,
            amount: Number(lastPayment.amount),
            month_paid: normalizeMonthKey(lastPayment.month_paid),
          }
        : null,
      total_paid_count: billPayments.length,
      months_left: monthsLeft,
      progress_ratio: progressRatio,
      start_date: start.toISOString(),
      end_date: bill.end_date ? new Date(bill.end_date).toISOString() : null,
    };
  });

  return sendResponse(200, {
    message: `Fetched ${result.length} bills for user ${userId}`,
    data: result,
  });
}

function cancelGoal(e) {
  const params = JSON.parse(e.postData.contents || '{}');
  const { userId, goal_id } = params;
  if (!userId || !goal_id) return sendResponse(400, { message: 'Missing userId or goal_id' });

  const sheet = SpreadsheetApp.getActive().getSheetByName(TABLES.goals);
  const goals = sheetToObjects(TABLES.goals);
  const goal = goals.find(g => g.id === goal_id && g.userId === userId);

  if (!goal || goal.status !== 'active') {
    return sendResponse(404, { message: 'Goal not found or already inactive' });
  }

  const idx = findRowIndexById(TABLES.goals, goal_id);
  const headers = getSheetHeaders(TABLES.goals);

  if (idx !== -1) {
    const statusCol = headers.indexOf('status') + 1;
    const cancelCol = headers.indexOf('cancelled_at') + 1;
    sheet.getRange(idx + 2, statusCol).setValue('cancelled');
    sheet.getRange(idx + 2, cancelCol).setValue(new Date().toISOString());
  }

  return sendResponse(200, {
    message: `Cancelled goal "${goal.description}"`,
    data: { goal_id, status: 'cancelled' }
  });
}

function addGoalContributions(e) {
  const body = JSON.parse(e.postData.contents);

  if (!Array.isArray(body) || body.length === 0) {
    return sendResponse(400, { message: 'Invalid or empty contribution list' });
  }

  const goalSheet = SpreadsheetApp.getActive().getSheetByName(TABLES.goals);
  const contribSheet = SpreadsheetApp.getActive().getSheetByName(TABLES.goalContributions);

  const goalHeaders = getSheetHeaders(TABLES.goals);
  const contribHeaders = getSheetHeaders(TABLES.goalContributions);

  const allGoals = sheetToObjects(TABLES.goals);
  const results = [];

  for (let entry of body) {
    const { goal_id, allocated, userId, created_at, month } = entry;
    if (!goal_id || !userId || !allocated || isNaN(allocated)) {
      results.push({ goal_id, status: 'skipped', reason: 'Missing or invalid fields' });
      continue;
    }

    // 1. Append to GoalContributions
    const row = {
      id: Utilities.getUuid(),
      userId,
      goal_id,
      month: month || monthStr(new Date()),
      amount: Number(allocated),
      source: 'manual',
      created_at: created_at || new Date().toISOString()
    };
    contribSheet.appendRow(contribHeaders.map(h => row[h] || ''));

    // 2. Update missing_amount in Goals
    const goal = allGoals.find(g => g.id === goal_id && g.userId === userId);
    if (goal) {
      const newMissing = Math.max(0, Number(goal.missing_amount || goal.amount) - Number(allocated));
      const idx = findRowIndexById(TABLES.goals, goal_id);
      if (idx !== -1) {
        const col = goalHeaders.indexOf('missing_amount') + 1;
        goalSheet.getRange(idx + 2, col).setValue(newMissing);
      }
    }

    results.push({ goal_id, status: 'added', amount: Number(allocated) });
  }

  return sendResponse(200, {
    message: `Processed ${results.length} contributions`,
    data: results
  });
}

function allocateSavingToGoals(e) {
  const { userId, amount } = e.parameter;
  if (!userId || !amount || isNaN(amount) || amount <= 0) {
    return sendResponse(400, { message: "Missing or invalid parameters" });
  }

  const today = new Date();
  const rawGoals = sheetToObjects(TABLES.goals)
    .filter(g => g.userId === userId && g.status === 'active' && Number(g.missing_amount) > 0);

  if (rawGoals.length === 0) {
    return sendResponse(200, { message: "No goals need funding", data: [] });
  }

  // Tính tổng thiếu
  const totalMissing = rawGoals.reduce((sum, g) => sum + Number(g.missing_amount), 0);

  // Gán điểm ưu tiên cho mỗi goal
  const weightedGoals = rawGoals.map(g => {
    const missing = Number(g.missing_amount);
    const deadline = g.target_date ? new Date(g.target_date) : new Date("2100-01-01");
    const monthsLeft = Math.max(1, (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth()));

    const deadlineScore = 1 / monthsLeft;
    const missingScore = missing / totalMissing;

    const priorityScore = deadlineScore * 0.7 + missingScore * 0.3;

    return {
      goal_id: g.id,
      title: g.title,
      missing,
      priorityScore
    };
  });

  // Tổng điểm
  const totalPriority = weightedGoals.reduce((sum, g) => sum + g.priorityScore, 0);

  // Phân bổ theo điểm
  let remaining = Number(amount);
  const allocations = [];

  weightedGoals.forEach((g, idx) => {
    const idealAlloc = Math.round((g.priorityScore / totalPriority) * amount);
    const actualAlloc = Math.min(idealAlloc, g.missing, remaining);
    if (actualAlloc <= 0) return;

    const goalRaw = rawGoals.find(r => r.id === g.goal_id);

    allocations.push({
      goal_id: g.goal_id,
      allocated: actualAlloc,
      ...goalRaw  // thêm toàn bộ dữ liệu của goal
    });

    remaining -= actualAlloc;
  });

  return sendResponse(200, {
    message: `Smart allocation of ${amount} across ${allocations.length} goals`,
    data: allocations.filter(a => a.allocated > 0)
  });
}

function getRemainingBudget(e) {
  const { userId, month } = e.parameter;
  if (!userId || !month) {
    return sendResponse(400, { message: "Missing 'userId' or 'month' parameter." });
  }

  const budgets = sheetToObjects(TABLES.monthlyBudgets);
  const transactions = sheetToObjects(TABLES.transactions);
  const goalContributions = sheetToObjects(TABLES.goalContributions);

  const budget = budgets.find(b => b.userId === userId && monthStr(b.month) === month);
  const totalBudget = budget ? Number(budget.amount) : 0;

  let totalSpent = 0;

  transactions.forEach(t => {
    if (t.userId !== userId || t.type !== 'expense') return;

    const isAmortized = t.is_amortized === true || t.is_amortized === 'TRUE';
    const amount = Number(t.amount || 0);
    const transDate = new Date(t.date);

    if (!isAmortized) {
      if (monthStr(transDate) === month) {
        totalSpent += amount;
      }
    } else {
      const amortizedDays = parseInt(t.amortized_days || 0, 10);
      const daysPerMonth = getAmortizedDaysByMonth(transDate, amortizedDays);
      if (daysPerMonth[month]) {
        const allocated = (daysPerMonth[month] / amortizedDays) * amount;
        totalSpent += Math.round(allocated);
      }
    }
  });

  // ✅ Tổng tiền đã phân bổ cho goals
  const totalGoalAllocated = goalContributions
    .filter(gc => gc.userId === userId && monthStr(gc.month) === month)
    .reduce((sum, gc) => sum + Number(gc.amount || 0), 0);

  const remaining = totalBudget - totalSpent - totalGoalAllocated;

  return sendResponse(200, {
    message: `Remaining budget for ${month}`,
    data: {
      month,
      totalBudget,
      totalSpent,
      totalGoalAllocated,
      remainingBudget: remaining
    }
  });
}

function getUserGoalsWithProgress(e) {
  const { userId } = e.parameter;
  if (!userId) return sendResponse(400, { message: 'Missing userId' });

  const goals = sheetToObjects(TABLES.goals).filter(g => g.userId === userId && g.status === 'active');
  const contributions = sheetToObjects(TABLES.goalContributions).filter(c => c.userId === userId);
  const transactions = sheetToObjects(TABLES.transactions).filter(t => t.userId === userId && t.type === 'expense');
  const monthlyBudgets = sheetToObjects(TABLES.monthlyBudgets).filter(b => b.userId === userId);

  const currentMonth = monthStr(new Date());
  const budgetThisMonth = monthlyBudgets.find(b => monthStr(b.month) === currentMonth);
  const totalBudget = budgetThisMonth ? +budgetThisMonth.amount : 0;
  const expensesThisMonth = transactions.filter(t => monthStr(t.date) === currentMonth).reduce((sum, t) => sum + Number(t.amount), 0);
  const budgetSurplus = Math.max(0, totalBudget - expensesThisMonth);
  const now = new Date();

  const result = goals.map(goal => {
    const goalId = goal.id;
    const targetAmount = Number(goal.amount);
    const targetDate = goal.target_date ? new Date(goal.target_date) : null;

    const savedContribs = contributions.filter(c => c.goal_id === goalId);

    const currentSaved = savedContribs.reduce((s, c) => s + Number(c.amount), 0);
    const progressPercent = Math.min(100, Math.round((currentSaved / targetAmount) * 100));

    const monthsLeft = targetDate
      ? Math.max(1, (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth()))
      : 1;

    const forecast = [];
    for (let i = 0; i < monthsLeft; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + i);
      forecast.push({ month: monthStr(d), required: Math.ceil((targetAmount - currentSaved) / monthsLeft) });
    }

    // history by contribution month
    const history = {};
    savedContribs.forEach(c => {
      const m = c.month;
      history[m] = (history[m] || 0) + Number(c.amount);
    });

    const historyArr = Object.entries(history).map(([month, amount]) => ({ month, amount }));

    return {
      goal_id: goalId,
      title: goal.title,
      target_amount: targetAmount,
      current_saved: currentSaved,
      progress_percent: progressPercent,
      months_left: monthsLeft,
      monthly_required: Math.ceil((targetAmount - currentSaved) / monthsLeft),
      budget_surplus: budgetSurplus,
      suggested_saving_this_month: Math.min(budgetSurplus, (targetAmount - currentSaved) / monthsLeft),
      status: goal.status,
      history: historyArr,
      forecast
    };
  });

  return sendResponse(200, {
    message: `Fetched goal progress with history and forecast for user ${userId}`,
    data: result
  });
}

function saveGoalContribution(e) {
  const body = JSON.parse(e.postData.contents);
  const { userId, goal_id, amount, source, month } = body;

  if (!userId || !goal_id || !amount) {
    return sendResponse(400, { message: 'Missing required fields' });
  }

  const headers = getSheetHeaders(TABLES.goalContributions);
  const row = {
    id: Utilities.getUuid(),
    userId,
    goal_id,
    month: month || monthStr(new Date()),
    amount: Number(amount),
    source: source || 'manual',
    created_at: new Date().toISOString()
  };

  SpreadsheetApp.getActive()
    .getSheetByName(TABLES.goalContributions)
    .appendRow(headers.map(h => row[h] || ''));

  return sendResponse(201, { message: 'Saved contribution', data: row });
}

function getExpensesTransactions(e) {
  const { userId } = e.parameter;
  if (!userId) return sendResponse(400, { message: "Missing userId" });

  const transactions = sheetToObjects(TABLES.transactions);

  const userExpenses = transactions
    .filter(transaction => transaction.userId === userId && transaction.type === 'expense')
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

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
