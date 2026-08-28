import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FoodsService } from './foods.service';
import { CreateFoodItemDto, FoodSearchQueryDto } from './dto/food.dto';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  /**
   * Search food items across global database and tenant-specific items
   */
  @Get('search')
  search(
    @CurrentTenant() tenantId: string,
    @Query() queryDto: FoodSearchQueryDto,
  ) {
    return this.foodsService.searchFoods(tenantId, queryDto);
  }

  /**
   * Get all food categories
   */
  @Public()
  @Get('categories')
  getCategories() {
    return this.foodsService.getCategories();
  }

  /**
   * Get all supported cuisines
   */
  @Public()
  @Get('cuisines')
  getCuisines() {
    return this.foodsService.getCuisines();
  }

  /**
   * Create custom food item (Tenant-scoped)
   */
  @Post('custom')
  createCustomFood(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFoodItemDto,
  ) {
    return this.foodsService.createFood(dto, tenantId, user.userId, false);
  }

  /**
   * Create global food item (Super Admin only)
   */
  @Post('global')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  createGlobalFood(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFoodItemDto,
  ) {
    return this.foodsService.createFood(dto, null, user.userId, true);
  }

  /**
   * Get single food item
   */
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.foodsService.findOne(id, tenantId);
  }
}
