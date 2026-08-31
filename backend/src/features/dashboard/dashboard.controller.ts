import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { FindReportDto } from './dto/find-report-dto';
import { ReportResponseDto } from './dto/report-response.dto';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna os indicadores do dashboard principal' })
  @ApiResponse({
    status: 200,
    description: 'Indicadores retornados com sucesso',
    type: DashboardResponseDto,
  })
  @Get()
  getDashboard() {
    return this.dashboardService.getDashboard();
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Retorna os indicadores do relatório (clientes, mídias e reproduções no período)',
  })
  @ApiResponse({
    status: 200,
    description: 'Indicadores retornados com sucesso',
    type: ReportResponseDto,
  })
  @Get('report')
  getReport(@Query() query: FindReportDto) {
    return this.dashboardService.getReport(query);
  }
}
