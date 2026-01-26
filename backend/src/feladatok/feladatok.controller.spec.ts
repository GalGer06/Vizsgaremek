import { Test, TestingModule } from '@nestjs/testing';
import { FeladatokController } from './feladatok.controller';
import { FeladatokService } from './feladatok.service';

describe('FeladatokController', () => {
  let controller: FeladatokController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeladatokController],
      providers: [FeladatokService],
    }).compile();

    controller = module.get<FeladatokController>(FeladatokController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
