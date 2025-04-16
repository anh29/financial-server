# 💾 Personal Finance Database Schema

A fully-documented schema for a personal finance app — including table purpose, headers, and field-level metadata.

---

## 📄 Users  
Stores basic user information and login credentials.

**Headers:**  
`id	username	email	password	avatar	email_verified	via_google	created_at`

**Fields:**
- 🔑 **id**: Unique user identifier  
- ✔️ **username**: User’s display name  
- ✔️ **email**: Login email address  
- ✔️ **password**: Encrypted user password  
- ❓ **avatar**: URL of the profile image  
- ✔️ **email_verified**: True if email is verified  
- ❓ **via_google**: True if signed up with Google  
- ✔️ **created_at**: Account creation timestamp  

---

## 🏦 Accounts  
Tracks user-linked accounts like wallets, banks, or credit cards.

**Headers:**  
`id	userId	name	type	default_account	currency	created_at`

**Fields:**
- 🔑 **id**: Account identifier  
- 🧍 **userId**: Owner of the account  
- ✔️ **name**: Account name (e.g., "Cash Wallet")  
- ✔️ **type**: Type (`cash`, `bank_manual`, `credit_manual`)  
- ❓ **default_account**: Marks as default account  
- ❓ **currency**: Account currency (`VND` by default)  
- ✔️ **created_at**: Account creation time  

---

## 💸 Transactions  
Logs user income and expenses for budgeting and analysis.

**Headers:**  
`id	userId	accountId	amount	type	description	category_id	tags	date	source	is_amortized	amortized_days	created_at`

**Fields:**
- 🔑 **id**: Transaction ID  
- 🧍 **userId**: Transaction owner  
- ✔️ **accountId**: Linked account  
- ✔️ **amount**: Transaction amount  
- ✔️ **type**: 'income' or 'expense'  
- ❓ **description**: Text note for context  
- ✔️ **category_id**: Related category  
- ❓ **tags**: Comma-separated tag IDs  
- ✔️ **date**: Transaction date  
- ❓ **source**: Source (manual, OCR, AI)  
- ❓ **is_amortized**: Spread over time  
- ❓ **amortized_days**: Amortization duration  
- ✔️ **created_at**: Timestamp added  

---

## 🏷️ Categories  
Classifies transactions for reporting and AI prediction.

**Headers:**  
`id	userId	label	key	icon	color	parent_id	keywords	is_custom`

**Fields:**
- 🔑 **id**: Category ID  
- 🧍 ❓ **userId**: Owner (only for custom categories)  
- ✔️ **label**: Visible name  
- ✔️ **key**: Internal AI/NLP key  
- ❓ **icon**: Icon for UI  
- ❓ **color**: Color code  
- ❓ **parent_id**: Parent category if nested  
- ❓ **keywords**: AI keyword hints  
- ❓ **is_custom**: True if user-defined  

---

## 🏷️ Tags  
User-generated labels to group and filter transactions.

**Headers:**  
`id	userId	label	color`

**Fields:**
- 🔑 **id**: Tag ID  
- 🧍 **userId**: Owner  
- ✔️ **label**: Tag text  
- ❓ **color**: UI colour  

---

## 🔗 TransactionTags  
Mapping table linking transactions and tags (many-to-many).

**Headers:**  
`id	transactionId	tagId`

**Fields:**
- 🔑 **id**: Mapping ID  
- ✔️ **transactionId**: Linked transaction  
- ✔️ **tagId**: Linked tag  

---

## 📊 Budgets  
Defines user budgets for categories and timeframes.

**Headers:**  
`id	userId	category_id	amount	period	start_date	end_date	created_at`

**Fields:**
- 🔑 **id**: Budget ID  
- 🧍 **userId**: Owner  
- ❓ **category_id**: Specific category or general  
- ✔️ **amount**: Budgeted amount  
- ✔️ **period**: Timeframe (monthly, weekly, custom)  
- ❓ **start_date**: Start of custom period  
- ❓ **end_date**: End of custom period  
- ✔️ **created_at**: When budget was created  

---

## 🎯 Goals  
Tracks user-defined financial goals like saving targets.

**Headers:**  
`id	userId	title	amount	description	target_date	amortized_days	category_id	status	created_at`

**Fields:**
- 🔑 **id**: Goal ID  
- 🧍 **userId**: Goal owner  
- ✔️ **title**: Goal name  
- ✔️ **amount**: Target value  
- ❓ **description**: Goal explanation  
- ✔️ **target_date**: Deadline  
- ❓ **amortized_days**: Cost spread period  
- ❓ **category_id**: Linked category  
- ❓ **status**: active, completed, cancelled  
- ✔️ **created_at**: Creation time  

---

## 🔁 RecurringPatterns  
Tracks repeated expenses (e.g., rent) for forecasting.

**Headers:**  
`id	userId	keyword	category_id	predicted_period	last_seen	avg_amount`

**Fields:**
- 🔑 **id**: Pattern ID  
- 🧍 **userId**: Owner  
- ✔️ **keyword**: Identified recurring term  
- ❓ **category_id**: Suggested category  
- ❓ **predicted_period**: Repeat interval in days  
- ✔️ **last_seen**: Last matched transaction date  
- ❓ **avg_amount**: Average value  

---

## 🧾 OCRReceipts  
Handles receipt uploads and extracts structured data.

**Headers:**  
`id	userId	file_url	raw_text	extracted_description	extracted_amount	predicted_category	predicted_date	status	created_at`

**Fields:**
- 🔑 **id**: Receipt ID  
- 🧍 **userId**: Owner  
- ✔️ **file_url**: Image URL  
- ❓ **raw_text**: OCR full output  
- ❓ **extracted_description**: Parsed name  
- ❓ **extracted_amount**: Detected value  
- ❓ **predicted_category**: AI guess  
- ❓ **predicted_date**: Inferred date  
- ✔️ **status**: pending, confirmed, rejected  
- ✔️ **created_at**: Upload time  

---

## 📚 ActivityLogs  
Captures user activities for tracking and audits.

**Headers:**  
`id	userId	action	entity	entity_id	details	timestamp`

**Fields:**
- 🔑 **id**: Log ID  
- 🧍 **userId**: Acting user  
- ✔️ **action**: Action performed  
- ✔️ **entity**: Affected table/entity  
- ✔️ **entity_id**: ID of affected item  
- ❓ **details**: Metadata (JSON)  
- ✔️ **timestamp**: Event time  

---

## 🔔 Notifications  
Sends alerts related to budgets, goals, or reminders.

**Headers:**  
`id	userId	type	message	status	created_at`

**Fields:**
- 🔑 **id**: Notification ID  
- 🧍 **userId**: Recipient  
- ✔️ **type**: Notification type  
- ✔️ **message**: Message body  
- ✔️ **status**: unread or read  
- ✔️ **created_at**: Created time
