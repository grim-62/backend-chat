import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/decorators/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AsyncTryCatch } from 'src/decorators/try-catch.decorator';

@AsyncTryCatch()
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findMe(@GetUser() user: any) {
    return this.userService.findById(user.id as string);
  }

  @Patch()
  async updateProfile(@GetUser() user: any, @Body() dto: UpdateUserDto) {
    return this.userService.update(user.id as string, dto);
  }

  @Delete()
  async deleteProfile(@GetUser() user: any) {
    return this.userService.delete(user.id as string);
  }

  @Get('search')
  async searchUser(@GetUser() user: any, @Query('q') q: string) {
    return this.userService.searchUsers(user.id as string, q);
  }
}
