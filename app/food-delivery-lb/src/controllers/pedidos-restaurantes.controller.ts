import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Pedidos,
  Restaurantes,
} from '../models';
import {PedidosRepository} from '../repositories';

export class PedidosRestaurantesController {
  constructor(
    @repository(PedidosRepository)
    public pedidosRepository: PedidosRepository,
  ) { }

  @get('/pedidos/{id}/restaurantes', {
    responses: {
      '200': {
        description: 'Restaurantes belonging to Pedidos',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Restaurantes),
          },
        },
      },
    },
  })
  async getRestaurantes(
    @param.path.number('id') id: typeof Pedidos.prototype.id,
  ): Promise<Restaurantes> {
    return this.pedidosRepository.pedido_restaurante(id);
  }
}
