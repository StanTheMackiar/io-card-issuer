import { Module } from '@nestjs/common';
import { ProcessorPersistenceModule } from './processor.persistence.module';

@Module({
  imports: [ProcessorPersistenceModule],
})
export class ProcessorModule {}
