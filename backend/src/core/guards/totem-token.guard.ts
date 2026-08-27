/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TotemPairingService } from '../../features/totem/totem-pairing.service';

@Injectable()
export class TotemTokenGuard implements CanActivate {
  constructor(private readonly totemPairingService: TotemPairingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-totem-token'];

    if (!token) {
      throw new UnauthorizedException('Token do totem não informado');
    }

    const credential = await this.totemPairingService.validateToken(token);

    if (!credential) {
      throw new UnauthorizedException('Token do totem inválido');
    }

    request.totemId = credential.totemId;
    return true;
  }
}
