import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './features/users/users.module';
import { PrismaModule } from './core/database/prisma.module';
import { CategoryModule } from './features/category/category.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { ClientModule } from './features/client/client.module';
import { TotemModule } from './features/totem/totem.module';
import { MediaModule } from './features/media/media.module';
import { PlaylistModule } from './features/playlist/playlist.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    PrismaModule,
    UsersModule,
    CategoryModule,
    ClientModule,
    TotemModule,
    MediaModule,
    PlaylistModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
