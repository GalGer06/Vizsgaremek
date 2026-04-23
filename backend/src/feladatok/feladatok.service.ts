import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFeladatokDto } from './dto/create-feladatok.dto';
import { UpdateFeladatokDto } from './dto/update-feladatok.dto';
import { PrismaService } from 'src/prisma.service';
import { UserdatasService } from 'src/userdatas/userdatas.service';

@Injectable()
export class FeladatokService {
  constructor (
    private prisma: PrismaService,
    private userdatasService: UserdatasService,
  ) {}

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

      return answer.trim();
    });

    return cleanedAnswers;
  }

  private ensureCorrectAnswer(correct: string, answers: string[]) {
    const trimmedCorrect = correct.trim();
    if (!answers.some(a => a.trim() === trimmedCorrect)) {
      throw new BadRequestException('Correct answer must be one of the 4 possible answers.');
    }
  }

  private mapQuestion(question: { id: number; answers: unknown; correct: string; [key: string]: any }, seedSuffix?: string) {
    const answers = this.parseAnswers(question.answers);
    const correct = question.correct.trim();
    
    // Use a deterministic seed to keep answer positions stable for the same user/question
    const seedBase = seedSuffix ? `${seedSuffix}-${question.id}` : `${question.id}`;
    let seed = 0;
    for (let i = 0; i < seedBase.length; i++) seed += seedBase.charCodeAt(i);

    const shuffledAnswers = [...answers].sort((a, b) => {
        const valA = (a.length * seed + a.charCodeAt(0)) % 101;
        const valB = (b.length * seed + b.charCodeAt(0)) % 101;
        return valA - valB;
    });

    return {
      ...question,
      answers: shuffledAnswers,
      correct,
    };
  }

  async create(createFeladatokDto: CreateFeladatokDto) {
    const answers = this.parseAnswers(createFeladatokDto.answers);
    const trimmedCorrect = createFeladatokDto.correct.trim();
    this.ensureCorrectAnswer(trimmedCorrect, answers);

    return this.prisma.feladatok.create({
      data: {
        ...createFeladatokDto,
        history: createFeladatokDto.history ?? '',
        answers: JSON.stringify(answers),
        correct: trimmedCorrect,
      },
    });
  }

  async findAll() {
    const questions = await this.prisma.feladatok.findMany();
    return questions.map((question) => this.mapQuestion(question));
  }

  async findAllForUser(userId: number, seedSuffix?: string) {
    const questions = await this.prisma.feladatok.findMany();
    const answered = await this.prisma.useranswer.findMany({
      where: { userId },
    });

    const answeredMap = new Map(answered.map((a) => [a.questionId, a]));

    return questions
      .map((q) => {
        const userAns = answeredMap.get(q.id);
        // If answered, don't shuffle (or shuffle with a fixed seed if we want consistency)
        // Actually, to keep it simple and correct, we'll use a deterministic shuffle
        // base on question ID so the positions stay the same for the user.
        return this.mapQuestion(q, seedSuffix);
      })
      .map((q: any) => {
        const userAns = answeredMap.get(q.id);
        return {
          ...q,
          isAnswered: !!userAns,
          userSelectedAnswer: userAns?.selectedAnswer || null,
        };
      });
  }

  async findDaily() {
    const allQuestions = await this.prisma.feladatok.findMany();
    if (allQuestions.length === 0) return [];
    
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) seed += dateString.charCodeAt(i);

    const shuffled = [...allQuestions].sort((a, b) => {
        const valA = (a.id * seed) % 101;
        const valB = (b.id * seed) % 101;
        return valA - valB;
    });

    // Pick 10 questions and use dateString as suffix to keep answer options stable for the day
    return shuffled.slice(0, 10).map((q) => this.mapQuestion(q, dateString));
  }

  async findDailyForUser(userId: number) {
    const dailyQuestions = await this.findDaily();
    const answered = await this.prisma.userdailyanswer.findMany({
      where: { userId },
    });

    const answeredMap = new Map(answered.map((a) => [a.questionId, a]));

    return dailyQuestions.map((q) => {
      const userAns = answeredMap.get(q.id);
      return {
        ...q,
        isAnswered: !!userAns,
        userSelectedAnswer: userAns?.selectedAnswer || null,
      };
    });
  }

  async recordAnswer(userId: number, questionId: number, isCorrect: boolean, selectedAnswer: string) {
    const question = await this.prisma.feladatok.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new BadRequestException('Question not found.');
    }

    // Force server-side check to prevent client-side manipulation or mismatch
    const actualCorrect = question.correct.trim();
    const isActuallyCorrect = selectedAnswer.trim() === actualCorrect;

    const res = await this.prisma.useranswer.upsert({
      where: {
        userId_questionId: { userId, questionId },
      },
      update: {
        isCorrect: isActuallyCorrect,
        selectedAnswer,
      },
      create: {
        userId,
        questionId,
        isCorrect: isActuallyCorrect,
        selectedAnswer,
      },
    });

    if (isActuallyCorrect) {
      // Award 30 points if the answer is correct
      // We also recalculate points to ensure achievements are applied
      await this.userdatasService.recalculatePoints(userId);
    }

    return {
      ...res,
      isCorrect: isActuallyCorrect, // Return the verified status
    };
  }

  async recordDailyAnswer(userId: number, questionId: number, isCorrect: boolean, selectedAnswer: string) {
    const question = await this.prisma.feladatok.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new BadRequestException('Question not found.');
    }

    const actualCorrect = question.correct.trim();
    const isActuallyCorrect = selectedAnswer.trim() === actualCorrect;

    const res = await this.prisma.userdailyanswer.upsert({
      where: {
        userId_questionId: { userId, questionId },
      },
      update: {
        isCorrect: isActuallyCorrect,
        selectedAnswer,
      },
      create: {
        userId,
        questionId,
        isCorrect: isActuallyCorrect,
        selectedAnswer,
      },
    });

    if (isActuallyCorrect) {
      // Award 30 points if the answer is correct
      await this.userdatasService.recalculatePoints(userId);
    }

    return {
      ...res,
      isCorrect: isActuallyCorrect,
    };
  }

  async resetUserAnswers(userId: number) {
    return this.prisma.useranswer.deleteMany({
      where: { userId },
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
      : this.parseAn(updateFeladatokDto.correct ?? existing.correct).trim()

    const correct = updateFeladatokDto.correct ?? existing.correct;
    this.ensureCorrectAnswer(correct, answers);

    return this.prisma.feladatok.update({
      where: { id },
      data: {
        ...updateFeladatokDto,
        answers: JSON.stringify(answers),
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
