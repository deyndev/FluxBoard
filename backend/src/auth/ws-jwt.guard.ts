import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { parse } from 'cookie';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger = new Logger(WsJwtGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    
    // 1. Extract cookies from handshake headers
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) {
      this.logger.error('No cookies found in handshake');
      return false;
    }

    const cookies = parse(cookieHeader);
    const token = cookies.access_token;

    if (!token) {
      this.logger.error('No access_token found in cookies');
      return false;
    }

    // 2. Verify Token
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      
      // 3. Attach user to socket instance for easy access in gateways
      client.data.user = payload;
      return true;
    } catch (err) {
      this.logger.error('Invalid token');
      return false;
    }
  }
}
