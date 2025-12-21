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
import {Ingredientes} from '../models';
import {IngredientesRepository} from '../repositories';

export class IngredientesController {
  constructor(
    @repository(IngredientesRepository)
    public ingredientesRepository : IngredientesRepository,
  ) {}

  @post('/ingredientes')
  @response(200, {
    description: 'Ingredientes model instance',
    content: {'application/json': {schema: getModelSchemaRef(Ingredientes)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ingredientes, {
            title: 'NewIngredientes',
            exclude: ['id'],
          }),
        },
      },
    })
    ingredientes: Omit<Ingredientes, 'id'>,
  ): Promise<Ingredientes> {
    return this.ingredientesRepository.create(ingredientes);
  }

  @get('/ingredientes/count')
  @response(200, {
    description: 'Ingredientes model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Ingredientes) where?: Where<Ingredientes>,
  ): Promise<Count> {
    return this.ingredientesRepository.count(where);
  }

  @get('/ingredientes')
  @response(200, {
    description: 'Array of Ingredientes model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Ingredientes, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Ingredientes) filter?: Filter<Ingredientes>,
  ): Promise<Ingredientes[]> {
    return this.ingredientesRepository.find(filter);
  }

  @patch('/ingredientes')
  @response(200, {
    description: 'Ingredientes PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ingredientes, {partial: true}),
        },
      },
    })
    ingredientes: Ingredientes,
    @param.where(Ingredientes) where?: Where<Ingredientes>,
  ): Promise<Count> {
    return this.ingredientesRepository.updateAll(ingredientes, where);
  }

  @get('/ingredientes/{id}')
  @response(200, {
    description: 'Ingredientes model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Ingredientes, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Ingredientes, {exclude: 'where'}) filter?: FilterExcludingWhere<Ingredientes>
  ): Promise<Ingredientes> {
    return this.ingredientesRepository.findById(id, filter);
  }

  @patch('/ingredientes/{id}')
  @response(204, {
    description: 'Ingredientes PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ingredientes, {partial: true}),
        },
      },
    })
    ingredientes: Ingredientes,
  ): Promise<void> {
    await this.ingredientesRepository.updateById(id, ingredientes);
  }

  @put('/ingredientes/{id}')
  @response(204, {
    description: 'Ingredientes PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() ingredientes: Ingredientes,
  ): Promise<void> {
    await this.ingredientesRepository.replaceById(id, ingredientes);
  }

  @del('/ingredientes/{id}')
  @response(204, {
    description: 'Ingredientes DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.ingredientesRepository.deleteById(id);
  }
}
