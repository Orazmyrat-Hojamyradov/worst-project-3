import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Guide } from './guide.entity';

@Entity()
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.bookmarks, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Guide, { onDelete: 'CASCADE', eager: true })
  guide: Guide;

  @CreateDateColumn()
  createdAt: Date;
}
