# API Phân Bổ Ngân Sách Thông Minh

API này sử dụng OpenAI để phân tích dữ liệu chi tiêu và đưa ra gợi ý phân bổ ngân sách hợp lý cho tháng tới.

## Endpoint

### GET /budget/suggest/:userId

Gọi OpenAI API để phân tích dữ liệu chi tiêu và đưa ra gợi ý phân bổ ngân sách thông minh.

#### Parameters
- `userId` (string, required): ID của người dùng

#### Response

**Success (200):**
```json
{
  "status": 200,
  "message": "Smart budget suggestion generated successfully",
  "data": {
    "originalData": {
      "monthlyBudgets": [...],
      "bills": [...]
    },
    "suggestion": {
      "total_budget": 5000000,
      "categories": [
        {
          "category": "Nhà cửa",
          "amount": 500000
        },
        {
          "category": "Ăn uống",
          "amount": 1200000
        },
        {
          "category": "Di chuyển",
          "amount": 500000
        },
        {
          "category": "Mua sắm",
          "amount": 800000
        },
        {
          "category": "Giải trí",
          "amount": 400000
        },
        {
          "category": "Giáo dục",
          "amount": 600000
        },
        {
          "category": "Sức khoẻ",
          "amount": 300000
        },
        {
          "category": "Đầu tư",
          "amount": 500000
        },
        {
          "category": "Xã hội",
          "amount": 200000
        },
        {
          "category": "Du lịch",
          "amount": 0
        }
      ],
      "reasoning": "Dựa trên lịch sử chi tiêu 3 tháng qua, tôi đề xuất phân bổ ngân sách như sau..."
    }
  }
}
```

**Error (400):**
```json
{
  "status": 400,
  "message": "userId is required"
}
```

**Error (500):**
```json
{
  "status": 500,
  "message": "Internal server error"
}
```

## Cách hoạt động

1. **Lấy dữ liệu**: API gọi Google Apps Script để lấy dữ liệu chi tiêu và bills của người dùng
2. **Tính toán ngân sách**: Tính trung bình thu nhập 3 tháng gần nhất làm ngân sách cơ sở
3. **Tạo prompt**: Format dữ liệu thành prompt chi tiết cho OpenAI
4. **Gọi OpenAI**: Sử dụng GPT-3.5-turbo để phân tích và đưa ra gợi ý
5. **Trả về kết quả**: Parse response JSON và trả về cho client

## Các danh mục chi tiêu

API sẽ phân bổ ngân sách cho 10 danh mục:
- Di chuyển
- Ăn uống  
- Mua sắm
- Giải trí
- Nhà cửa
- Giáo dục
- Sức khoẻ
- Đầu tư
- Xã hội
- Du lịch

## Environment Variables

Đảm bảo các biến môi trường sau được cấu hình:
- `GOOGLE_APPS_SCRIPT_URL`: URL của Google Apps Script
- `OPENAI_API_KEY`: API key của OpenAI

## Ví dụ sử dụng

```bash
curl -X GET "http://localhost:3000/budget/suggest/user123"
```

## Lưu ý

- API sẽ ưu tiên trừ các khoản bill cố định trước khi phân bổ cho các danh mục khác
- Gợi ý dựa trên lịch sử chi tiêu và thu nhập của người dùng
- Response từ OpenAI được parse để đảm bảo format JSON hợp lệ 