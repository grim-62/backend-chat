export default () => ({
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/nestjs_app',
  JWT_SECRET: process.env.JWT_SECRET || 'changeme',
});

