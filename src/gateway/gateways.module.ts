import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [AuthModule],
  providers: [SocketGateway],
  exports: [SocketGateway]
})
export class GatewayModule {}