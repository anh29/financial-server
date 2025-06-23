const axios = require("axios");
const OpenAI = require("openai");
const { GOOGLE_SCRIPT_URL, OPENAI_API } = require("../utils/constants");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const { buildPromptFromData } = require("../services/openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API,
});

const suggestSmartBudget = async (req, res) => {
  try {
    console.log("Starting suggestSmartBudget function");

    const { userId } = req.params;
    console.log("Received userId:", userId);

    if (!userId) {
      console.log("userId is missing");
      return errorResponse(res, 400, "userId is required");
    }

    // Call Google Apps Script API to get budget data with timeout
    console.log("Calling Google Apps Script API");
    const budgetDataResponse = await axios.get(
      `${GOOGLE_SCRIPT_URL}?path=suggestSmartBudget&userId=${userId}`,
      { timeout: 10000 } // Set timeout to 10 seconds
    );

    console.log("Google Apps Script API response received");

    if (budgetDataResponse.data.status !== 200) {
      console.log("Failed to fetch budget data");
      return errorResponse(res, 400, "Failed to fetch budget data");
    }

    const budgetData = budgetDataResponse.data.data;
    console.log("Budget data:", budgetData);

    // Calculate total budget for next month (average of last 3 months income)
    const monthlyBudgets = budgetData.monthlyBudgets;
    const recentIncomes = monthlyBudgets
      .slice(-3)
      .map((budget) => budget.totalIncome);
    const averageIncome =
      recentIncomes.reduce((sum, income) => sum + income, 0) /
      recentIncomes.length;
    const totalBudget = Math.round(averageIncome);

    console.log("Calculated total budget:", totalBudget);

    // Call OpenAI API with timeout
    console.log("Calling OpenAI API");
    const prompt = buildPromptFromData(budgetData, totalBudget);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Bạn là một trợ lý tài chính cá nhân chuyên nghiệp. Luôn tuân thủ các nguyên tắc sau khi tư vấn ngân sách tháng tới cho người dùng Việt Nam:\n- Tổng chi tiêu tháng tới KHÔNG ĐƯỢC vượt quá mức trung bình hoặc thấp nhất của tối đa 6 tháng gần nhất (chọn mức thấp hơn để đảm bảo tiết kiệm).\n- Ưu tiên phân bổ cho các danh mục thiết yếu: nhà cửa, ăn uống, sức khỏe, di chuyển, giáo dục. Nếu ngân sách không đủ, chỉ cắt giảm ở các mục không thiết yếu (giải trí, mua sắm, xã hội, du lịch).\n- Tất cả các danh mục đều phải có giá trị tối thiểu (>= 50,000 VND). Không được để giá trị 0.\n- Chỉ trả lời JSON hợp lệ, không viết thêm văn bản ngoài JSON. Đảm bảo tất cả property names đều được đặt trong dấu ngoặc kép.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });

    console.log("OpenAI API response received");

    const responseContent = completion.choices[0].message.content.trim();
    console.log("OpenAI Response:", responseContent);

    // Try to parse JSON response with improved logic
    let parsedResponse;
    try {
      // Remove markdown code blocks
      const cleanedResponse = responseContent.replace(/```json|```/g, "").trim();

      // Remove invalid characters (e.g., commas in numeric values)
      const sanitizedResponse = cleanedResponse.replace(/(\d),(\d)/g, "$1$2");

      // Parse sanitized JSON
      parsedResponse = JSON.parse(sanitizedResponse);
    } catch (parseError1) {
      console.log("Error parsing OpenAI response:", parseError1);
      try {
        // Fallback: Extract JSON object from text
        const jsonObjectMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          const sanitizedFallback = jsonObjectMatch[0].replace(/(\d),(\d)/g, "$1$2");
          parsedResponse = JSON.parse(sanitizedFallback);
        } else {
          throw new Error("No valid JSON found in response");
        }
      } catch (parseError2) {
        console.log("Fallback logic due to parsing error:", parseError2);
        const totalBills = budgetData.bills.reduce(
          (sum, bill) => sum + bill.amount,
          0
        );
        const remainingBudget = totalBudget - totalBills;

        parsedResponse = {
          categories: [
            { category: "Di chuyển", amount: Math.round(remainingBudget * 0.1) },
            { category: "Ăn uống", amount: Math.round(remainingBudget * 0.25) },
            { category: "Mua sắm", amount: Math.round(remainingBudget * 0.15) },
            { category: "Giải trí", amount: Math.round(remainingBudget * 0.1) },
            { category: "Nhà cửa", amount: totalBills },
            { category: "Giáo dục", amount: Math.round(remainingBudget * 0.15) },
            { category: "Sức khoẻ", amount: Math.round(remainingBudget * 0.1) },
            { category: "Đầu tư", amount: Math.round(remainingBudget * 0.1) },
            { category: "Xã hội", amount: Math.round(remainingBudget * 0.03) },
            { category: "Du lịch", amount: Math.round(remainingBudget * 0.02) },
          ],
          reasoning:
            "Tự động phân bổ ngân sách dựa trên tỷ lệ chuẩn do lỗi parse AI response",
        };
      }
    }

    console.log("Parsed response:", parsedResponse);

    return successResponse(
      res,
      200,
      "Smart budget suggestion generated successfully",
      parsedResponse
    );
  } catch (error) {
    console.error("Error in suggestSmartBudget:", error);

    if (error.response) {
      return errorResponse(
        res,
        error.response.status,
        error.response.data?.message || "External API error"
      );
    }

    return errorResponse(res, 500, "Internal server error");
  }
};

module.exports = {
  suggestSmartBudget,
};
