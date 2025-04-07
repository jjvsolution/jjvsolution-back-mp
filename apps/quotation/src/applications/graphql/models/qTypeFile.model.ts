import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { QBusinessAllModel } from './qBusiness.model';

@ObjectType('QTypeFileObjectType')
@InputType('QTypeFileInputType')
export class QTypeFileModel {
  @Field(() => String)
  name: string;

  @Field(() => String)
  mime: string;

  @Field(() => String)
  extension: string;
}

@ObjectType('QTypeFileAllObjectType')
@InputType('QTypeFileAllInputType')
export class QTypeFileAllModel extends QTypeFileModel {
  @Field(() => Number)
  id: number;

  @Field(() => [QTypeFileAllModel], { nullable: true })
  typeFile?: QTypeFileAllModel[];
}

