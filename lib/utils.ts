import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseAIResponse(text: string) {
  // 1. Remove Markdown code blocks
  let cleanText = text.replace(/```json\s*|\s*```/g, "").replace(/```/g, "").trim();

  // 2. Find the first valid JSON array or object start
  const firstOpenBrace = cleanText.indexOf("{");
  const firstOpenBracket = cleanText.indexOf("[");
  
  let startIndex = -1;
  let openChar = '';
  let closeChar = '';

  if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
    startIndex = firstOpenBrace;
    openChar = '{';
    closeChar = '}';
  } else if (firstOpenBracket !== -1) {
    startIndex = firstOpenBracket;
    openChar = '[';
    closeChar = ']';
  }

  if (startIndex === -1) {
     throw new Error("No JSON start found");
  }

  // 3. Find the matching closing bracket using a counter
  let balance = 0;
  let endIndex = -1;
  
  for (let i = startIndex; i < cleanText.length; i++) {
    const char = cleanText[i];
    if (char === openChar) {
      balance++;
    } else if (char === closeChar) {
      balance--;
      if (balance === 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (endIndex !== -1) {
    cleanText = cleanText.substring(startIndex, endIndex + 1);
  }

  // 4. Remove trailing commas (common LLM error)
  cleanText = cleanText.replace(/,(\s*[\]}])/g, "$1");

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse cleaned JSON:", cleanText);
    throw new Error("Invalid JSON format");
  }
}
