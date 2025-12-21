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
  Codpostal,
} from '../models';
import {RestaurantesRepository} from '../repositories';

export class RestaurantesCodpostalController {
  constructor(
    @repository(RestaurantesRepository)
    public restaurantesRepository: RestaurantesRepository,
  ) { }

  @get('/restaurantes/{id}/codpostal', {
    responses: {
      '200': {
        description: 'Codpostal belonging to Restaurantes',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Codpostal),
          },
        },
      },
    },
  })
  async getCodpostal(
    @param.path.number('id') id: typeof Restaurantes.prototype.id,
  ): Promise<Codpostal> {
    return this.restaurantesRepository.codigopostal(id);
  }
}
