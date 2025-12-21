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
Pratos,
PratosIngredientes,
Ingredientes,
} from '../models';
import {PratosRepository} from '../repositories';

export class PratosIngredientesController {
  constructor(
    @repository(PratosRepository) protected pratosRepository: PratosRepository,
  ) { }

  @get('/pratos/{id}/ingredientes', {
    responses: {
      '200': {
        description: 'Array of Pratos has many Ingredientes through PratosIngredientes',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Ingredientes)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Ingredientes>,
  ): Promise<Ingredientes[]> {
    return this.pratosRepository.pratos_ingredientes(id).find(filter);
  }

  @post('/pratos/{id}/ingredientes', {
    responses: {
      '200': {
        description: 'create a Ingredientes model instance',
        content: {'application/json': {schema: getModelSchemaRef(Ingredientes)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Pratos.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ingredientes, {
            title: 'NewIngredientesInPratos',
            exclude: ['id'],
          }),
        },
      },
    }) ingredientes: Omit<Ingredientes, 'id'>,
  ): Promise<Ingredientes> {
    return this.pratosRepository.pratos_ingredientes(id).create(ingredientes);
  }

  @patch('/pratos/{id}/ingredientes', {
    responses: {
      '200': {
        description: 'Pratos.Ingredientes PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Ingredientes, {partial: true}),
        },
      },
    })
    ingredientes: Partial<Ingredientes>,
    @param.query.object('where', getWhereSchemaFor(Ingredientes)) where?: Where<Ingredientes>,
  ): Promise<Count> {
    return this.pratosRepository.pratos_ingredientes(id).patch(ingredientes, where);
  }

  @del('/pratos/{id}/ingredientes', {
    responses: {
      '200': {
        description: 'Pratos.Ingredientes DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Ingredientes)) where?: Where<Ingredientes>,
  ): Promise<Count> {
    return this.pratosRepository.pratos_ingredientes(id).delete(where);
  }
}
