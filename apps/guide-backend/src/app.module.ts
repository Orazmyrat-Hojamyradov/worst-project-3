import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { UserService } from './user/user.service';
import { AdminModule } from './admin/admin.module';
import { GuideModule } from './guide/guide.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: parseInt(config.get<string>('DATABASE_PORT', '5432'), 10),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', 'P@ssw0rd'),
        database: config.get<string>('DATABASE_NAME', 'assembler'),
        autoLoadEntities: true,
        synchronize: true, // set false in production and use migrations
      }),
      inject: [ConfigService]
    }),
    MulterModule.register({
      dest: join(__dirname, '..', 'uploads'), // files go to /uploads
    }),
    AuthModule, 
    UserModule, 
    AdminModule, 
    GuideModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements OnModuleInit {
  constructor(private readonly usersService: UserService) {}

  async onModuleInit() {
    await this.usersService.seedAdmin();
  }
}