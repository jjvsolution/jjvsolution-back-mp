import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PPTypePaymentType } from '@prisma/client';

export class DebtLinkDueDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  expirationDate: Date;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  paidAmount: number;

  @ApiProperty()
  pendingBalance: number;

  @ApiProperty()
  status: string;
}

export class DebtLinkDebtDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  payId: string;

  @ApiProperty()
  description: string;
}

export class DebtLinkPaymentDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  paymentDate: Date;

  @ApiProperty()
  paymentType: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: [Number] })
  duesOfPayIds: number[];
}

export class DebtLinkDetailDto {
  @ApiProperty({ type: DebtLinkDebtDto })
  debt: DebtLinkDebtDto;

  @ApiProperty()
  totalDebt: number;

  @ApiProperty()
  totalPaid: number;

  @ApiProperty()
  totalPending: number;

  @ApiProperty({ type: [DebtLinkDueDto] })
  dues: DebtLinkDueDto[];

  @ApiProperty({ type: [DebtLinkPaymentDto] })
  payments: DebtLinkPaymentDto[];
}

export class DebtLinkAccessDto extends DebtLinkDetailDto {
  @ApiProperty()
  token: string;
}

export class DebtLinkPaymentInputDto {
  @ApiPropertyOptional()
  id?: number;

  @ApiProperty()
  paymentDate: Date;

  @ApiProperty({ enum: PPTypePaymentType })
  paymentType: PPTypePaymentType;

  @ApiProperty()
  amount: number;

  @ApiProperty({ type: [Number] })
  duesOfPayIds: number[];
}
