import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../entities/user.entity';
import { UserProgress } from 'src/entities/user-progress.entity';
import { Bookmark } from 'src/entities/bookmark.entity';
import { Guide } from 'src/entities/guide.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(UserProgress) private progressRepo: Repository<UserProgress>,
    @InjectRepository(Bookmark) private bookmarkRepo: Repository<Bookmark>,
  ) {}

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(userPartial: Partial<User>) {
    const user = this.usersRepo.create(userPartial);
    return this.usersRepo.save(user);
  }

  async updateProfile(id: string, data: Partial<User>) {
  await this.usersRepo.update(id, data);
  return this.findById(id);
}

async updateProfilePhoto(id: string, filePath: string) {
  await this.usersRepo.update(id, { profilePhoto: filePath });
  return this.findById(id);
}

async deleteProfilePhoto(id: string) {
  await this.usersRepo.update(id, { profilePhoto: null });
  return this.findById(id);
}

async update(id: string, data: Partial<User>) {
  await this.usersRepo.update(id, data);
  return this.findById(id);
}

  async ensureUserById(userId: string) {
    let user = await this.usersRepo.findOne({ where: { id: userId }});
    if (!user) throw new Error('User not found!');
    return user;
  }

  async setProgress(userId: string, guide: Guide, stepId: string | null, completed = false) {
    const user = await this.ensureUserById(userId);
    const progress = this.progressRepo.create({ completed });
    progress.user = user;
    progress.guide = guide;
    if (stepId) progress.step = { id: stepId } as any;

    return this.progressRepo.save(progress);
  }

  async getProgress(userId: string, guideId: string) {
    const result = await this.progressRepo.find({ where: { user: { id: userId }, guide: { id: guideId }}, relations: ['step']});
    return result;
  }

  async toggleBookmark(userId: string, guide: Guide) {
    const user = await this.ensureUserById(userId);
    const exists = await this.bookmarkRepo.findOne({ where: { user: { id: userId }, guide: { id: guide.id } }});
    if (exists) {
      await this.bookmarkRepo.remove(exists);
      return { removed: true };
    }
     const b = this.bookmarkRepo.create({ user, guide });
    await this.bookmarkRepo.save(b);
    return { added: true, bookmark: b };
  }

  async listBookmarks(userId: string) {
    return this.bookmarkRepo.find({ where: { user: { id: userId } }, relations: ['guide'] });
  }

  async seedAdmin() {
    const adminEmail = 'admin@gmail.com';
    let admin = await this.usersRepo.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const hashed = await require('bcrypt').hash('admin123', 10);
      admin = this.usersRepo.create({
        email: adminEmail,
        password: hashed,
        role: UserRole.ADMIN,
        name: 'Static Admin',
      });
      await this.usersRepo.save(admin);
      console.log('✅ Admin user seeded:', adminEmail);
    }
  }

}
