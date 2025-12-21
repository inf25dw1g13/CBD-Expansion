import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FooddbDataSource} from '../datasources';
import {Codpostal, CodpostalRelations} from '../models';

export class CodpostalRepository extends DefaultCrudRepository<
  Codpostal,
  typeof Codpostal.prototype.codpostal,
  CodpostalRelations
> {
  constructor(
    @inject('datasources.fooddb') dataSource: FooddbDataSource,
  ) {
    super(Codpostal, dataSource);
  }
}
