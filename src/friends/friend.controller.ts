import { Controller, Post, Body, Param, Get, Query, Req, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { GetUser } from 'src/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('/:receiverId/send')
  async sendRequest(@GetUser() user:any, @Param('receiverId') receiverId: string) {
    console.log(user)
    return this.friendService.sendRequest(user.id as string, receiverId);
  }

  @Post('respond/:requestId')
  async respondRequest(
    @GetUser() user:any,
    @Param('requestId') requestId: string,
    @Body('accept') accept: boolean,
  ) {
    return this.friendService.respondRequest(requestId, user.id, accept);
  }

  @Get('list')
  async getFriends(@Req() req) {
    return this.friendService.getFriends(req.user.id);
  }

  @Get('pending-requests')
  async getPending(@Req() req) {
    return this.friendService.getPendingRequests(req.user.id);
  }

}

