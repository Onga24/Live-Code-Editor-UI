import axios from "./axios"; 

export const getAISuggestion = async (prompt) => {
  try {
    const res = await axios.post("/ai-autocomplete", { prompt });
    return res.data.suggestion;
  } catch (err) {
    console.error("AI autocomplete error", err);
    return null;
  }
};
