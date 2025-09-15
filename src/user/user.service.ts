import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { User } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findByIdentifier(email: string) {
    return this.userModel.findOne({ email: email }).exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-passwordHash');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  async createFromIdentifier(email: string, username: string) {
    return this.userModel.create({ email, username });
  }

  async searchUsers(id: string, query: string) {
    if (!query || query.trim() === '') {
      return [];
    }
    const data = await this.userModel
      .find({
         _id: { $ne: id },
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      })
      .select('username email profileImage');

    console.log('search user data ===>', data, query);
    return data;
  }
}
