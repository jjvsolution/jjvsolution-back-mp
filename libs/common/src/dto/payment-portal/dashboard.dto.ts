import { ApiProperty } from '@nestjs/swagger';

export class DashboardKpisDto {
  @ApiProperty({ description: 'Suma total del monto de todas las cuotas' })
  totalDebt: number;

  @ApiProperty({ description: 'Suma del monto de cuotas pagadas' })
  totalPaid: number;

  @ApiProperty({ description: 'Suma del monto de cuotas pendientes' })
  totalPending: number;

  @ApiProperty({ description: 'Suma del monto de cuotas vencidas no pagadas' })
  overdueAmount: number;

  @ApiProperty({ description: 'Suma de pagos completados del mes actual' })
  monthlyCollection: number;

  @ApiProperty({ description: 'Cantidad de deudas registradas' })
  debtsCount: number;

  @ApiProperty({ description: 'Cantidad de cuotas registradas' })
  duesCount: number;

  @ApiProperty({ description: 'Cantidad de cuotas vencidas no pagadas' })
  overdueDuesCount: number;
}

export class DashboardCollectionItemDto {
  @ApiProperty({ description: 'Mes de recaudación en formato ISO' })
  month: string;

  @ApiProperty({ description: 'Monto recaudado en el mes' })
  total: number;

  @ApiProperty({ description: 'Cantidad de pagos en el mes' })
  count: number;
}

export class DashboardOverdueDueDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  expirationDate: Date;

  @ApiProperty()
  description: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  TypeOfCurrency: string;

  @ApiProperty()
  paid: boolean;

  @ApiProperty()
  debtsToPayId: number;
}

export class DashboardOverdueDto {
  @ApiProperty({ description: 'Monto total de cuotas vencidas' })
  total: number;

  @ApiProperty({ description: 'Cantidad de cuotas vencidas' })
  count: number;

  @ApiProperty({ type: [DashboardOverdueDueDto] })
  items: DashboardOverdueDueDto[];
}

export class DashboardSummaryDto extends DashboardKpisDto {
  @ApiProperty({ type: [DashboardCollectionItemDto] })
  collection: DashboardCollectionItemDto[];

  @ApiProperty({ description: 'Monto total en morosidad' })
  overdueTotal: number;

  @ApiProperty({ description: 'Cantidad de cuotas en morosidad' })
  overdueCount: number;

  @ApiProperty({ description: 'Fecha de generación del resumen' })
  generatedAt: Date;
}
