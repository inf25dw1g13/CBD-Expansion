import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Entregadores,
  Codpostal,
} from '../models';
import {EntregadoresRepository} from '../repositories';

export class EntregadoresCodpostalController {
  constructor(
    @repository(EntregadoresRepository)
    public entregadoresRepository: EntregadoresRepository,
  ) { }

  @get('/entregadores/{id}/codpostal', {
    responses: {
      '200': {
        description: 'Codpostal belonging to Entregadores',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Codpostal),
          },
        },
      },
    },
  })
  async getCodpostal(
    @param.path.number('id') id: typeof Entregadores.prototype.id,
  ): Promise<Codpostal> {
    return this.entregadoresRepository.codpostal_entregadores(id);
  }
}
