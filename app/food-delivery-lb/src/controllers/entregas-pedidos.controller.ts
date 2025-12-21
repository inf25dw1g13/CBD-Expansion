import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Entregas,
  Pedidos,
} from '../models';
import {EntregasRepository} from '../repositories';

export class EntregasPedidosController {
  constructor(
    @repository(EntregasRepository)
    public entregasRepository: EntregasRepository,
  ) { }

  @get('/entregases/{id}/pedidos', {
    responses: {
      '200': {
        description: 'Pedidos belonging to Entregas',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Pedidos),
          },
        },
      },
    },
  })
  async getPedidos(
    @param.path.number('id') id: typeof Entregas.prototype.id,
  ): Promise<Pedidos> {
    return this.entregasRepository.entrega_pedido(id);
  }
}
