import { BadGatewayException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { OtpService } from './otp.service';
import { RefreshTokenService } from './refreshToken.service';
import { Response } from 'express';

const env = {
  JWT_SECRET: process.env.JWT_ACCESS_SECRET = 'access_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_DAYS: Number(
    process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30,
  ),
  OTP_LENGTH: Number(process.env.OTP_LENGTH || 6),
  OTP_TTL_MINUTES: Number(process.env.OTP_TTL_MINUTES || 5),
  OTP_RESEND_COOLDOWN_SECONDS: Number(
    process.env.OTP_RESEND_COOLDOWN_SECONDS || 60,
  ),
};

const getUsernameFromEmail = (email) => {
  if (typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Invalid email address');
  }
  return email.split('@')[0];
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly user: UserService,
    private readonly otp: OtpService,
    private readonly rt: RefreshTokenService,
  ) {}

  async requestOtp(email: string) {
    const code = await this.otp.requestOtp(
      email,
      env.OTP_LENGTH,
      env.OTP_TTL_MINUTES,
      env.OTP_RESEND_COOLDOWN_SECONDS,
    );
    console.log(`Email OTP to ${email}: ${code}`);

    return { ok: true };
  }

  async verifyOtp(email: string, code: string, res: Response) {
    await this.otp.verifyOtp(email, code);

    let user = await this.user.findByIdentifier(email);
    const username = getUsernameFromEmail(email);
    if (!user) user = await this.user.createFromIdentifier(email, username);

    const { accessToken, refreshToken } = await this.rt.createTokens(
      (user as any)._id,
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return {
      user: { _id: user._id, email: user.email ,username:user.username,profileImage:user.profileImage},
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string, res: Response) {
    try {
      const result = await this.rt.validateRefreshToken(token);

      if (result.exp < Date.now() / 1000) {
        await this.rt.delete(token);
        return await this.rt.createTokens(token);
      }
      const accessToken = await this.jwt.signAsync(
        { id: result.sub },
        { secret: env.JWT_SECRET, expiresIn: env.JWT_EXPIRES_IN },
      );

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return {
        refreshToken: token,
        accessToken,
      };
    } catch (error) {
      console.log(error);
      throw new BadGatewayException('some thing went wrong..');
    }
  }

  async signOut(token: string, res: Response) {
    await this.rt.delete(token);
    res.clearCookie('access_token');
    return { success: true };
  }
  
}
