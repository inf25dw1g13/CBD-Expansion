import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Pratos,
  Restaurantes,
} from '../models';
import {PratosRepository} from '../repositories';

export class PratosRestaurantesController {
  constructor(
    @repository(PratosRepository)
    public pratosRepository: PratosRepository,
  ) { }

  @get('/pratos/{id}/restaurantes', {
    responses: {
      '200': {
        description: 'Restaurantes belonging to Pratos',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Restaurantes),
          },
        },
      },
    },
  })
  async getRestaurantes(
    @param.path.number('id') id: typeof Pratos.prototype.id,
  ): Promise<Restaurantes> {
    return this.pratosRepository.prato_restaurante(id);
  }
}
