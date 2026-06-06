import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { DefaultAzureCredential } from "@azure/identity";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ENDPOINT = process.env.VITE_AZURE_ENDPOINT;
const PROJECT = process.env.VITE_AZURE_PROJECT;
const AGENT_NAME = process.env.VITE_AGENT_NAME;
const credential = new DefaultAzureCredential();

async function getHeaders() {
  const token = await credential.getToken("https://ai.azure.com/.default");
  return {
    "Authorization": `Bearer ${token.token}`,
    "Content-Type": "application/json",
  };
}

app.post("/api/research", async (req, res) => {
  const { question } = req.body;
  try {
    const HEADERS = await getHeaders();
    const url = `${ENDPOINT}/api/projects/${PROJECT}/agents/${AGENT_NAME}/endpoint/protocols/openai/responses?api-version=2025-05-15-preview`;

    const response = await axios.post(url, {
      input: question,
      stream: false,
    }, { headers: HEADERS });

    const output = response.data?.output;

    let text = "No response.";
    if (Array.isArray(output)) {
      const msgBlock = output.find(o => o.type === "message");
      const contentBlock = msgBlock?.content?.find(c => c.type === "output_text");
      text = contentBlock?.text || "No response.";
    }

    res.json({ text, annotations: [] });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.listen(3001, () => console.log("✅ Server running on http://localhost:3001"));