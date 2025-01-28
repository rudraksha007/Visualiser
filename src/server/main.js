import express from "express";
import ViteExpress from "vite-express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());

app.get("/token", async (req, res) => {
  const token = await client.realtime.createTemporaryToken({ expires_in: 60 });
  res.json({ token });
});

app.post("/prompt", async (req, res) => {
  const { prompt } = req.body;

  const genAI = new GoogleGenerativeAI("AIzaSyD13vuuXNLpmeQwAT3s5O1LvTdA6yWyg9E");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const result = await model.generateContent(prompt);
  // console.log(prompt, ":", result.response.text()); 
  res.json({ answer: result.response.text() });
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
