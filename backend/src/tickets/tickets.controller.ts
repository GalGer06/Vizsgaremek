import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketsService } from './tickets.service';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Új ticket (hibajelentés/javaslat) létrehozása' })
  create(@Request() req, @Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(req.user.userId, createTicketDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Összes ticket lekérése (csak adminoknak)' })
  async findAll(@Request() req) {
    // Basic authorization check: users can only see tickets if they are admins.
    // If not admin, you might want to only return their own tickets or nothing.
    // Assuming 'access' field in user represents admin status.
    if (!req.user.access) {
      // For now, let's keep it simple: regular users might want to see their tickets
      // But for this request, we'll focus on the admin side later.
      return [];
    }
    return this.ticketsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Egy ticket lekérése ID alapján' })
  @ApiParam({ name: 'id', description: 'Ticket egyedi azonosítója' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Ticket állapotának módosítása (csak adminoknak)' })
  @ApiParam({ name: 'id', description: 'Ticket egyedi azonosítója' })
  @ApiBody({ 
    schema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['OPEN', 'CLOSED'], example: 'CLOSED' }
        }
    }
  })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'OPEN' | 'CLOSED',
    @Request() req
  ) {
    if (!req.user.access) {
      throw new Error('Unauthorized');
    }
    return this.ticketsService.updateStatus(+id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Ticket törlése (csak adminoknak)' })
  @ApiParam({ name: 'id', description: 'Ticket egyedi azonosítója' })
  remove(@Param('id') id: string, @Request() req) {
    if (!req.user.access) {
      throw new Error('Unauthorized');
    }
    return this.ticketsService.remove(+id);
  }
}
