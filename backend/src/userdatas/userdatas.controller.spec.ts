import { Test, TestingModule } from '@nestjs/testing';
import { UserdatasController } from './userdatas.controller';
import { UserdatasService } from './userdatas.service';

describe('UserdatasController', () => {
  let controller: UserdatasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserdatasController],
      providers: [UserdatasService],
    }).compile();

    controller = module.get<UserdatasController>(UserdatasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
