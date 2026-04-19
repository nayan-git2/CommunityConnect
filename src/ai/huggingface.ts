import axios from 'axios';

const HF_API_KEY = (import.meta as any).env.VITE_HUGGINGFACE_API_KEY;
const MODEL = "facebook/bart-large-mnli";

export async function classifyReport(text: string) {
  if (!HF_API_KEY) {
    console.warn("Hugging Face API Key missing. Skipping classification.");
    return null;
  }

  console.log("Hugging Face: Attempting classification...");
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        inputs: text,
        parameters: {
          candidate_labels: ["food shortage", "water problem", "medical emergency", "shelter issue", "education need"]
        }
      },
      {
        headers: { 
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.message === 'Network Error') {
      console.error("Hugging Face Network Error: This often happens due to CORS restrictions in the browser or an invalid API key. Ensure VITE_HUGGINGFACE_API_KEY is correct and has 'Inference' permissions.");
    } else {
      console.error("Hugging Face Classification Error:", error.response?.data || error.message);
    }
    return null;
  }
}
