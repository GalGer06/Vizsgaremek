import { Injectable } from '@nestjs/common';
import { CreateUserdataDto } from './dto/create-userdata.dto';
import { UpdateUserdataDto } from './dto/update-userdata.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserdatasService {
  constructor(private prisma: PrismaService) {}

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
      where: { id },
      include: {
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
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

    const userData = await this.prisma.userdatas.findUnique({
      where: { userId },
      include: { achievements: true },
    });

    if (!userData) return null;

    const adminBonusPoints = userData.adminBonusPoints || 0;
    const dailyBonusPoints = userData.dailyBonusPoints || 0;

    const completedAchievementsCount = userData.achievements.filter(
      (a) => a.completed,
    ).length;

    const totalPoints =
      correctAnswersCount * 30 +
      completedAchievementsCount * 50 +
      adminBonusPoints +
      dailyBonusPoints;
    const calculatedLevel = Math.floor(totalPoints / 500) + 1;

    console.log(`Recalculating points for user ${userId}: Correct: ${correctAnswersCount}, Achievements: ${completedAchievementsCount}, AdminBonus: ${adminBonusPoints}, DailyBonus: ${dailyBonusPoints}, Total: ${totalPoints}`);

    return this.prisma.userdatas.update({
      where: { id: userData.id },
      data: {
        totalPoints: totalPoints,
        level: calculatedLevel,
      },
    });
  }

  async incrementPoints(userId: number, points: number) {
    const userData = await this.prisma.userdatas.findUnique({
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
    const userData = await this.prisma.userdatas.findUnique({
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
    let userData = await this.prisma.userdatas.findUnique({
      where: { userId },
      include: {
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });

    if (!userData) {
      userData = await this.prisma.userdatas.create({
        data: { userId },
        include: {
          achievements: {
            include: {
              achievement: true,
            },
          },
        },
      });
    }

    // Map the relational data to the format the frontend expects
    const achievements = userData.achievements.map((ua) => ({
      id: ua.achievementId,
      title: ua.achievement.title,
      description: ua.achievement.description,
      image: ua.achievement.image,
      completed: ua.completed,
    }));

    return {
      userId,
      achievements,
    };
  }

  async updateAchievementsByUserId(userId: number, achievements: any[]) {
    const userData = await this.prisma.userdatas.findUnique({
      where: { userId },
      include: { achievements: true },
    });

    if (!userData) return null;

    // Update each achievement status
    for (const ach of achievements) {
      await this.prisma.user_achievement.upsert({
        where: {
          userDataId_achievementId: {
            userDataId: userData.id,
            achievementId: ach.id,
          },
        },
        update: { completed: ach.completed },
        create: {
          userDataId: userData.id,
          achievementId: ach.id,
          completed: ach.completed,
        },
      });
    }

    return this.getAchievementsByUserId(userId);
  }

  async markAchievementCompleted(userId: number, achievementId: number) {
    let userData = await this.prisma.userdatas.findUnique({
      where: { userId },
      include: { achievements: true },
    });

    if (!userData) {
      userData = await this.prisma.userdatas.create({
        data: { userId },
        include: { achievements: true },
      });
    }

    await this.prisma.user_achievement.upsert({
      where: {
        userDataId_achievementId: {
          userDataId: userData.id,
          achievementId: achievementId,
        },
      },
      update: { completed: true },
      create: {
        userDataId: userData.id,
        achievementId: achievementId,
        completed: true,
      },
    });

    await this.incrementPoints(userId, 50);
    return this.getAchievementsByUserId(userId);
  }
}

