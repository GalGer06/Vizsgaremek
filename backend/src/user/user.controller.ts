import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SetUserAccessDto } from './dto/set-user-access.dto';

const ORIGINAL_ADMIN_USERNAME = 'Rikimik';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('search/by-username')
  @UseGuards(JwtAuthGuard)
  searchByUsername(
    @Query('username') username: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    const requesterId = req.user?.userId;

    if (!requesterId) {
      throw new ForbiddenException('Unauthorized');
    }

    return this.userService.searchByUsername(username ?? '', requesterId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number; access?: boolean } },
  ) {
    const targetUserId = +id;
    const requesterId = req.user?.userId;
    const isAdmin = !!req.user?.access;

    if (requesterId !== targetUserId && !isAdmin) {
      throw new ForbiddenException('You can only view your own profile');
    }

    return this.userService.findOne(targetUserId);
  }

  @Get(':id/friends')
  @UseGuards(JwtAuthGuard)
  findFriends(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number; access?: boolean } },
  ) {
    const targetUserId = +id;
    const requesterId = req.user?.userId;
    const isAdmin = !!req.user?.access;

    if (requesterId !== targetUserId && !isAdmin) {
      throw new ForbiddenException('You can only view your own friends');
    }

    return this.userService.findFriends(targetUserId);
  }

  @Post(':id/friends/:friendId')
  @UseGuards(JwtAuthGuard)
  async createFriendRequest(
    @Param('id') id: string,
    @Param('friendId') friendId: string,
    @Req() req: { user?: { userId?: number; access?: boolean } },
  ) {
    const requesterId = req.user?.userId;
    const targetUserId = +id;
    const targetFriendId = +friendId;

    if (requesterId !== targetUserId) {
      throw new ForbiddenException('You can only add friends for yourself');
    }

    if (targetUserId === targetFriendId) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    const friendUser = await this.userService.findOne(targetFriendId);
    if (!friendUser) {
      throw new NotFoundException('Friend user not found');
    }

    const existing = await this.userService.friendshipExists(targetUserId, targetFriendId);
    if (existing) {
      throw new ConflictException('You are already friends');
    }

    const existingRequest = await this.userService.friendRequestExists(
      targetUserId,
      targetFriendId,
    );

    if (existingRequest) {
      if (existingRequest.requesterId === targetUserId) {
        throw new ConflictException('Friend request already sent');
      } else {
        await this.userService.acceptFriendRequest(
          existingRequest.id,
          targetUserId,
        );
        return {
          status: 'accepted-existing-request',
          friends: await this.userService.findFriends(targetUserId),
        };
      }
    }

    await this.userService.createFriendRequest(targetUserId, targetFriendId);
    return {
      status: 'request-sent',
      sentRequests: await this.userService.findSentFriendRequests(targetUserId),
    };
  }

  @Get(':id/friend-requests')
  @UseGuards(JwtAuthGuard)
  findIncomingFriendRequests(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number; access?: boolean } },
  ) {
    const targetUserId = +id;
    const requesterId = req.user?.userId;

    if (requesterId !== targetUserId) {
      throw new ForbiddenException('You can only view your own friend requests');
    }

    return this.userService.findIncomingFriendRequests(targetUserId);
  }

  @Get(':id/friend-requests/sent')
  @UseGuards(JwtAuthGuard)
  findSentFriendRequests(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    const targetUserId = +id;
    const requesterId = req.user?.userId;

    if (requesterId !== targetUserId) {
      throw new ForbiddenException('You can only view your own sent friend requests');
    }

    return this.userService.findSentFriendRequests(targetUserId);
  }

  @Post(':id/friend-requests/accept/:requestId')
  @UseGuards(JwtAuthGuard)
  async acceptFriendRequest(
    @Param('id') id: string,
    @Param('requestId') requestId: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    const targetUserId = +id;
    const requesterId = req.user?.userId;

    if (requesterId !== targetUserId) {
      throw new ForbiddenException('You can only accept your own friend requests');
    }

    const accepted = await this.userService.acceptFriendRequest(+requestId, targetUserId);
    if (!accepted) {
      throw new NotFoundException('Friend request not found');
    }

    return {
      status: 'accepted',
      friends: await this.userService.findFriends(targetUserId),
      requests: await this.userService.findIncomingFriendRequests(targetUserId),
    };
  }

  @Delete(':id/friend-requests/:requestId')
  @UseGuards(JwtAuthGuard)
  async declineFriendRequest(
    @Param('id') id: string,
    @Param('requestId') requestId: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    const targetUserId = +id;
    const requesterId = req.user?.userId;

    if (requesterId !== targetUserId) {
      throw new ForbiddenException('You can only decline your own incoming requests');
    }

    const declined = await this.userService.declineFriendRequest(+requestId, targetUserId);
    if (!declined) {
      throw new NotFoundException('Friend request not found');
    }

    return this.userService.findIncomingFriendRequests(targetUserId);
  }

  @Delete(':id/friend-requests/sent/:receiverId')
  @UseGuards(JwtAuthGuard)
  async cancelSentFriendRequest(
    @Param('id') id: string,
    @Param('receiverId') receiverId: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    const targetUserId = +id;
    const targetReceiverId = +receiverId;
    const requesterId = req.user?.userId;

    if (requesterId !== targetUserId) {
      throw new ForbiddenException('You can only cancel your own sent requests');
    }

    const canceled = await this.userService.cancelSentFriendRequest(targetUserId, targetReceiverId);
    if (!canceled) {
      throw new NotFoundException('Sent friend request not found');
    }

    return this.userService.findSentFriendRequests(targetUserId);
  }

  @Delete(':id/friends/:friendId')
  @UseGuards(JwtAuthGuard)
  async removeFriend(
    @Param('id') id: string,
    @Param('friendId') friendId: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    const targetUserId = +id;
    const targetFriendId = +friendId;
    const requesterId = req.user?.userId;

    if (requesterId !== targetUserId) {
      throw new ForbiddenException('You can only remove your own friends');
    }

    const existing = await this.userService.friendshipExists(targetUserId, targetFriendId);
    if (!existing) {
      throw new NotFoundException('Friendship not found');
    }

    await this.userService.removeFriend(targetUserId, targetFriendId);
    return this.userService.findFriends(targetUserId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: { user?: { userId?: number; access?: boolean } },
  ) {
    const targetUserId = +id;
    const requesterId = req.user?.userId;
    const isAdmin = !!req.user?.access;

    if (requesterId !== targetUserId && !isAdmin) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.userService.update(targetUserId, updateUserDto);
  }

  @Patch(':id/access')
  @UseGuards(JwtAuthGuard)
  updateAccess(
    @Param('id') id: string,
    @Body() setUserAccessDto: SetUserAccessDto,
    @Req() req: { user?: { access?: boolean; username?: string } },
  ) {
    if (!req.user?.access) {
      throw new ForbiddenException('Admin access required');
    }

    const targetUserId = +id;

    if (!setUserAccessDto.access && req.user.username !== ORIGINAL_ADMIN_USERNAME) {
      throw new ForbiddenException('Only the original Admin can remove admin access');
    }

    return this.userService.findOne(targetUserId).then((targetUser) => {
      if (!targetUser) {
        throw new NotFoundException('User not found');
      }

      if (!setUserAccessDto.access && targetUser.username === ORIGINAL_ADMIN_USERNAME) {
        throw new ForbiddenException('Original Admin access cannot be removed');
      }

      return this.userService.updateAccess(targetUserId, setUserAccessDto.access);
    });
  }

  @Patch(':id/profile-picture')
  @UseGuards(JwtAuthGuard)
  updateProfilePicture(
    @Param('id') id: string,
    @Body('profilePicture') profilePicture: string,
    @Req() req: { user?: { userId?: number; access?: boolean } },
  ) {
    const targetUserId = +id;
    const requesterId = req.user?.userId;
    const isAdmin = !!req.user?.access;

    if (requesterId !== targetUserId && !isAdmin) {
      throw new ForbiddenException('You can only update your own profile picture');
    }

    if (!profilePicture) {
      throw new BadRequestException('Profile picture data is required');
    }

    return this.userService.updateProfilePicture(targetUserId, profilePicture);
  }

  @Get(':id/leaderboard')
  @UseGuards(JwtAuthGuard)
  getLeaderboard(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    const targetUserId = +id;
    const requesterId = req.user?.userId;

    if (requesterId !== targetUserId) {
      throw new ForbiddenException('You can only view your own leaderboard');
    }

    return this.userService.getLeaderboard(targetUserId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number; access?: boolean; username?: string } },
  ) {
    const targetUserId = +id;
    const requesterId = req.user?.userId;
    const isAdmin = !!req.user?.access;

    if (requesterId !== targetUserId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own account');
    }

    const targetUser = await this.userService.findOne(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.username === ORIGINAL_ADMIN_USERNAME) {
      throw new ForbiddenException('The original Admin account cannot be deleted');
    }

    return this.userService.remove(targetUserId);
  }
}
