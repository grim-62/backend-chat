import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Otp } from "./schemas/otp.schema";
import { Model } from "mongoose";
import bcrypt from "bcryptjs";

function randDigits(len: number) {
  const max = 10 ** len;
  return Math.floor(Math.random() * max).toString().padStart(len, '0');
}

@Injectable()
export class OtpService{
    constructor(
        @InjectModel(Otp.name) private readonly otpModel: Model<Otp>
    ){}
  
  async requestOtp(recipient: string, length: number, ttlMinutes: number, resendCooldownSec: number) {
    // resend cooldown
    const last = await this.otpModel.findOne({ recipient }).sort({ createdAt: -1 }).lean();
    if (last) {
      const since = (Date.now() - new Date(last.createdAt).getTime()) / 1000;
      if (since < resendCooldownSec) {
        throw new ConflictException(`Try again in ${Math.ceil(resendCooldownSec - since)}s`);
      }
    }

    const code = randDigits(length);
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
    await this.otpModel.create({ recipient, hashedCode, expiresAt, used: false });

    // console.log(`Generated OTP for ${recipient}: ${code}`);
  // const mailresponce = await this.mailService.sendMail({
  //     to: recipient,
  //     subject: 'Your OTP Code',
  //     text: plainText.replace('{{code}}', code).replace('{{expires}}', ttlMinutes.toString()),
  //     html: renderHtml.replace('{{code}}', code).replace('{{expires}}', ttlMinutes.toString()).replace('{{User}}', recipient),
  //   });
    // console.log("Mail response:", mailresponce);
    return code;
  }

  async verifyOtp(recipient: string, code: string) {
    const otp = await this.otpModel.findOne({ recipient, used: false }).sort({ createdAt: -1 });
    if (!otp) throw new BadRequestException('No OTP found or already used/expired');

    if (otp.expiresAt.getTime() < Date.now()) throw new BadRequestException('OTP expired');

    if (otp.attempts >= 5) throw new ConflictException('Too many wrong attempts');

    const ok = await bcrypt.compare(code, otp.hashedCode);
    if (!ok) {
      otp.attempts += 1;
      await otp.save();
      throw new BadRequestException('Invalid OTP');
    }

    otp.used = true;
    await otp.save();
    return true;
  }
  
}