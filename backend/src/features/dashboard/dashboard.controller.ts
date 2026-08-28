import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

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
}
