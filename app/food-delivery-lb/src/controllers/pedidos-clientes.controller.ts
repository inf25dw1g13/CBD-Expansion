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
  Clientes,
} from '../models';
import {PedidosRepository} from '../repositories';

export class PedidosClientesController {
  constructor(
    @repository(PedidosRepository)
    public pedidosRepository: PedidosRepository,
  ) { }

  @get('/pedidos/{id}/clientes', {
    responses: {
      '200': {
        description: 'Clientes belonging to Pedidos',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Clientes),
          },
        },
      },
    },
  })
  async getClientes(
    @param.path.number('id') id: typeof Pedidos.prototype.id,
  ): Promise<Clientes> {
    return this.pedidosRepository.pedido_cliente(id);
  }
}
