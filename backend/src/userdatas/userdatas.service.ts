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
  { id: 11, title: 'Titkos felfedező', description: 'Megtaláltad a titkos oldalt, gratulálunk!', completed: false },
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
    return this.prisma.userdatas.create({
      data: createUserdataDto,
    });
  }

  async findAll() {
    return this.prisma.userdatas.findMany();
  }

  async findOne(id: number) {
    return this.prisma.userdatas.findUnique({
      where:{id}
    });
  }

  async update(id: number, updateUserdataDto: UpdateUserdataDto) {
    return this.prisma.userdatas.update({
      where: { id },
      data: updateUserdataDto,
    });
  }

  async remove(id: number) {
    return this.prisma.userdatas.delete({
      where: { id },
    });
  }

  async recalculatePoints(userId: number) {
    // 1. Get all correct answers from useranswer table
    const correctAnswersCount = await this.prisma.useranswer.count({
      where: {
        userId,
        isCorrect: true,
      },
    });

    const userData = await this.prisma.userdatas.findFirst({
      where: { userId },
    });

    const adminBonusPoints = userData?.adminBonusPoints || 0;
    const dailyBonusPoints = userData?.dailyBonusPoints || 0;

    let achievementsCount = 0;
    if (userData?.achievements) {
      try {
        const parsed = typeof userData.achievements === 'string' 
          ? JSON.parse(userData.achievements) 
          : userData.achievements;
        if (Array.isArray(parsed)) {
          achievementsCount = parsed.length;
        }
      } catch (e) {
        console.error('Failed to parse achievements:', e);
      }
    }
    
    const calculatedPoints = (correctAnswersCount * 30) + (achievementsCount * 50) + adminBonusPoints + dailyBonusPoints;
    const calculatedLevel = Math.floor(calculatedPoints / 500) + 1;

    if (userData) {
      return this.prisma.userdatas.update({
        where: { id: userData.id },
        data: {
          totalPoints: calculatedPoints,
          level: calculatedLevel,
        },
      });
    } else {
      return this.prisma.userdatas.create({
        data: {
          userId,
          totalPoints: calculatedPoints,
          level: calculatedLevel,
          adminBonusPoints: 0,
        },
      });
    }
  }

  async incrementPoints(userId: number, points: number) {
    const userData = await this.prisma.userdatas.findFirst({
      where: { userId },
    });

    if (!userData) {
      const initialPoints = Math.max(0, points);
      const initialLevel = Math.floor(initialPoints / 500) + 1;
      return this.prisma.userdatas.create({
        data: {
          userId,
          totalPoints: initialPoints,
          adminBonusPoints: points,
          level: initialLevel,
        },
      });
    }

    const newTotalPoints = userData.totalPoints + points;
    const newLevel = Math.floor(newTotalPoints / 500) + 1;

    return this.prisma.userdatas.update({
      where: { id: userData.id },
      data: {
        totalPoints: newTotalPoints,
        level: newLevel,
      },
    });
  }

  async incrementDailyBonus(userId: number, points: number) {
    const userData = await this.prisma.userdatas.findFirst({
      where: { userId },
    });

    if (!userData) {
      return this.prisma.userdatas.create({
        data: {
          userId,
          totalPoints: points,
          dailyBonusPoints: points,
          level: Math.floor(points / 500) + 1,
        },
      });
    }

    const newDailyPoints = userData.dailyBonusPoints + points;
    const newTotalPoints = userData.totalPoints + points;
    const newLevel = Math.floor(newTotalPoints / 500) + 1;

    return this.prisma.userdatas.update({
      where: { id: userData.id },
      data: {
        dailyBonusPoints: newDailyPoints,
        totalPoints: newTotalPoints,
        level: newLevel,
      },
    });
  }

  async getAchievementsByUserId(userId: number) {
    let userData = await this.prisma.userdatas.findFirst({
      where: { userId },
      orderBy: { id: 'asc' },
    });

    if (!userData) {
      userData = await this.prisma.userdatas.create({
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
    const existing = await this.prisma.userdatas.findFirst({
      where: { userId },
      orderBy: { id: 'asc' },
      select: { id: true, achievements: true },
    });

    const overrides = this.extractAdminOverrides(achievements);
    const achievementsValue = JSON.stringify(Array.from(overrides.entries()).map(([id, completed]) => ({
      id,
      completed,
    })));

    if (!existing) {
      const created = await this.prisma.userdatas.create({
        data: {
          userId,
          achievements: achievementsValue,
        },
      });

      return {
        userId,
        achievements: created.achievements ? JSON.parse(created.achievements as string) : [],
      };
    }

    const updated = await this.prisma.userdatas.update({
      where: { id: existing.id },
      data: {
        achievements: achievementsValue,
      },
    });

    return {
      userId,
      achievements: updated.achievements ? JSON.parse(updated.achievements as string) : [],
    };
  }

  async markAchievementCompleted(userId: number, achievementId: number) {
    const userData = await this.prisma.userdatas.findFirst({
      where: { userId },
    });

    if (!userData) {
      return this.prisma.userdatas.create({
        data: {
          userId,
          achievements: JSON.stringify([{ id: achievementId, completed: true }]),
        },
      });
    }

    const overrides = this.extractAdminOverrides(userData.achievements);
    if (overrides.get(achievementId)) {
      return userData; // Already completed
    }

    overrides.set(achievementId, true);
    const achievementsValue = JSON.stringify(Array.from(overrides.entries()).map(([id, completed]) => ({
      id,
      completed,
    })));

    // Award points for completing an achievement: 50 points
    await this.incrementPoints(userId, 50);

    return this.prisma.userdatas.update({
      where: { id: userData.id },
      data: {
        achievements: achievementsValue,
      },
    });
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
