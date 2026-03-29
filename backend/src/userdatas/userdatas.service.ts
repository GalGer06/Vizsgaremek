import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateUserdataDto } from './dto/create-userdata.dto';
import { UpdateUserdataDto } from './dto/update-userdata.dto';
import { PrismaService } from 'src/prisma.service';

const DEFAULT_ACHIEVEMENTS = [
  { id: 1, title: 'Első lépések', description: 'Lépj be először az alkalmazásba.', completed: true },
  { id: 2, title: 'Kíváncsi felfedező', description: 'Nyiss meg legalább 1 témát.', completed: true },
  { id: 3, title: 'Hulladékharcos', description: 'Olvass el 5 újrahasznosításhoz kapcsolódó kérdést.', completed: false },
  { id: 4, title: 'Vízőr', description: 'Nyisd meg a Vízvédelem témát 3 alkalommal.', completed: false },
  { id: 5, title: 'Erdőbarát', description: 'Olvass el 10 erdőkkel kapcsolatos kérdést.', completed: false },
  { id: 6, title: 'Kitartó tanuló', description: 'Lépj be 7 egymást követő napon.', completed: false },
  { id: 7, title: 'Napi hős', description: 'Teljesíts 3 napi feladatot.', completed: false },
  { id: 8, title: 'Közösségi tag', description: 'Adj hozzá legalább 1 barátot.', completed: false },
  { id: 9, title: 'Pontgyűjtő', description: 'Gyűjts össze 500 pontot.', completed: false },
  { id: 10, title: 'Öko mester', description: 'Nyisd meg az összes témát legalább egyszer.', completed: false },
];

@Injectable()
export class UserdatasService {
  constructor (private prisma: PrismaService) {}

  async create(createUserdataDto: CreateUserdataDto) {
    return this.prisma.userDatas.create({
      data: createUserdataDto,
    });
  }

  async findAll() {
    return this.prisma.userDatas.findMany();
  }

  async findOne(id: number) {
    return this.prisma.userDatas.findUnique({
      where:{id}
    });
  }

  async update(id: number, updateUserdataDto: UpdateUserdataDto) {
    return this.prisma.userDatas.update({
      where: { id },
      data: updateUserdataDto,
    });
  }

  async remove(id: number) {
    return this.prisma.userDatas.delete({
      where: { id },
    });
  }

  async getAchievementsByUserId(userId: number) {
    let userData = await this.prisma.userDatas.findFirst({
      where: { userId },
      orderBy: { id: 'asc' },
    });

    if (!userData) {
      userData = await this.prisma.userDatas.create({
        data: {
          userId,
          achievements: DEFAULT_ACHIEVEMENTS as Prisma.InputJsonValue,
        },
      });
    }

    if (!userData.achievements) {
      userData = await this.prisma.userDatas.update({
        where: { id: userData.id },
        data: {
          achievements: DEFAULT_ACHIEVEMENTS as Prisma.InputJsonValue,
        },
      });
    }

    return {
      userId,
      achievements: userData.achievements ?? DEFAULT_ACHIEVEMENTS,
    };
  }

  async updateAchievementsByUserId(userId: number, achievements: unknown[]) {
    const existing = await this.prisma.userDatas.findFirst({
      where: { userId },
      orderBy: { id: 'asc' },
      select: { id: true },
    });

    const achievementsValue = achievements as Prisma.InputJsonValue;

    if (!existing) {
      const created = await this.prisma.userDatas.create({
        data: {
          userId,
          achievements: achievementsValue,
        },
      });

      return {
        userId,
        achievements: created.achievements,
      };
    }

    const updated = await this.prisma.userDatas.update({
      where: { id: existing.id },
      data: {
        achievements: achievementsValue,
      },
    });

    return {
      userId,
      achievements: updated.achievements,
    };
  }
}
