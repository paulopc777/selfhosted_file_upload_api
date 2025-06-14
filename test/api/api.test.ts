import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';
import fs from 'fs/promises';
import path from 'path';

describe('File Upload API', () => {
  const testServer = request(app);
  const testFileId = 'test-file.txt';
  const testData = Buffer.from('Hello, World!').toString('base64');
  const uploadsDir = path.join(__dirname, '../../src/uploads');

  // Clean up test files after all tests
  afterAll(async () => {
    try {
      await fs.unlink(path.join(uploadsDir, testFileId));
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  it('should upload a file and return a URL', async () => {
    const response = await testServer
      .post('/upload')
      .send({
        file_id: testFileId,
        data: testData
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('url');
    expect(response.body.url).toBe(`/uploads/${testFileId}`);
  });

  it('should be able to access the uploaded file', async () => {
    const response = await testServer
      .get(`/uploads/${testFileId}`)
      .expect(200)
      .parse((res: any, callback: Function) => {
        let data = '';
        res.setEncoding('binary');
        res.on('data', (chunk: string) => {
          data += chunk;
        });
        res.on('end', () => {
          callback(null, Buffer.from(data, 'binary'));
        });
      });

    expect(response.body.toString()).toBe('Hello, World!');
  });

  it('should return 400 when missing required fields', async () => {
    // Test missing file_id
    await testServer
      .post('/upload')
      .send({ data: testData })
      .expect(400);

    // Test missing data
    await testServer
      .post('/upload')
      .send({ file_id: testFileId })
      .expect(400);
  });

  it('should delete a file successfully', async () => {
    // First upload a file to delete
    const uploadFile = 'file-to-delete.txt';
    const fileData = Buffer.from('This file will be deleted').toString('base64');
    
    await testServer
      .post('/upload')
      .send({
        file_id: uploadFile,
        data: fileData
      })
      .expect(200);
    
    // Verify file exists
    const fileExists = async () => {
      try {
        await fs.access(path.join(uploadsDir, uploadFile));
        return true;
      } catch {
        return false;
      }
    };
    
    expect(await fileExists()).toBe(true);
    
    // Delete the file
    const deleteResponse = await testServer
      .delete(`/upload/${uploadFile}`)
      .expect(204);
    
    // Verify file was deleted
    expect(await fileExists()).toBe(false);
  });

  it('should return 500 when attempting to delete a non-existent file', async () => {
    const nonExistentFile = 'non-existent-file.txt';
    
    const response = await testServer
      .delete(`/upload/${nonExistentFile}`)
      .expect(500);
    
    expect(response.text).toBe('Erro ao deletar o arquivo');
  });
});