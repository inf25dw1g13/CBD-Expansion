import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FooddbDataSource} from '../datasources';
import {PedidosPratos, PedidosPratosRelations} from '../models';

export class PedidosPratosRepository extends DefaultCrudRepository<
  PedidosPratos,
  typeof PedidosPratos.prototype.pedido_id,
  PedidosPratosRelations
> {
  constructor(
    @inject('datasources.fooddb') dataSource: FooddbDataSource,
  ) {
    super(PedidosPratos, dataSource);
  }
}
