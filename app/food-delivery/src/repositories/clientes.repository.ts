import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {FooddbDataSource} from '../datasources';
import {Clientes, ClientesRelations, Codpostal, Pedidos} from '../models';
import {CodpostalRepository} from './codpostal.repository';
import {PedidosRepository} from './pedidos.repository';

export class ClientesRepository extends DefaultCrudRepository<
  Clientes,
  typeof Clientes.prototype.id,
  ClientesRelations
> {

  public readonly clientes_codpostal: BelongsToAccessor<Codpostal, typeof Clientes.prototype.id>;

  public readonly cliente_pedidos: HasManyRepositoryFactory<Pedidos, typeof Clientes.prototype.id>;

  constructor(
    @inject('datasources.fooddb') dataSource: FooddbDataSource, @repository.getter('CodpostalRepository') protected codpostalRepositoryGetter: Getter<CodpostalRepository>, @repository.getter('PedidosRepository') protected pedidosRepositoryGetter: Getter<PedidosRepository>,
  ) {
    super(Clientes, dataSource);
    this.cliente_pedidos = this.createHasManyRepositoryFactoryFor('cliente_pedidos', pedidosRepositoryGetter,);
    this.registerInclusionResolver('cliente_pedidos', this.cliente_pedidos.inclusionResolver);
    this.clientes_codpostal = this.createBelongsToAccessorFor('clientes_codpostal', codpostalRepositoryGetter,);
    this.registerInclusionResolver('clientes_codpostal', this.clientes_codpostal.inclusionResolver);
  }
}
