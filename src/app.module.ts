import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes the ConfigModule globally available
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', // Database type
      host: process.env.DB_HOST, // Hostname
      port: parseInt(process.env.DB_PORT), // Port
      username: process.env.DB_USER, // Database username
      password: process.env.DB_PASS, // Database password
      database: process.env.DB_NAME, // Database name
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Entities to load
      synchronize: true, // Automatically sync schema in development
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
