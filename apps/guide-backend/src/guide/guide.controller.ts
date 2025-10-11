import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { GuideService } from './guide.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Guides')
@Controller('api/guides')
export class GuideController {
  constructor(private readonly guideService: GuideService) {}

  @Get()
  @ApiOperation({ summary: 'Get all guides' })
  @ApiResponse({ status: 200, description: 'Return all guides.' })
  getAll() {
    return this.guideService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get guide by id' })
  @ApiResponse({ status: 200, description: 'Return a guide with steps and tips.' })
  getOne(@Param('id') id: string) {
    return this.guideService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a guide' })
  @ApiResponse({ status: 201, description: 'Guide created successfully.' })
  create(@Body() body: any) {
    return this.guideService.create(body);
  }

  @Post(':id/steps')
  @ApiOperation({ summary: 'Add a step to a guide (with optional photo)' })
  @ApiResponse({ status: 201, description: 'Step added successfully.' })
  addStep(@Param('id') id: string, @Body() body: any) {
    return this.guideService.addStep(id, body);
  }

  @Post('steps/:stepId/tips')
  @ApiOperation({ summary: 'Add a tip to a step' })
  addTip(@Param('stepId') stepId: string, @Body() body: any) {
    return this.guideService.addTip(stepId, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing guide' })
  @ApiResponse({ status: 200, description: 'Guide updated successfully.' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.guideService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a guide' })
  @ApiResponse({ status: 200, description: 'Guide deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.guideService.remove(id);
  }

}
