import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor (private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
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

  async updateAccess(id: number, access: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { access },
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
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
      },
    });
  }

  async findFriends(userId: number) {
    const links = await this.prisma.friend.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        friend: {
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

    return links.map((link) => (link.userId === userId ? link.friend : link.user));
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
    return this.prisma.friendRequest.findMany({
      where: { receiverId: userId },
      include: {
        requester: {
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
    return this.prisma.friendRequest.findMany({
      where: { requesterId: userId },
      include: {
        receiver: {
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
    return this.prisma.friendRequest.findUnique({
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
    return this.prisma.friendRequest.create({
      data: {
        requesterId,
        receiverId,
      },
    });
  }

  async acceptFriendRequest(requestId: number, receiverId: number) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.friendRequest.findUnique({
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

      await tx.friendRequest.delete({
        where: { id: requestId },
      });

      return request;
    });
  }

  async declineFriendRequest(requestId: number, receiverId: number) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
      select: { id: true, receiverId: true },
    });

    if (!request || request.receiverId !== receiverId) {
      return null;
    }

    await this.prisma.friendRequest.delete({
      where: { id: requestId },
    });

    return request;
  }

  async cancelSentFriendRequest(requesterId: number, receiverId: number) {
    const request = await this.prisma.friendRequest.findUnique({
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

    await this.prisma.friendRequest.delete({
      where: { id: request.id },
    });

    return request;
  }
}
