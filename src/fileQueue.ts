import fs from "fs/promises";
import path from "path";

interface QueueItem {
  filePath: string;
  deleteAt: number;
}

class FileQueue {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private readonly UPLOADS_DIR = path.join(__dirname, "../uploads");
  // Adiciona um arquivo à fila para ser deletado em 1 minuto
  addToQueue(filePath: string): void {
    const deleteAt = Date.now() + 60000; // 1 minuto = 60000ms
    console.log(filePath);
    const queueItem: QueueItem = {
      filePath, // Armazena o caminho original (ex: "/uploads/arquivo.pdf")
      deleteAt,
    };

    this.queue.push(queueItem);
    console.log(
      `Arquivo ${path.basename(
        filePath
      )} adicionado à fila de deleção para ${new Date(
        deleteAt
      ).toLocaleString()}`
    ); // Inicia o processamento da fila se não estiver em execução
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // Remove um arquivo da fila (caso seja deletado manualmente)
  removeFromQueue(filePath: string): void {
    const initialLength = this.queue.length;

    this.queue = this.queue.filter((item) => item.filePath !== filePath);

    if (this.queue.length < initialLength) {
      console.log(
        `Arquivo ${path.basename(filePath)} removido da fila de deleção`
      );
    }
  }

  // Processa a fila de deleção
  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const itemsToDelete = this.queue.filter((item) => item.deleteAt <= now);

      if (itemsToDelete.length === 0) {
        // Aguarda até o próximo item estar pronto para ser deletado
        const nextItem = this.queue.reduce((prev, current) =>
          prev.deleteAt < current.deleteAt ? prev : current
        );
        const waitTime = nextItem.deleteAt - now;

        if (waitTime > 0) {
          await this.sleep(waitTime);
          continue;
        }
      }

      // Deleta os arquivos que estão prontos
      for (const item of itemsToDelete) {
        try {
          await this.deleteFile(item.filePath);
          console.log(
            `Arquivo ${path.basename(item.filePath)} deletado automaticamente`
          );
        } catch (error) {
          console.error(
            `Erro ao deletar arquivo ${path.basename(item.filePath)}:`,
            error
          );
        }

        // Remove o item da fila
        this.queue = this.queue.filter((queueItem) => queueItem !== item);
      }

      // Se não há mais itens na fila, para o processamento
      if (this.queue.length === 0) {
        break;
      }
    }

    this.isProcessing = false;
  }
  // Deleta o arquivo fisicamente
  private async deleteFile(filePath: string): Promise<void> {
    try {
      // Converte o caminho relativo para absoluto se necessário
      const UPLOADS_DIR = path.join(__dirname);
      const absolutePath = UPLOADS_DIR + filePath;

      console.log(absolutePath);

      await fs.access(absolutePath);
      await fs.unlink(absolutePath);
    } catch (error: any) {
      console.log(error);
      if (error.code !== "ENOENT") {
        throw error; // Re-lança o erro se não for "arquivo não encontrado"
      }
      // Se o arquivo não existe, não é um erro
    }
  }

  // Converte caminho relativo para absoluto
  private convertToAbsolutePath(filePath: string): string {
    // Se já é um caminho absoluto, retorna como está
    if (path.isAbsolute(filePath)) {
      return filePath;
    }

    // Se começa com /uploads/ (formato retornado pelas funções save)
    if (filePath.startsWith("/uploads/")) {
      const fileName = filePath.replace("/uploads/", "");
      return path.join(this.UPLOADS_DIR, fileName);
    }

    // Se começa com uploads/
    if (filePath.startsWith("uploads/")) {
      const fileName = filePath.replace("uploads/", "");
      return path.join(this.UPLOADS_DIR, fileName);
    }

    // Se é apenas o nome do arquivo
    return path.join(this.UPLOADS_DIR, filePath);
  }

  // Função auxiliar para aguardar
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Obtém o status da fila
  getQueueStatus(): {
    totalFiles: number;
    files: Array<{ fileName: string; deleteAt: string }>;
  } {
    return {
      totalFiles: this.queue.length,
      files: this.queue.map((item) => ({
        fileName: path.basename(item.filePath),
        deleteAt: new Date(item.deleteAt).toLocaleString(),
      })),
    };
  }
}

// Instância única da fila
export const fileQueue = new FileQueue();
