import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/decorators/get-user.decorator';
import { CreateChatDto, CreateGroupChatDto } from './dto/chat.dto';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) {}

  @Post('direct')
  createChat(@GetUser() user:any,@Body() dto:CreateChatDto): any {
    return this.chatService.createChat(user.id,dto);
  }
  
  @Post('group')
  createGroupChat(@GetUser() user:any,@Body() dto:CreateGroupChatDto): any {
    return this.chatService.createGroupChat(user.id,dto);
  }

  @Post('add-to-group')
  addToGroupChat(@GetUser() user:any,@Body() dto:any): any {
    return this.chatService.addTogroupChat(dto.chatId,user.id);
  }

  @Post('remove-from-group')
  removeFromGroupChat(@GetUser() user:any,@Body() dto:any): any {
    return this.chatService.removeFromGroupChat(dto.chatId,user.id);
  }

  @Get('direct-chats')
  getUserDirectChats(@GetUser() user:any): any {
    return this.chatService.getUserDirectChats(user.id);
  }
  
  @Get('group-chats')
  getUserGroupChats(@GetUser() user:any): any {
    return this.chatService.getUserGroupChats(user.id);
  }

  // Placeholder endpoints for messages (update)
  @Patch('message')
  updateMessage(@GetUser() user:any, @Body() dto: { chatId: string; messageId: string; content: string }) {
    // In a full impl, validate membership and persist the update
    return { success: true };
  }
}
