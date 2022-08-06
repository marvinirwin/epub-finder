import { Test, TestingModule } from '@nestjs/testing';
import { ThaiController } from './thai.controller';

describe('ThaiController', () => {
  let controller: ThaiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThaiController],
    }).compile();

    controller = module.get<ThaiController>(ThaiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
