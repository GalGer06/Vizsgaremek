import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFeladatokDto } from './dto/create-feladatok.dto';
import { UpdateFeladatokDto } from './dto/update-feladatok.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FeladatokService {
  constructor (private prisma: PrismaService) {}

  private parseAnswers(rawAnswers: unknown): string[] {
    let answersSource: unknown = rawAnswers;

    if (typeof answersSource === 'string') {
      try {
        answersSource = JSON.parse(answersSource);
      } catch {
        throw new BadRequestException('Invalid answers format. Expected JSON array with 4 items.');
      }
    }

    const normalized = Array.isArray(answersSource)
      ? answersSource
      : typeof answersSource === 'object' && answersSource !== null
        ? Object.values(answersSource)
        : null;

    if (!normalized || normalized.length !== 4) {
      throw new BadRequestException('Each question must contain exactly 4 possible answers.');
    }

    const cleanedAnswers = normalized.map((answer) => {
      if (typeof answer !== 'string') {
        throw new BadRequestException('All answers must be strings.');
      }

      const trimmed = answer.trim();

      if (!trimmed) {
        throw new BadRequestException('Answer text cannot be empty.');
      }

      return trimmed;
    });

    return cleanedAnswers;
  }

  private ensureCorrectAnswer(correct: string, answers: string[]) {
    if (!answers.includes(correct.trim())) {
      throw new BadRequestException('Correct answer must be one of the 4 possible answers.');
    }
  }

  private mapQuestion(question: { answers: unknown; correct: string }) {
    const answers = this.parseAnswers(question.answers);
    return {
      ...question,
      answers,
    };
  }

  async create(createFeladatokDto: CreateFeladatokDto) {
    const answers = this.parseAnswers(createFeladatokDto.answers);
    this.ensureCorrectAnswer(createFeladatokDto.correct, answers);

    return this.prisma.feladatok.create({
      data: {
        ...createFeladatokDto,
        answers,
      },
    });
  }

  async findAll() {
    const questions = await this.prisma.feladatok.findMany();
    return questions.map((question) => this.mapQuestion(question));
  }

  async findOne(id: number) {
    const question = await this.prisma.feladatok.findUnique({
      where: { id },
    });

    if (!question) {
      return null;
    }

    return this.mapQuestion(question);
  }

  async update(id: number, updateFeladatokDto: UpdateFeladatokDto) {
    const existing = await this.prisma.feladatok.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new BadRequestException('Question not found.');
    }

    const answers = updateFeladatokDto.answers
      ? this.parseAnswers(updateFeladatokDto.answers)
      : this.parseAnswers(existing.answers);

    const correct = updateFeladatokDto.correct ?? existing.correct;
    this.ensureCorrectAnswer(correct, answers);

    return this.prisma.feladatok.update({
      where: { id },
      data: {
        ...updateFeladatokDto,
        answers,
        correct,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.feladatok.delete({
      where: { id },
    });
  }
}
