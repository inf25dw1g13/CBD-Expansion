import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Pedidos,
  Entregas,
} from '../models';
import {PedidosRepository} from '../repositories';

export class PedidosEntregasController {
  constructor(
    @repository(PedidosRepository) protected pedidosRepository: PedidosRepository,
  ) { }

  @get('/pedidos/{id}/entregas', {
    responses: {
      '200': {
        description: 'Pedidos has one Entregas',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Entregas),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Entregas>,
  ): Promise<Entregas> {
    return this.pedidosRepository.pedido_entrega(id).get(filter);
  }

  @post('/pedidos/{id}/entregas', {
    responses: {
      '200': {
        description: 'Pedidos model instance',
        content: {'application/json': {schema: getModelSchemaRef(Entregas)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Pedidos.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Entregas, {
            title: 'NewEntregasInPedidos',
            exclude: ['id'],
            optional: ['pedido_id']
          }),
        },
      },
    }) entregas: Omit<Entregas, 'id'>,
  ): Promise<Entregas> {
    return this.pedidosRepository.pedido_entrega(id).create(entregas);
  }

  @patch('/pedidos/{id}/entregas', {
    responses: {
      '200': {
        description: 'Pedidos.Entregas PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Entregas, {partial: true}),
        },
      },
    })
    entregas: Partial<Entregas>,
    @param.query.object('where', getWhereSchemaFor(Entregas)) where?: Where<Entregas>,
  ): Promise<Count> {
    return this.pedidosRepository.pedido_entrega(id).patch(entregas, where);
  }

  @del('/pedidos/{id}/entregas', {
    responses: {
      '200': {
        description: 'Pedidos.Entregas DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Entregas)) where?: Where<Entregas>,
  ): Promise<Count> {
    return this.pedidosRepository.pedido_entrega(id).delete(where);
  }
}
