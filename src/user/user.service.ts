import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as Bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(data: CreateUserDto) {
    const passwordHash = Bcrypt.hashSync(data.password, 10);
    const database = await this.userRepository.findOne({
      where: {
        email: data.email,
      },
    });
    if (database) {
      throw new ConflictException('Email Already Exists');
    }
    const userId = randomUUID();
    await this.userRepository.save(
      this.userRepository.create({
        ...data,
        id: userId,
        password: passwordHash,
      }),
    );
    return this.findOne(userId);
  }

  async findAll() {
    return await this.userRepository.find({
      select: { email: true, id: true },
    });
  }

  async findOne(id: string) {
    const entity = await this.userRepository.findOne({
      where: {
        id: id,
      },
      select: { email: true, id: true },
    });
    if (!entity) {
      throw new NotFoundException();
    }
    return entity;
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findOne(id);
    if (data.email === user.email) {
      if (data.password) {
        const passwordHash = Bcrypt.hashSync(data.password, 10);
        user.password = passwordHash;
      }
    }

    this.userRepository.merge(user, data);
    return await this.userRepository.save(user);
  }

  async remove(id: string) {
    await this.userRepository.softDelete(id);
  }
}
