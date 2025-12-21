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
  Entregadores,
  Entregas,
} from '../models';
import {EntregadoresRepository} from '../repositories';

export class EntregadoresEntregasController {
  constructor(
    @repository(EntregadoresRepository) protected entregadoresRepository: EntregadoresRepository,
  ) { }

  @get('/entregadores/{id}/entregases', {
    responses: {
      '200': {
        description: 'Array of Entregadores has many Entregas',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Entregas)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Entregas>,
  ): Promise<Entregas[]> {
    return this.entregadoresRepository.entregador_entregas(id).find(filter);
  }

  @post('/entregadores/{id}/entregases', {
    responses: {
      '200': {
        description: 'Entregadores model instance',
        content: {'application/json': {schema: getModelSchemaRef(Entregas)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Entregadores.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Entregas, {
            title: 'NewEntregasInEntregadores',
            exclude: ['id'],
            optional: ['entregador_id']
          }),
        },
      },
    }) entregas: Omit<Entregas, 'id'>,
  ): Promise<Entregas> {
    return this.entregadoresRepository.entregador_entregas(id).create(entregas);
  }

  @patch('/entregadores/{id}/entregases', {
    responses: {
      '200': {
        description: 'Entregadores.Entregas PATCH success count',
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
    return this.entregadoresRepository.entregador_entregas(id).patch(entregas, where);
  }

  @del('/entregadores/{id}/entregases', {
    responses: {
      '200': {
        description: 'Entregadores.Entregas DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Entregas)) where?: Where<Entregas>,
  ): Promise<Count> {
    return this.entregadoresRepository.entregador_entregas(id).delete(where);
  }
}
