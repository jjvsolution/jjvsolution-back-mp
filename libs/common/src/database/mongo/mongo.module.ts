import { Module } from '@nestjs/common';
import { RepositoriesModule } from './repositories/repositories.module';
import { SchemasModule } from './schemas/schemas.module';

@Module({
  imports: [RepositoriesModule, SchemasModule]
})
export class MongoModule {}
