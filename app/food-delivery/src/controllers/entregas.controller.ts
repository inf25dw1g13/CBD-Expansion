import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Entregas} from '../models';
import {EntregasRepository} from '../repositories';

export class EntregasController {
  constructor(
    @repository(EntregasRepository)
    public entregasRepository : EntregasRepository,
  ) {}

  @post('/entregas')
  @response(200, {
    description: 'Entregas model instance',
    content: {'application/json': {schema: getModelSchemaRef(Entregas)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Entregas, {
            title: 'NewEntregas',
            exclude: ['id'],
          }),
        },
      },
    })
    entregas: Omit<Entregas, 'id'>,
  ): Promise<Entregas> {
    return this.entregasRepository.create(entregas);
  }

  @get('/entregas/count')
  @response(200, {
    description: 'Entregas model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Entregas) where?: Where<Entregas>,
  ): Promise<Count> {
    return this.entregasRepository.count(where);
  }

  @get('/entregas')
  @response(200, {
    description: 'Array of Entregas model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Entregas, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Entregas) filter?: Filter<Entregas>,
  ): Promise<Entregas[]> {
    return this.entregasRepository.find(filter);
  }

  @patch('/entregas')
  @response(200, {
    description: 'Entregas PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Entregas, {partial: true}),
        },
      },
    })
    entregas: Entregas,
    @param.where(Entregas) where?: Where<Entregas>,
  ): Promise<Count> {
    return this.entregasRepository.updateAll(entregas, where);
  }

  @get('/entregas/{id}')
  @response(200, {
    description: 'Entregas model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Entregas, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Entregas, {exclude: 'where'}) filter?: FilterExcludingWhere<Entregas>
  ): Promise<Entregas> {
    return this.entregasRepository.findById(id, filter);
  }

  @patch('/entregas/{id}')
  @response(204, {
    description: 'Entregas PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Entregas, {partial: true}),
        },
      },
    })
    entregas: Entregas,
  ): Promise<void> {
    await this.entregasRepository.updateById(id, entregas);
  }

  @put('/entregas/{id}')
  @response(204, {
    description: 'Entregas PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() entregas: Entregas,
  ): Promise<void> {
    await this.entregasRepository.replaceById(id, entregas);
  }

  @del('/entregas/{id}')
  @response(204, {
    description: 'Entregas DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.entregasRepository.deleteById(id);
  }
}
