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
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get('search')
  search(
    @CurrentUser() user: AuthenticatedUser,
    @Query() queryDto: FoodSearchQueryDto,
  ) {
    return this.foodsService.searchFoods(user?.userId, queryDto);
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.foodsService.getCategories();
  }

  @Public()
  @Get('cuisines')
  getCuisines() {
    return this.foodsService.getCuisines();
  }

  @Post('custom')
  createCustomFood(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFoodItemDto,
  ) {
    return this.foodsService.createFood(dto, user.userId, false);
  }

  @Post('global')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  createGlobalFood(@Body() dto: CreateFoodItemDto) {
    return this.foodsService.createFood(dto, null, true);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.foodsService.findOne(id, user?.userId);
  }
}
