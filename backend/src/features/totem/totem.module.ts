import { Module } from '@nestjs/common';
import { TotemService } from './totem.service';
import { TotemController } from './totem.controller';
import { TotemPairingService } from './totem-pairing.service';

@Module({
  controllers: [TotemController],
  providers: [TotemService, TotemPairingService],
})
export class TotemModule {}
