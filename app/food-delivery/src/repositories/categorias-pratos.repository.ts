import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FooddbDataSource} from '../datasources';
import {CategoriasPratos, CategoriasPratosRelations} from '../models';

export class CategoriasPratosRepository extends DefaultCrudRepository<
  CategoriasPratos,
  typeof CategoriasPratos.prototype.id,
  CategoriasPratosRelations
> {
  constructor(
    @inject('datasources.fooddb') dataSource: FooddbDataSource,
  ) {
    super(CategoriasPratos, dataSource);
  }
}
