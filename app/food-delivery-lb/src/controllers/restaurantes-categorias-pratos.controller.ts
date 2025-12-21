import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Restaurantes,
  CategoriasPratos,
} from '../models';
import {RestaurantesRepository} from '../repositories';

export class RestaurantesCategoriasPratosController {
  constructor(
    @repository(RestaurantesRepository)
    public restaurantesRepository: RestaurantesRepository,
  ) { }

  @get('/restaurantes/{id}/categorias-pratos', {
    responses: {
      '200': {
        description: 'CategoriasPratos belonging to Restaurantes',
        content: {
          'application/json': {
            schema: getModelSchemaRef(CategoriasPratos),
          },
        },
      },
    },
  })
  async getCategoriasPratos(
    @param.path.number('id') id: typeof Restaurantes.prototype.id,
  ): Promise<CategoriasPratos> {
    return this.restaurantesRepository.especialidade(id);
  }
}
