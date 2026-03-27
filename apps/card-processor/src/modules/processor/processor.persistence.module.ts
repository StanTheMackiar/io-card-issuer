import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity, CardRequestEntity } from '@app/shared';

@Module({
  imports: [TypeOrmModule.forFeature([CardRequestEntity, CardEntity])],
})
export class ProcessorPersistenceModule {}
