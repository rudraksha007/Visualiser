import express from "express";
import ViteExpress from "vite-express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();

app.get("/token", async (req, res) => {
  const token = await client.realtime.createTemporaryToken({ expires_in: 60 });
  res.json({ token });
});

app.post("/prompt", async (req, res) => {
  const { prompt } = req.body;

  // const genAI = new GoogleGenerativeAI("");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
  res.json({ result: result.response.text() });
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
