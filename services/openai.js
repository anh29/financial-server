const buildPromptFromData = (budgetData, totalBudget) => {
  const allBudgets = budgetData.monthlyBudgets || [];
  const monthlyBudgets = allBudgets.slice(-6); // ✅ Chỉ lấy tối đa 6 tháng gần nhất
  const bills = budgetData.bills || [];
  
  const incomes = monthlyBudgets.map(b => b.totalIncome || 0);
  const minIncome = Math.min(...incomes);
  const avgIncome = incomes.reduce((sum, v) => sum + v, 0) / (incomes.length || 1);

  const savingRate = 0.15;
  const avgIncomeAfterSaving = avgIncome * (1 - savingRate);
  const minIncomeAfterSaving = minIncome * (1 - savingRate);

  const fixedCost = bills.reduce((sum, b) => sum + (b.amount || 0), 0);

  const billsFormatted = bills.map(b =>
    `- ${b.title} (${b.category}): ${b.amount.toLocaleString()} VND`
  ).join("\n");

  const recentSpendingStats = monthlyBudgets.map(b => {
    const cat = (b.categories || []).map(c =>
      `    + ${c.category}: ${c.amount.toLocaleString()} VND`
    ).join("\n");
    return `Tháng ${b.month}:
  - Thu nhập: ${b.totalIncome.toLocaleString()} VND
  - Chi tiêu: ${b.totalSpent?.toLocaleString?.() || "N/A"} VND
  - Phân bổ:\n${cat}`;
  }).join("\n\n");

  return `Bạn là một chuyên gia tư vấn tài chính cá nhân.

Nhiệm vụ của bạn:
- Giúp người dùng tại Việt Nam lập ngân sách tháng tới thật hợp lý, dựa trên lịch sử thu nhập tối đa 6 tháng gần nhất.
- Tổng chi tiêu tháng tới KHÔNG ĐƯỢC vượt quá mức trung bình hoặc thấp nhất của 6 tháng gần nhất (chọn mức thấp hơn để đảm bảo tiết kiệm).
- Trước tiên, phải **giữ nguyên 100% chi phí của các hóa đơn cố định** đã biết (ví dụ: tiền nhà, tiền học, bảo hiểm...), gán đúng vào danh mục tương ứng.
- Sau khi trừ đi tổng hóa đơn cố định, phần ngân sách còn lại mới được phép phân bổ cho các danh mục khác.
- Không được ghi giá trị danh mục nào thấp hơn hóa đơn tương ứng. Ví dụ: nếu “Tiền nhà” là 500,000 thì ngân sách mục “Nhà cửa” phải ≥ 500,000 VND để đảm bảo thanh toán.
- Ngoài hóa đơn, hãy cộng thêm một khoản nhỏ trong danh mục tương ứng để phục vụ nhu cầu sống thực tế (ví dụ: nhà cửa còn có điện, nước, wifi…).
- Luôn ưu tiên phân bổ ngân sách cho các danh mục thiết yếu: nhà cửa, ăn uống, sức khỏe, di chuyển, giáo dục. Các danh mục này không được phép có giá trị 0.
- Tất cả các danh mục **đều phải có một khoản chi tiêu tối thiểu (>= 50,000 VND)**. Không được để danh mục nào là 0.
- KHÔNG ĐƯỢC để bất kỳ danh mục nào có giá trị 0. Ngay cả các danh mục không thiết yếu như 'Giải trí', 'Du lịch', 'Mua sắm', 'Xã hội' cũng bắt buộc phải có một khoản tối thiểu (ví dụ 50,000 VND) – để phản ánh chi tiêu thực tế trong cuộc sống. **Đây là ràng buộc cứng.**
- Nếu ngân sách không đủ, hãy điều chỉnh để mỗi danh mục vẫn giữ ít nhất mức tối thiểu này – không được bỏ trống.
- Phân bổ ngân sách không chỉ dựa trên hóa đơn mà còn dựa trên nhu cầu thực tế của người dùng trong đời sống hàng tháng.
- Nếu ngân sách không đủ, chỉ cắt giảm ở các mục không thiết yếu (giải trí, mua sắm, xã hội, du lịch).
- Giải thích rõ lý do phân bổ, nhấn mạnh tư duy tiết kiệm, phòng ngừa rủi ro, giúp người dùng cải thiện tài chính lâu dài.
- Phần "reasoning" không được nhắc đến tổng ngân sách. Thay vào đó, hãy phân tích theo ngữ cảnh tài chính thực tế và mục tiêu tiết kiệm, giúp người dùng hiểu logic phân bổ mà không cần biết con số tổng.
- Chỉ trả lời JSON hợp lệ, không viết thêm văn bản ngoài JSON.

Thông tin đầu vào:
- Tổng ngân sách tháng tới (giới hạn cứng, đã trừ tiết kiệm): ${totalBudget.toLocaleString()} VND
- Thu nhập trung bình 6 tháng (sau tiết kiệm): ${Math.round(avgIncomeAfterSaving).toLocaleString()} VND
- Thu nhập thấp nhất 6 tháng (sau tiết kiệm): ${Math.round(minIncomeAfterSaving).toLocaleString()} VND
- Tổng hóa đơn cố định: ${fixedCost.toLocaleString()} VND
- Chi tiết hóa đơn cố định:
${billsFormatted}

Thống kê chi tiêu gần đây:
${recentSpendingStats}

Ghi chú:
- Người dùng cần chi cho các nhu cầu sống: nhà ở, ăn uống, di chuyển, sức khỏe, v.v.
- Trước tiên, phải giữ nguyên giá trị hóa đơn cố định, gán vào đúng danh mục.
- Sau đó, cộng thêm chi phí sinh hoạt thực tế nếu cần thiết.
- Không được để bất kỳ danh mục nào thấp hơn giá trị hóa đơn tương ứng.
- Luôn phải tính toán phần ngân sách còn lại **sau khi trừ hóa đơn** để phân bổ cho các danh mục khác.
- Không được để danh mục nào có giá trị là 0. Ngay cả 'Du lịch', 'Xã hội' hay 'Mua sắm' cũng nên có một khoản nhỏ để phản ánh thực tế chi tiêu dù tối thiểu.
- Nếu ngân sách không đủ, cắt giảm ở mục Giải trí, Du lịch, Mua sắm hoặc Xã hội — nhưng hãy ưu tiên nhu cầu sống tối thiểu.

Format bắt buộc (JSON hợp lệ):
{
  "categories": [
    { "category": "Nhà cửa", "amount": 50000 },
    { "category": "Ăn uống", "amount": 50000 },
    { "category": "Di chuyển", "amount": 50000 },
    { "category": "Giải trí", "amount": 50000 },
    { "category": "Mua sắm", "amount": 50000 },
    { "category": "Giáo dục", "amount": 50000 },
    { "category": "Sức khoẻ", "amount": 50000 },
    { "category": "Đầu tư", "amount": 50000 },
    { "category": "Xã hội", "amount": 50000 },
    { "category": "Du lịch", "amount": 50000 }
  ],
  "reasoning": "[Viết 1 đoạn văn (~4–6 câu) phân tích chuyên sâu về cách phân bổ, đảm bảo khớp với số liệu đã phân bổ ở trên. Không được liệt kê từng danh mục, không nhắc lại tổng ngân sách. Phân tích cần thể hiện sự cân nhắc tài chính thực tế giữa nhu cầu thiết yếu, hóa đơn cố định, thói quen chi tiêu, và khả năng tiết kiệm. Văn phong như lời tư vấn của một chuyên gia tài chính, rõ ràng và có tính thuyết phục.]"
}

Chỉ trả lời JSON. Không viết thêm văn bản bên ngoài.`;
};

module.exports = {
  buildPromptFromData,
};
