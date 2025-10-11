import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserProgress } from 'src/entities/user-progress.entity';
import { Bookmark } from 'src/entities/bookmark.entity';
import { GuideModule } from 'src/guide/guide.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProgress, Bookmark]), GuideModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule]
})
export class UserModule {}
