import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Step } from './step.entity';

@Entity()
export class Guide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  difficulty?: string;

  @Column({ nullable: true })
  duration?: string;

  @Column({ nullable: true, default: 0 })
  rating?: number;

  @OneToMany(() => Step, step => step.guide, { cascade: true, eager: true })
  steps: Step[];

  @Column({ default: 'en' })
  language: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
