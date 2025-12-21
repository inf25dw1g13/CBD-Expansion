import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {FooddbDataSource} from '../datasources';
import {Entregas, EntregasRelations, Pedidos, Entregadores} from '../models';
import {PedidosRepository} from './pedidos.repository';
import {EntregadoresRepository} from './entregadores.repository';

export class EntregasRepository extends DefaultCrudRepository<
  Entregas,
  typeof Entregas.prototype.id,
  EntregasRelations
> {

  public readonly entrega_pedido: BelongsToAccessor<Pedidos, typeof Entregas.prototype.id>;

  public readonly entregas_entregadores: BelongsToAccessor<Entregadores, typeof Entregas.prototype.id>;

  constructor(
    @inject('datasources.fooddb') dataSource: FooddbDataSource, @repository.getter('PedidosRepository') protected pedidosRepositoryGetter: Getter<PedidosRepository>, @repository.getter('EntregadoresRepository') protected entregadoresRepositoryGetter: Getter<EntregadoresRepository>,
  ) {
    super(Entregas, dataSource);
    this.entregas_entregadores = this.createBelongsToAccessorFor('entregas_entregadores', entregadoresRepositoryGetter,);
    this.registerInclusionResolver('entregas_entregadores', this.entregas_entregadores.inclusionResolver);
    this.entrega_pedido = this.createBelongsToAccessorFor('entrega_pedido', pedidosRepositoryGetter,);
    this.registerInclusionResolver('entrega_pedido', this.entrega_pedido.inclusionResolver);
  }
}
