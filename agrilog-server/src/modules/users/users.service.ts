import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserRole, UserStatus } from 'agrilog-shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: number | string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id: Number(id) },
    });
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const newUser = this.userRepository.create({
      role: UserRole.FARMER,
      status: UserStatus.ACTIVE,
      ...userData,
    });
    return this.userRepository.save(newUser);
  }

  async updateLastLogin(id: number | string): Promise<void> {
    await this.userRepository.update(Number(id), {
      last_login: new Date(),
    });
  }
}
