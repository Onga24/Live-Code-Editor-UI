// src/lib/aiService.js
export async function getAIResponse(message, currentFile, allFiles) {
  try {
    const res = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, currentFile, allFiles }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("AI RAW Response:", data);

    // استخراج النص من استجابة OpenAI
    const text =
      data?.output?.[0]?.content?.[0]?.text ||
      data?.choices?.[0]?.message?.content ||
      "⚠️ الرد فاضي";

    return text;
  } catch (error) {
    console.error("AI Error:", error);
    return "⚠️ حصل خطأ في الاتصال بالسيرفر.";
  }
}
