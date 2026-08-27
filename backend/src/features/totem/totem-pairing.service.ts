import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../core/database/prisma.service';
import { nowBrasilia } from '../../core/utils/date-utils';

interface PendingPairing {
  totemId: number;
}

@Injectable()
export class TotemPairingService {
  private readonly logger = new Logger(TotemPairingService.name);
  private readonly pendingCodes = new Map<string, PendingPairing>();

  constructor(private readonly prisma: PrismaService) {}

  private generateUniqueCode(): string {
    let code: string;
    do {
      code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    } while (this.pendingCodes.has(code));
    return code;
  }

  private removeCodeByTotemId(totemId: number): void {
    for (const [code, pairing] of this.pendingCodes.entries()) {
      if (pairing.totemId === totemId) {
        this.pendingCodes.delete(code);
        break;
      }
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  generateCode(totemId: number): string {
    this.removeCodeByTotemId(totemId);
    const code = this.generateUniqueCode();
    this.pendingCodes.set(code, { totemId });
    return code;
  }

  async pair(code: string, deviceId: string) {
    const pending = this.pendingCodes.get(code);

    if (!pending) {
      throw new NotFoundException('Código de pareamento inválido');
    }

    this.pendingCodes.delete(code);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const now = nowBrasilia();

    await this.prisma.client.totemCredential.upsert({
      where: { deviceId },
      update: { totemId: pending.totemId, tokenHash, revokedAt: null },
      create: {
        totemId: pending.totemId,
        deviceId,
        tokenHash,
        createdAt: now,
      },
    });

    this.logger.log(`Totem ${pending.totemId} pareado com device ${deviceId}`);

    return { totemId: pending.totemId, token };
  }

  async validateToken(token: string) {
    const tokenHash = this.hashToken(token);
    return this.prisma.client.totemCredential.findFirst({
      where: { tokenHash, revokedAt: null },
    });
  }
}
