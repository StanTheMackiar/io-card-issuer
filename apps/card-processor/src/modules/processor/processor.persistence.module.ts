import { CardOrmEntity, CardRequestOrmEntity } from '@app/shared';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CardRequestOrmEntity, CardOrmEntity])],
})
export class ProcessorPersistenceModule {}
