import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SetUserAccessDto } from './dto/set-user-access.dto';

const ORIGINAL_ADMIN_USERNAME = 'Admin';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
