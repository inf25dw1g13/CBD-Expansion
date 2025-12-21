import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FooddbDataSource} from '../datasources';
import {PratosIngredientes, PratosIngredientesRelations} from '../models';

export class PratosIngredientesRepository extends DefaultCrudRepository<
  PratosIngredientes,
  typeof PratosIngredientes.prototype.prato_id,
  PratosIngredientesRelations
> {
  constructor(
    @inject('datasources.fooddb') dataSource: FooddbDataSource,
  ) {
    super(PratosIngredientes, dataSource);
  }
}
