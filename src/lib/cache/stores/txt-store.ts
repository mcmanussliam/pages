import {type FileStoreOptions} from '../file-store';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export class FileTextStore {
  private readonly dir: string;

  private readonly namespace: string;

  private readonly extension: string;

  public constructor(opts: FileStoreOptions) {
    this.dir = opts.dir;
    this.namespace = opts.namespace;
    this.extension = opts.extension;
  }

  public async read(key: string): Promise<string | null> {
    const filePath = this.pathForKey(key);
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch {
      return null;
    }
  }

  public async write(key: string, value: string): Promise<void> {
    const filePath = this.pathForKey(key);
    await this.writeFileAtomic(filePath, value);
  }

  private pathForKey(key: string): string {
    const fileName = `${this.sha1(key)}${this.extension}`;
    return path.join(this.dir, this.namespace, fileName);
  }

  private sha1(input: string): string {
    return crypto.createHash('sha1').update(input).digest('hex');
  }

  private async ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, {recursive: true});
  }

  private async writeFileAtomic(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    await this.ensureDir(dir);
    const tmp = `${filePath}.${process.pid}.tmp`;
    await fs.writeFile(tmp, content, 'utf8');
    await fs.rename(tmp, filePath);
  }
}
