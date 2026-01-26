import { Test, TestingModule } from '@nestjs/testing';
import { UserdatasService } from './userdatas.service';

describe('UserdatasService', () => {
  let service: UserdatasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserdatasService],
    }).compile();

    service = module.get<UserdatasService>(UserdatasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
