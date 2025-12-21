import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasOneRepositoryFactory, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {FooddbDataSource} from '../datasources';
import {Pedidos, PedidosRelations, Clientes, Restaurantes, Entregas, Pratos, PedidosPratos} from '../models';
import {ClientesRepository} from './clientes.repository';
import {RestaurantesRepository} from './restaurantes.repository';
import {EntregasRepository} from './entregas.repository';
import {PedidosPratosRepository} from './pedidos-pratos.repository';
import {PratosRepository} from './pratos.repository';

export class PedidosRepository extends DefaultCrudRepository<
  Pedidos,
  typeof Pedidos.prototype.id,
  PedidosRelations
> {

  public readonly pedido_cliente: BelongsToAccessor<Clientes, typeof Pedidos.prototype.id>;

  public readonly pedido_restaurante: BelongsToAccessor<Restaurantes, typeof Pedidos.prototype.id>;

  public readonly pedido_entrega: HasOneRepositoryFactory<Entregas, typeof Pedidos.prototype.id>;

  public readonly pedidos_pratos: HasManyThroughRepositoryFactory<Pratos, typeof Pratos.prototype.id,
          PedidosPratos,
          typeof Pedidos.prototype.id
        >;

  constructor(
    @inject('datasources.fooddb') dataSource: FooddbDataSource, @repository.getter('ClientesRepository') protected clientesRepositoryGetter: Getter<ClientesRepository>, @repository.getter('RestaurantesRepository') protected restaurantesRepositoryGetter: Getter<RestaurantesRepository>, @repository.getter('EntregasRepository') protected entregasRepositoryGetter: Getter<EntregasRepository>, @repository.getter('PedidosPratosRepository') protected pedidosPratosRepositoryGetter: Getter<PedidosPratosRepository>, @repository.getter('PratosRepository') protected pratosRepositoryGetter: Getter<PratosRepository>,
  ) {
    super(Pedidos, dataSource);
    this.pedidos_pratos = this.createHasManyThroughRepositoryFactoryFor('pedidos_pratos', pratosRepositoryGetter, pedidosPratosRepositoryGetter,);
    this.registerInclusionResolver('pedidos_pratos', this.pedidos_pratos.inclusionResolver);
    this.pedido_entrega = this.createHasOneRepositoryFactoryFor('pedido_entrega', entregasRepositoryGetter);
    this.registerInclusionResolver('pedido_entrega', this.pedido_entrega.inclusionResolver);
    this.pedido_restaurante = this.createBelongsToAccessorFor('pedido_restaurante', restaurantesRepositoryGetter,);
    this.registerInclusionResolver('pedido_restaurante', this.pedido_restaurante.inclusionResolver);
    this.pedido_cliente = this.createBelongsToAccessorFor('pedido_cliente', clientesRepositoryGetter,);
    this.registerInclusionResolver('pedido_cliente', this.pedido_cliente.inclusionResolver);
  }
}
