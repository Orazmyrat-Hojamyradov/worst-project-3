import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Guide } from './guide.entity';
import { Step } from './step.entity';

@Entity()
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.progress, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Guide, { onDelete: 'CASCADE' })
  guide: Guide;

  @ManyToOne(() => Step, { nullable: true })
  step?: Step;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  updatedAt: Date;
}
