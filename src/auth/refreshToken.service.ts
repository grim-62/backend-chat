import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshToken } from './schemas/refresh-token.schema';

@Injectable()
export class RefreshTokenService {
  private readonly accessSecret =
    process.env.JWT_ACCESS_SECRET || 'access_secret';
  private readonly refreshSecret =
    process.env.JWT_REFRESH_SECRET || 'refresh_secret';

  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
  ) {}

  async createTokens(userId: string) {
    const accessToken = jwt.sign({ sub: userId }, this.accessSecret, {
      expiresIn: '30m'
    });

    const refreshToken = jwt.sign({ sub: userId }, this.refreshSecret, {
      expiresIn: '7d',
    });

    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await this.refreshTokenModel.create({
      refreshToken: tokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(token: string) {
    const decoded = jwt.verify(token, this.refreshSecret) as {
      sub: string;
      exp: number;
    };
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const stored = await this.refreshTokenModel.findOne({
      refreshToken: tokenHash,
    });
    if (!stored) throw new Error('Invalid refresh token');
    if (stored.expiresAt < new Date()) throw new Error('Expired refresh token');
    return decoded;
  }

  async delete(refreshToken: string): Promise<void> {
    await this.refreshTokenModel.deleteOne({ refreshToken }).exec();
  }

  async revoke(userId: string) {
    await this.refreshTokenModel.deleteMany({ userId }).exec();
  }
}
