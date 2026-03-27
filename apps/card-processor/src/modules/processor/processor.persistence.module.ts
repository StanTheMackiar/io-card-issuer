import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity, CardRequestOrmEntity } from '@app/shared';

@Module({
  imports: [TypeOrmModule.forFeature([CardRequestOrmEntity, CardEntity])],
})
export class ProcessorPersistenceModule {}
