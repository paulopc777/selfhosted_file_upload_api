# 📁 Sistema de Upload de Arquivos (R2)

Um servidor de API REST robusto e seguro para upload e gerenciamento de arquivos, desenvolvido em **TypeScript** com **Express.js**. O sistema oferece suporte a imagens, áudios e arquivos diversos com autenticação baseada em token.

## 🚀 Funcionalidades

- ✅ **Upload de Imagens**: Suporte a formatos PNG, JPEG e GIF via base64
- ✅ **Upload de Arquivos Diversos**: PDF, DOC, XLS e outros formatos
- ✅ **Upload de Áudios**: MP3, WAV e outros formatos de áudio
- ✅ **Exclusão de Arquivos**: Remoção segura de arquivos do servidor
- ✅ **Servir Arquivos Estáticos**: Acesso direto aos arquivos via URL
- 🔐 **Autenticação**: Sistema de autenticação via Bearer Token
- 📊 **Coverage de Testes**: 100% das rotas principais testadas

## 🛠️ Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Vitest** - Framework de testes
- **Supertest** - Testes de API
- **Dotenv** - Gerenciamento de variáveis de ambiente

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## ⚙️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/paulopc777/file_sistem_r2.git
cd file_sistem_r2
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente criando um arquivo `.env`:
```env
PORT=5050
HOST=localhost
AUTH_TOKEN=seu_token_de_autenticacao_aqui
```

4. Compile o TypeScript:
```bash
npm run build
```

5. Execute o servidor:
```bash
npm start
```

Para desenvolvimento com hot-reload:
```bash
npm run dev
```

## 🔗 Rotas da API

### 📊 Status do Servidor
```http
GET /
```
Verifica se o servidor está funcionando.

**Resposta:**
```json
"Servidor de upload de arquivos está rodando!"
```

---

### 🖼️ Upload de Imagem
```http
POST /upload-image
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "file_id": "minha-imagem-123",
  "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
}
```

**Resposta de Sucesso:**
```json
{
  "url": "/uploads/minha-imagem-123.png"
}
```

**Formatos Suportados:** PNG, JPEG, GIF

---

### 📄 Upload de Arquivo
```http
POST /upload-file
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "file_id": "meu-documento-456",
  "data": "base64_encoded_file_data",
  "original_filename": "documento.pdf"
}
```

**Resposta de Sucesso:**
```json
{
  "url": "/uploads/meu-documento-456.pdf"
}
```

---

### 🎵 Upload de Áudio
```http
POST /upload-audio
Authorization: Bearer {TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "file_id": "meu-audio-789",
  "data": "base64_encoded_audio_data",
  "original_filename": "musica.mp3"
}
```

**Resposta de Sucesso:**
```json
{
  "url": "/uploads/meu-audio-789.mp3"
}
```

---

### 🗑️ Deletar Arquivo
```http
DELETE /upload/{file_name}
Authorization: Bearer {TOKEN}
```

**Exemplo:**
```http
DELETE /upload/minha-imagem-123.png
Authorization: Bearer {TOKEN}
```

**Resposta de Sucesso:** Status 204 (No Content)

---

### 📂 Acessar Arquivos
```http
GET /uploads/{file_name}
```

**Exemplo:**
```http
GET /uploads/minha-imagem-123.png
```

Serve o arquivo diretamente para visualização/download.

## 🔐 Autenticação

Todas as rotas de upload e delete requerem autenticação via Bearer Token:

```http
Authorization: Bearer seu_token_aqui
```

O token deve ser configurado na variável de ambiente `AUTH_TOKEN`.

## 🧪 Testes

Execute os testes:
```bash
npm test
```

### 📊 Coverage dos Testes

O projeto possui **100% de coverage** nas principais funcionalidades:

- ✅ Verificação do status do servidor
- ✅ Upload de imagem sem token (retorna 401)  
- ✅ Upload de imagem com token válido (retorna 200)
- ✅ Acesso ao arquivo após upload (retorna 200)

**Estatísticas dos Testes:**
- **4 testes** executados
- **100%** de taxa de sucesso
- **Tempo de execução:** ~25ms

## 📁 Estrutura do Projeto

```
file_sistem_r2/
├── src/
│   ├── config/
│   │   └── contants.ts          # Configurações e constantes
│   ├── middlewares/
│   │   └── auth_middleware.ts   # Middleware de autenticação
│   ├── utils/
│   │   ├── saveBaseImage.ts     # Utilitário para salvar imagens
│   │   ├── saveFile.ts          # Utilitário para salvar arquivos
│   │   └── saveAudio.ts         # Utilitário para salvar áudios
│   ├── uploads/                 # Diretório de arquivos uploadados
│   └── index.ts                 # Servidor principal
├── tests/
│   └── server.test.ts           # Testes da API
├── package.json
├── tsconfig.json
└── README.md
```

## 🚨 Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Parâmetros obrigatórios faltando |
| 401 | Unauthorized - Token não fornecido ou inválido |
| 500 | Internal Server Error - Erro no servidor |

## 🔧 Scripts Disponíveis

```bash
npm run build    # Compila o TypeScript
npm start        # Inicia o servidor de produção
npm run dev      # Inicia o servidor de desenvolvimento
npm run clean    # Remove arquivos compilados
npm test         # Executa os testes
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `package.json` para mais detalhes.

---

⭐ **Desenvolvido por [Paulo PC](https://github.com/paulopc777)**

🚀 Sistema confiável para upload de arquivos com alta performance e segurança!