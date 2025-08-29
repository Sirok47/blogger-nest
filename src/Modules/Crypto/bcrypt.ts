import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HashService {
  async toHash(data: string): Promise<string> {
    return await bcrypt.hash(data, 10);
  }

  async compareHash(password: string, passHash: string): Promise<boolean> {
    return await bcrypt.compare(password, passHash);
  }
}
