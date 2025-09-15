import { ConfigModule, ConfigService } from "@nestjs/config";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import configration from "./configration";

export const appConfigModule = {
      isGlobal:true,
      load:[configration],
      envFilePath:'.env'
}

export const validatePipeConfig = { 
    whitelist:true ,
    transform:true ,
    forbidNonWhitelisted:true ,
    transformOptions:{enableImplicitConversion:true
    }
}

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8080",
    ];

    if (!origin) {
      // allow requests with no origin (like mobile apps, curl, Postman)
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // ✅ must be plural
};

export const dbConfig = {
  imports:[ConfigModule],
  useFactory :async(configService:ConfigService)=>{
    const uri = configService.get<string>('MONGO_URI');
    const options:any = {
      autoIndex:false,
      maxPoolSize:10,
      serverSelectionTimeoutMS:5000,
    };
  return {uri,...options};
  },
  inject:[ConfigService]
}

export const jwtRegisterConfig ={
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: configService.get<string | number>('JWT_EXPIRES_IN') || '1d',
    },
  }),
}