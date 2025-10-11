import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guide } from '../entities/guide.entity';
import { Step } from '../entities/step.entity';
import { Tip } from '../entities/tip.esntity';
import { GuideService } from './guide.service';
import { GuideController } from './guide.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Guide, Step, Tip])],
  providers: [GuideService],
  controllers: [GuideController],
  exports: [GuideService],
})
export class GuideModule {}
