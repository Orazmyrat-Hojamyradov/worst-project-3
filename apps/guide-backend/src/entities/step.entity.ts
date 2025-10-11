import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Guide } from './guide.entity';
import { Tip } from './tip.esntity';

@Entity()
export class Step {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  body?: string;

  @Column({ nullable: true })
  order?: number;

  @Column({ nullable: true })
  mediaUrl: string;  // <-- can be photo or short video

  @Column({ nullable: true })
  mediaType: string; // 'photo' | 'video'

  @Column({ nullable: true })
  estimateMinutes?: number;

  @OneToMany(() => Tip, tip => tip.step, { cascade: true, eager: true })
  tips: Tip[];

  @ManyToOne(() => Guide, guide => guide.steps, { onDelete: 'CASCADE' })
  guide: Guide;
}
