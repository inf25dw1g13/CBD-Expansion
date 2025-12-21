import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FooddbDataSource} from '../datasources';
import {Ingredientes, IngredientesRelations} from '../models';

export class IngredientesRepository extends DefaultCrudRepository<
  Ingredientes,
  typeof Ingredientes.prototype.id,
  IngredientesRelations
> {
  constructor(
    @inject('datasources.fooddb') dataSource: FooddbDataSource,
  ) {
    super(Ingredientes, dataSource);
  }
}
