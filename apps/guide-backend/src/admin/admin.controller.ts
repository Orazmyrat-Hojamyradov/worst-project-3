// admin.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../user/roles.guard';
import { Roles } from '../user/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';

class AdminDashboardResponse {
  @ApiProperty({ example: 'Welcome, Admin!' })
  message: string;
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin dashboard (Requires role: admin)' }) 
  @ApiResponse({ status: 200,description: 'Admin dashboard data', type: AdminDashboardResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden (not admin)', type: ErrorResponseDto })
  getDashboard() {
    return { message: 'Welcome, Admin!' };
  }
}
