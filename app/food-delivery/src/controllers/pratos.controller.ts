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
import {Pratos} from '../models';
import {PratosRepository} from '../repositories';

export class PratosController {
  constructor(
    @repository(PratosRepository)
    public pratosRepository : PratosRepository,
  ) {}

  @post('/pratos')
  @response(200, {
    description: 'Pratos model instance',
    content: {'application/json': {schema: getModelSchemaRef(Pratos)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pratos, {
            title: 'NewPratos',
            exclude: ['id'],
          }),
        },
      },
    })
    pratos: Omit<Pratos, 'id'>,
  ): Promise<Pratos> {
    return this.pratosRepository.create(pratos);
  }

  @get('/pratos/count')
  @response(200, {
    description: 'Pratos model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Pratos) where?: Where<Pratos>,
  ): Promise<Count> {
    return this.pratosRepository.count(where);
  }

  @get('/pratos')
  @response(200, {
    description: 'Array of Pratos model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Pratos, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Pratos) filter?: Filter<Pratos>,
  ): Promise<Pratos[]> {
    return this.pratosRepository.find(filter);
  }

  @patch('/pratos')
  @response(200, {
    description: 'Pratos PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pratos, {partial: true}),
        },
      },
    })
    pratos: Pratos,
    @param.where(Pratos) where?: Where<Pratos>,
  ): Promise<Count> {
    return this.pratosRepository.updateAll(pratos, where);
  }

  @get('/pratos/{id}')
  @response(200, {
    description: 'Pratos model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Pratos, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Pratos, {exclude: 'where'}) filter?: FilterExcludingWhere<Pratos>
  ): Promise<Pratos> {
    return this.pratosRepository.findById(id, filter);
  }

  @patch('/pratos/{id}')
  @response(204, {
    description: 'Pratos PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pratos, {partial: true}),
        },
      },
    })
    pratos: Pratos,
  ): Promise<void> {
    await this.pratosRepository.updateById(id, pratos);
  }

  @put('/pratos/{id}')
  @response(204, {
    description: 'Pratos PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() pratos: Pratos,
  ): Promise<void> {
    await this.pratosRepository.replaceById(id, pratos);
  }

  @del('/pratos/{id}')
  @response(204, {
    description: 'Pratos DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.pratosRepository.deleteById(id);
  }
}
