import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { UserdatasService } from 'src/userdatas/userdatas.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private userdatasService: UserdatasService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        access: true,
        profilePicture: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async updateProfilePicture(id: number, profilePicture: string) {
    return this.prisma.user.update({
      where: { id },
      data: { profilePicture },
    });
  }

  async updateAccess(id: number, access: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { access },
    });
  }

  async remove(id: number) {
    // Check and remove related entities first to avoid foreign key constraint errors
    await this.prisma.$transaction(async (tx) => {
      // Delete user data
      await tx.userdatas.deleteMany({ where: { userId: id } });
      
      // Delete friend requests
      await tx.friendrequest.deleteMany({
        where: { OR: [{ requesterId: id }, { receiverId: id }] },
      });
      
      // Delete friend links
      await tx.friend.deleteMany({
        where: { OR: [{ userId: id }, { friendId: id }] },
      });

      // Delete the user
      await tx.user.delete({ where: { id } });
    });
  }

  async searchByUsername(username: string, currentUserId: number) {
    return this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        username: {
          contains: username,
        },
      },
      orderBy: {
        username: 'asc',
      },
      take: 20,
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
      },
    });
  }

  async findFriends(userId: number) {
    const links = await this.prisma.friend.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
      },
      include: {
        user_friend_userIdTouser: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePicture: true,
          },
        },
        user_friend_friendIdTouser: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return links.map((link) => 
      link.userId === userId ? link.user_friend_friendIdTouser : link.user_friend_userIdTouser
    );
  }

  async addFriend(userId: number, friendId: number) {
    const firstUserId = Math.min(userId, friendId);
    const secondUserId = Math.max(userId, friendId);

    return this.prisma.friend.create({
      data: {
        userId: firstUserId,
        friendId: secondUserId,
      },
    });
  }

  async removeFriend(userId: number, friendId: number) {
    const firstUserId = Math.min(userId, friendId);
    const secondUserId = Math.max(userId, friendId);

    return this.prisma.friend.delete({
      where: {
        userId_friendId: {
          userId: firstUserId,
          friendId: secondUserId,
        },
      },
    });
  }

  async friendshipExists(userId: number, friendId: number) {
    const firstUserId = Math.min(userId, friendId);
    const secondUserId = Math.max(userId, friendId);

    return this.prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId: firstUserId,
          friendId: secondUserId,
        },
      },
      select: { id: true },
    });
  }

  async findIncomingFriendRequests(userId: number) {
    return this.prisma.friendrequest.findMany({
      where: { receiverId: userId },
      include: {
        user_friendrequest_requesterIdTouser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findSentFriendRequests(userId: number) {
    return this.prisma.friendrequest.findMany({
      where: { requesterId: userId },
      include: {
        user_friendrequest_receiverIdTouser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async friendRequestExists(requesterId: number, receiverId: number) {
    return this.prisma.friendrequest.findUnique({
      where: {
        requesterId_receiverId: {
          requesterId,
          receiverId,
        },
      },
      select: { id: true },
    });
  }

  async createFriendRequest(requesterId: number, receiverId: number) {
    return this.prisma.friendrequest.create({
      data: {
        requesterId,
        receiverId,
      },
    });
  }

  async acceptFriendRequest(requestId: number, receiverId: number) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.friendrequest.findUnique({
        where: { id: requestId },
      });

      if (!request || request.receiverId !== receiverId) {
        return null;
      }

      const firstUserId = Math.min(request.requesterId, request.receiverId);
      const secondUserId = Math.max(request.requesterId, request.receiverId);

      const existing = await tx.friend.findUnique({
        where: {
          userId_friendId: {
            userId: firstUserId,
            friendId: secondUserId,
          },
        },
        select: { id: true },
      });

      if (!existing) {
        await tx.friend.create({
          data: {
            userId: firstUserId,
            friendId: secondUserId,
          },
        });
      }

      await tx.friendrequest.delete({
        where: { id: requestId },
      });

      return request;
    });
  }

  async declineFriendRequest(requestId: number, receiverId: number) {
    const request = await this.prisma.friendrequest.findUnique({
      where: { id: requestId },
      select: { id: true, receiverId: true },
    });

    if (!request || request.receiverId !== receiverId) {
      return null;
    }

    await this.prisma.friendrequest.delete({
      where: { id: requestId },
    });

    return request;
  }

  async cancelSentFriendRequest(requesterId: number, receiverId: number) {
    const request = await this.prisma.friendrequest.findUnique({
      where: {
        requesterId_receiverId: {
          requesterId,
          receiverId,
        },
      },
      select: { id: true },
    });

    if (!request) {
      return null;
    }

    await this.prisma.friendrequest.delete({
      where: { id: request.id },
    });

    return request;
  }

  async getLeaderboard(userId: number) {
    // Get all friends
    const friends = await this.findFriends(userId);
    const friendIds = friends.map((f) => f.id);

    // Get all users' data (current user + friends)
    const allUserIds = [userId, ...friendIds];

    // Ensure points are recalculated for all relevant users before showing leaderboard
    await Promise.all(
      allUserIds.map((id) => this.userdatasService.recalculatePoints(id)),
    );

    const usersData = await this.prisma.user.findMany({
      where: {
        id: { in: allUserIds },
      },
      include: {
        userdatas: true,
      },
    });

    // Format leaderboard
    const leaderboardRaw = usersData.map((user) => ({
      id: user.id,
      username: user.username,
      profilePicture: user.profilePicture,
      points: user.userdatas?.[0]?.totalPoints || 0,
      level: user.userdatas?.[0]?.level || 1,
      isCurrentUser: user.id === userId,
    }));

    // Sort by points descending
    const sortedLeaderboard = leaderboardRaw.sort((a, b) => b.points - a.points);

    // Format leaderboard with rank
    const leaderboard = sortedLeaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return leaderboard;
  }
}
