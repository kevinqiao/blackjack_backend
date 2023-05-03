import { Controller, Get,Post,Put,Delete,Request,Param} from '@nestjs/common';
import { TaskManager } from 'src/service/TaskManager';
import { EventsGateway } from 'src/events/events.gateway';

@Controller('task')
export class TaskController {
  constructor(
    private readonly taskManager: TaskManager,
    private readonly  socketGateway:EventsGateway
  ) {}


  @Get('list')
  async getAllTasks(): Promise<any> {
    const tasks =  await this.taskManager.findAll();
    return { ok: true, message: tasks };
  }

  @Post('create')
  async createTask(@Request() req): Promise<any> {
    const task = req.body;
    await this.taskManager.createTask(task);
    this.socketGateway.sendToClient({name:"taskCreated",task})
    return { ok: true};
  }

  @Put('update')
  async updateTask(@Request() req): Promise<any> {
    console.log(req.body)
    await this.taskManager.updateTask(req.body);
    this.socketGateway.sendToClient({name:"taskUpdated",task:req.body})
    return { ok: true};
  }

  @Delete('remove/:taskId')
  async removeTask(@Param('taskId') taskId: string): Promise<any> {
    await this.taskManager.removeTask(Number(taskId));
    this.socketGateway.sendToClient({name:"taskRemoved",taskId:+taskId})
    return { ok: true};
  }
 
  @Delete('all')
  async removeAll(@Request() req): Promise<any> {
    console.log("remove all")
    await this.taskManager.removeAll();
    this.socketGateway.sendToClient({name:"allRemoved"})
    return { ok: true};
  }

}
