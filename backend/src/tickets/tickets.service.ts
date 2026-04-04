import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createTicketDto: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: {
        userId,
        type: createTicketDto.type,
        description: createTicketDto.description,
        attachment: createTicketDto.attachment || null,
        status: 'OPEN',
      },
    });
  }

  async findAll() {
    return this.prisma.ticket.findMany({
      include: {
        user: {
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

  async findOne(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async updateStatus(id: number, status: 'OPEN' | 'CLOSED') {
    return this.prisma.ticket.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: number) {
    return this.prisma.ticket.delete({
      where: { id },
    });
  }
}
