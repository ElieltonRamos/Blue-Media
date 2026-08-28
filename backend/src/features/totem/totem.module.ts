import { Module } from '@nestjs/common';
import { TotemService } from './totem.service';
import { TotemController } from './totem.controller';
import { TotemPairingService } from './totem-pairing.service';
import { TotemCommandService } from './totem-command.service';
import { TotemTokenGuard } from '../../core/guards/totem-token.guard';

@Module({
  controllers: [TotemController, TotemController],
  providers: [
    TotemService,
    TotemPairingService,
    TotemCommandService,
    TotemTokenGuard,
  ],
  exports: [TotemService, TotemPairingService, TotemCommandService],
})
export class TotemModule {}
