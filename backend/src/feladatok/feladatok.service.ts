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

  async findAllForUser(userId: number) {
    const questions = await this.prisma.feladatok.findMany();
    const answered = await this.prisma.userAnswer.findMany({
      where: { userId },
    });

    const answeredIds = new Set(answered.map((a) => a.questionId));

    return questions
      .map((q) => this.mapQuestion(q))
      .map((q) => ({
        ...q,
        isAnswered: answeredIds.has(q.id),
      }));
  }

  async findDaily() {
    const allQuestions = await this.prisma.feladatok.findMany();
    if (allQuestions.length === 0) return [];
    
    // Use current date as seed for daily stability
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    // Simple deterministic shuffle based on date string
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
        seed += dateString.charCodeAt(i);
    }

    const shuffled = [...allQuestions].sort((a, b) => {
        const valA = (a.id * seed) % 101;
        const valB = (b.id * seed) % 101;
        return valA - valB;
    });

    // Return first 3 questions for the day
    return shuffled.slice(0, 3).map((q) => this.mapQuestion(q));
  }

  async recordAnswer(userId: number, questionId: number, isCorrect: boolean) {
    return this.prisma.userAnswer.upsert({
      where: {
        userId_questionId: { userId, questionId },
      },
      update: {
        isCorrect,
      },
      create: {
        userId,
        questionId,
        isCorrect,
      },
    });
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
