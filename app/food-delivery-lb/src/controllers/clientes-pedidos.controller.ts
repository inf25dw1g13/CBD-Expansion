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
  Clientes,
  Pedidos,
} from '../models';
import {ClientesRepository} from '../repositories';

export class ClientesPedidosController {
  constructor(
    @repository(ClientesRepository) protected clientesRepository: ClientesRepository,
  ) { }

  @get('/clientes/{id}/pedidos', {
    responses: {
      '200': {
        description: 'Array of Clientes has many Pedidos',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Pedidos)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Pedidos>,
  ): Promise<Pedidos[]> {
    return this.clientesRepository.cliente_pedidos(id).find(filter);
  }

  @post('/clientes/{id}/pedidos', {
    responses: {
      '200': {
        description: 'Clientes model instance',
        content: {'application/json': {schema: getModelSchemaRef(Pedidos)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Clientes.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pedidos, {
            title: 'NewPedidosInClientes',
            exclude: ['id'],
            optional: ['clientes_id']
          }),
        },
      },
    }) pedidos: Omit<Pedidos, 'id'>,
  ): Promise<Pedidos> {
    return this.clientesRepository.cliente_pedidos(id).create(pedidos);
  }

  @patch('/clientes/{id}/pedidos', {
    responses: {
      '200': {
        description: 'Clientes.Pedidos PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pedidos, {partial: true}),
        },
      },
    })
    pedidos: Partial<Pedidos>,
    @param.query.object('where', getWhereSchemaFor(Pedidos)) where?: Where<Pedidos>,
  ): Promise<Count> {
    return this.clientesRepository.cliente_pedidos(id).patch(pedidos, where);
  }

  @del('/clientes/{id}/pedidos', {
    responses: {
      '200': {
        description: 'Clientes.Pedidos DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Pedidos)) where?: Where<Pedidos>,
  ): Promise<Count> {
    return this.clientesRepository.cliente_pedidos(id).delete(where);
  }
}
