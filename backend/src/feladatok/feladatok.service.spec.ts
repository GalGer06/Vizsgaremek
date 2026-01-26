import { Test, TestingModule } from '@nestjs/testing';
import { FeladatokService } from './feladatok.service';

describe('FeladatokService', () => {
  let service: FeladatokService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeladatokService],
    }).compile();

    service = module.get<FeladatokService>(FeladatokService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
