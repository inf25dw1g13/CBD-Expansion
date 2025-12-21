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
import {Restaurantes} from '../models';
import {RestaurantesRepository} from '../repositories';

export class RestaurantesController {
  constructor(
    @repository(RestaurantesRepository)
    public restaurantesRepository : RestaurantesRepository,
  ) {}

  @post('/restaurantes')
  @response(200, {
    description: 'Restaurantes model instance',
    content: {'application/json': {schema: getModelSchemaRef(Restaurantes)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Restaurantes, {
            title: 'NewRestaurantes',
            exclude: ['id'],
          }),
        },
      },
    })
    restaurantes: Omit<Restaurantes, 'id'>,
  ): Promise<Restaurantes> {
    return this.restaurantesRepository.create(restaurantes);
  }

  @get('/restaurantes/count')
  @response(200, {
    description: 'Restaurantes model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Restaurantes) where?: Where<Restaurantes>,
  ): Promise<Count> {
    return this.restaurantesRepository.count(where);
  }

  @get('/restaurantes')
  @response(200, {
    description: 'Array of Restaurantes model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Restaurantes, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Restaurantes) filter?: Filter<Restaurantes>,
  ): Promise<Restaurantes[]> {
    return this.restaurantesRepository.find(filter);
  }

  @patch('/restaurantes')
  @response(200, {
    description: 'Restaurantes PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Restaurantes, {partial: true}),
        },
      },
    })
    restaurantes: Restaurantes,
    @param.where(Restaurantes) where?: Where<Restaurantes>,
  ): Promise<Count> {
    return this.restaurantesRepository.updateAll(restaurantes, where);
  }

  @get('/restaurantes/{id}')
  @response(200, {
    description: 'Restaurantes model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Restaurantes, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Restaurantes, {exclude: 'where'}) filter?: FilterExcludingWhere<Restaurantes>
  ): Promise<Restaurantes> {
    return this.restaurantesRepository.findById(id, filter);
  }

  @patch('/restaurantes/{id}')
  @response(204, {
    description: 'Restaurantes PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Restaurantes, {partial: true}),
        },
      },
    })
    restaurantes: Restaurantes,
  ): Promise<void> {
    await this.restaurantesRepository.updateById(id, restaurantes);
  }

  @put('/restaurantes/{id}')
  @response(204, {
    description: 'Restaurantes PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() restaurantes: Restaurantes,
  ): Promise<void> {
    await this.restaurantesRepository.replaceById(id, restaurantes);
  }

  @del('/restaurantes/{id}')
  @response(204, {
    description: 'Restaurantes DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.restaurantesRepository.deleteById(id);
  }
}
