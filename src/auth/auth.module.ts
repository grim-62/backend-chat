import { Module } from "@nestjs/common";
// import { AuthSerive } from "./auth.service";
import { AuthController } from "./auth.controller";
import { OtpService } from "./otp.service";
import { UserModule } from "src/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { jwtRegisterConfig } from "src/configs/security.config";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { MongooseModule } from "@nestjs/mongoose";
import { Otp, OtpSchema } from "./schemas/otp.schema";
import { PassportModule } from "@nestjs/passport";
import { RefreshTokenService } from "./refreshToken.service";
import { RefreshToken, RefreshTokenSchema } from "./schemas/refresh-token.schema";
import { AuthService } from "./auth.service";
@Module({
  imports: [
    PassportModule,
    UserModule,
    JwtModule.registerAsync(jwtRegisterConfig),
    MongooseModule.forFeature([
        {name:Otp.name,schema: OtpSchema},
        { name: RefreshToken.name, schema: RefreshTokenSchema },
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService,OtpService,JwtStrategy,RefreshTokenService],
  exports: [],
})
export class AuthModule{}