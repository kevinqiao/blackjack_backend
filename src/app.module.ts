import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsModule } from './events/events.module';
import { AppController } from './controller/app.controller';
import { AppService } from './service/app.service';
import { TaskManager } from './service/TaskManager';
import { TaskController } from './controller/task.controller';
import { EventsGateway } from './events/events.gateway';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule.forRoot(),EventsModule],
  controllers: [AppController, TaskController],
  providers: [
    AppService,
    TaskManager,
  ],
})
export class AppModule {}
