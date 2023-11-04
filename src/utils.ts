import { ObjectId } from 'mongoose';
import { Readable } from 'stream';

export function checkObjectId(id: ObjectId): boolean {
  if (id.toString().match(/^[0-9a-fA-F]{24}$/)) return true;
  return false;
}

// Helper function to convert a Readable stream to a Buffer
export function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (error: any) => reject(error));
  });
}
