import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RefreshTokenDto, RequestOtpDto, VerifyOtpDto } from "./dto/index.dto";
import { AsyncTryCatch } from "src/decorators/try-catch.decorator";
import { GetUser } from "src/decorators/get-user.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@AsyncTryCatch()
@Controller('auth')
export class AuthController{
    constructor(private readonly authService:AuthService){}

  @Post('request-otp')
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto.email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto,@Res({passthrough:true}) res) {
    return this.authService.verifyOtp(dto.email, dto.code ,res);
  }

  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto, @Res({passthrough:true}) res) {
    return this.authService.refreshToken(dto.token, res);
  }
  @Post('sign-out')
  async signOut(@Body() dto: RefreshTokenDto, @Res({passthrough:true}) res) {
    return this.authService.signOut(dto.token, res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@GetUser() user: any) {
    return user
  }

}