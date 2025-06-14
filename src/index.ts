import express from "express";
import fs from "fs/promises";
import path from "path";

import { HOST, PORT } from "./contants";
import saveBaseImage from "./utils/saveBaseImage";
import saveFile from "./utils/saveFile";
import saveAudio from "./utils/saveAudio";
import { authMiddleware } from "./utils/authMiddleware";

export const app = express();

app.use(express.json({ limit: "50mb" })); // Increased limit for file uploads

const UPLOADS_DIR = path.join(__dirname, "uploads");

fs.mkdir(UPLOADS_DIR, { recursive: true });

app.get("/", (req, res) => {
  res.send("Servidor de upload de arquivos está rodando!");
});

app.post("/upload-image", authMiddleware, async (req, res) => {
  const { file_id, data } = req.body;
  if (!file_id || !data) {
    res.status(400).send("Faltando file_id ou data");
    return;
  }
  try {
    const save = await saveBaseImage(file_id, data);
    res.send({ url: save });
  } catch (error: any) {
    res.status(500).send({
      error: error.message || "Erro ao salvar a imagem",
    });
  }
});

app.post("/upload-file", authMiddleware, async (req, res) => {
  const { file_id, data, original_filename } = req.body;
  if (!file_id || !data) {
    res.status(400).send("Faltando file_id ou data");
    return;
  }
  try {
    const save = await saveFile(file_id, data, original_filename);
    res.send({ url: save });
  } catch (error: any) {
    res.status(500).send({
      error: error.message || "Erro ao salvar o arquivo",
    });
  }
});

app.post("/upload-audio", authMiddleware, async (req, res) => {
  const { file_id, data, original_filename } = req.body;
  if (!file_id || !data) {
    res.status(400).send("Faltando file_id ou data");
    return;
  }
  try {
    const save = await saveAudio(file_id, data, original_filename);
    res.send({ url: save });
  } catch (error: any) {
    res.status(500).send({
      error: error.message || "Erro ao salvar o áudio",
    });
  }
});

app.delete("/upload/:file_name", authMiddleware, async (req, res) => {
  const { file_name } = req.params;
  const filePath = path.join(UPLOADS_DIR, file_name);
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
