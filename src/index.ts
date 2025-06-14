import express from "express";
import fs from "fs/promises";
import path from "path";

import { HOST, PORT } from "./contants";

export const app = express();

app.use(express.json({ limit: "10mb" }));

const UPLOADS_DIR = path.join(__dirname, "uploads");

fs.mkdir(UPLOADS_DIR, { recursive: true });

app.post("/upload", async (req, res) => {
  const { file_id, data } = req.body;
  if (!file_id || !data) {
    res.status(400).send("Faltando file_id ou data");
    return;
  }
  const filePath = path.join(UPLOADS_DIR, file_id);
  await fs.writeFile(filePath, Buffer.from(data, "base64"));
  res.send({ url: `/uploads/${file_id}` });
});

app.delete("/upload/:file_id", async (req, res) => {
  const { file_id } = req.params;
  const filePath = path.join(UPLOADS_DIR, file_id);
  try {
    await fs.unlink(filePath);
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar o arquivo:", error);
    res.status(500).send("Erro ao deletar o arquivo");
  }
});

app.use("/uploads", express.static(UPLOADS_DIR));

app.listen(PORT, HOST, () =>
  console.log(`Servidor rodando em http://${HOST}:${PORT}/`)
);
