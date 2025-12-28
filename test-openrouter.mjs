#!/usr/bin/env node

const apiKey = process.env.OPENROUTER_API_KEY;
const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

if (!apiKey) {
  console.error("ERROR: OPENROUTER_API_KEY not set");
  process.exit(1);
}

console.log("Testing OpenRouter API connection...");
console.log(`API Key: ${apiKey.substring(0, 20)}...`);

const payload = {
  model: "google/gemini-3-pro-preview",
  messages: [
    {
      role: "user",
      content: "Say hello in one word",
    },
  ],
  max_tokens: 100,
};

console.log("\nSending request...");
console.log("Payload:", JSON.stringify(payload, null, 2));

fetch(apiUrl, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
})
  .then((response) => {
    console.log(`\nResponse status: ${response.status}`);
    console.log(`Response headers:`, {
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
    });
    return response.json();
  })
  .then((data) => {
    console.log("\nResponse data:");
    console.log(JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log("\n✅ SUCCESS: Got valid response");
      console.log("Message content:", data.choices[0].message.content);
    } else {
      console.log("\n❌ ERROR: Invalid response structure");
    }
  })
  .catch((error) => {
    console.error("\n❌ ERROR:", error.message);
    process.exit(1);
  });
