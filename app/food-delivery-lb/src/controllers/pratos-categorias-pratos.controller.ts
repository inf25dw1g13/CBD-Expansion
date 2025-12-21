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
  CategoriasPratos,
} from '../models';
import {PratosRepository} from '../repositories';

export class PratosCategoriasPratosController {
  constructor(
    @repository(PratosRepository)
    public pratosRepository: PratosRepository,
  ) { }

  @get('/pratos/{id}/categorias-pratos', {
    responses: {
      '200': {
        description: 'CategoriasPratos belonging to Pratos',
        content: {
          'application/json': {
            schema: getModelSchemaRef(CategoriasPratos),
          },
        },
      },
    },
  })
  async getCategoriasPratos(
    @param.path.number('id') id: typeof Pratos.prototype.id,
  ): Promise<CategoriasPratos> {
    return this.pratosRepository.prato_categoria(id);
  }
}
