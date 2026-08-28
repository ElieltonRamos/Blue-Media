import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { TotemModule } from '../totem/totem.module';

@Module({
  imports: [TotemModule],
  controllers: [PlaylistController],
  providers: [PlaylistService],
})
export class PlaylistModule {}
