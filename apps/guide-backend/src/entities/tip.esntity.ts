import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Step } from './step.entity';

@Entity()
export class Tip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // e.g., "pro", "important"

  @Column({ type: 'text' })
  text: string;

  @ManyToOne(() => Step, step => step.tips, { onDelete: 'CASCADE' })
  step: Step;
}
