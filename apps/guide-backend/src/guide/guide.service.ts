import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guide } from '../entities/guide.entity';
import { Step } from '../entities/step.entity';
import { Tip } from '../entities/tip.esntity';

@Injectable()
export class GuideService {
  constructor(
    @InjectRepository(Guide) private guideRepo: Repository<Guide>,
    @InjectRepository(Step) private stepRepo: Repository<Step>,
    @InjectRepository(Tip) private tipRepo: Repository<Tip>,
  ) {}

  findAll() {
    return this.guideRepo.find();
  }

  async findOne(id: string) {
    const g = await this.guideRepo.findOne({ where: { id } });
    if (!g) throw new NotFoundException('Guide not found');
    return g;
  }

  create(data: Partial<Guide>) {
    const g = this.guideRepo.create({...data, language: data.language || 'en',});
    return this.guideRepo.save(g);
  }

  async addStep(guideId: string, stepData: Partial<Step>) {
    const guide = await this.findOne(guideId);
    const step = this.stepRepo.create({ ...stepData, guide });
    return this.stepRepo.save(step);
  }

  async addTip(stepId: string, tipData: Partial<Tip>) {
    const step = await this.stepRepo.findOne({ where: { id: stepId }});
    if (!step) throw new NotFoundException('Step not found');
    const tip = this.tipRepo.create({ ...tipData, step });
    return this.tipRepo.save(tip);
  }
}
