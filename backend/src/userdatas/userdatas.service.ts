import { Injectable } from '@nestjs/common';
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

type AchievementTemplate = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

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

  async incrementPoints(userId: number, points: number) {
    const userData = await this.prisma.userDatas.findFirst({
      where: { userId },
    });

    if (!userData) {
      const initialPoints = points;
      const initialLevel = Math.floor(initialPoints / 500) + 1;
      return this.prisma.userDatas.create({
        data: {
          userId,
          totalPoints: initialPoints,
          level: initialLevel,
        },
      });
    }

    const currentPoints = userData.totalPoints;
    // Handle both positive (increment) and negative (decrement) points
    // Ensure points don't drop below 0
    const newTotalPoints = Math.max(0, currentPoints + points);
    const newLevel = Math.floor(newTotalPoints / 500) + 1;

    return this.prisma.userDatas.update({
      where: { id: userData.id },
      data: {
        totalPoints: newTotalPoints,
        level: newLevel,
      },
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
        },
      });
    }

    const friendsCount = await this.prisma.friend.count({
      where: {
        OR: [{ userId }, { friendId: userId }],
      },
    });

    const autoAchievements = this.buildAutomaticAchievements(
      userData.streak,
      userData.totalPoints,
      userData.level,
      friendsCount,
    );

    const adminOverrides = this.extractAdminOverrides(userData.achievements);
    const achievements = autoAchievements.map((item) => {
      const override = adminOverrides.get(item.id);
      return {
        ...item,
        completed: override ?? item.completed,
      };
    });

    return {
      userId,
      achievements,
    };
  }

  async updateAchievementsByUserId(userId: number, achievements: unknown[]) {
    const existing = await this.prisma.userDatas.findFirst({
      where: { userId },
      orderBy: { id: 'asc' },
      select: { id: true },
    });

    const overrides = this.extractAdminOverrides(achievements);
    const overridesArray = Array.from(overrides.entries()).map(([id, completed]) => ({
      id,
      completed,
    }));
    const achievementsValue = overridesArray;

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
      achievements: updated.achievements ?? [],
    };
  }

  private buildAutomaticAchievements(
    streak: number,
    totalPoints: number,
    level: number,
    friendsCount: number,
  ): AchievementTemplate[] {
    return DEFAULT_ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      completed: this.isAutomaticallyCompleted(
        achievement.id,
        streak,
        totalPoints,
        level,
        friendsCount,
      ),
    }));
  }

  private isAutomaticallyCompleted(
    achievementId: number,
    streak: number,
    totalPoints: number,
    level: number,
    friendsCount: number,
  ): boolean {
    switch (achievementId) {
      case 1:
        return true;
      case 2:
        return totalPoints > 0 || level > 1;
      case 3:
        return totalPoints >= 150;
      case 4:
        return totalPoints >= 250;
      case 5:
        return totalPoints >= 350;
      case 6:
        return streak >= 7;
      case 7:
        return streak >= 3;
      case 8:
        return friendsCount >= 1;
      case 9:
        return totalPoints >= 500;
      case 10:
        return level >= 10 && friendsCount >= 2;
      default:
        return false;
    }
  }

  private extractAdminOverrides(achievements: unknown): Map<number, boolean> {
    if (!Array.isArray(achievements)) {
      return new Map();
    }

    const overrides = new Map<number, boolean>();
    for (const item of achievements) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      const candidate = item as { id?: unknown; completed?: unknown };
      if (typeof candidate.id !== 'number' || typeof candidate.completed !== 'boolean') {
        continue;
      }

      overrides.set(candidate.id, candidate.completed);
    }

    return overrides;
  }
}
