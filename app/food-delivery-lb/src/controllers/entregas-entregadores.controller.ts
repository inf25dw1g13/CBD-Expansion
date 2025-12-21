import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Entregas,
  Entregadores,
} from '../models';
import {EntregasRepository} from '../repositories';

export class EntregasEntregadoresController {
  constructor(
    @repository(EntregasRepository)
    public entregasRepository: EntregasRepository,
  ) { }

  @get('/entregases/{id}/entregadores', {
    responses: {
      '200': {
        description: 'Entregadores belonging to Entregas',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Entregadores),
          },
        },
      },
    },
  })
  async getEntregadores(
    @param.path.number('id') id: typeof Entregas.prototype.id,
  ): Promise<Entregadores> {
    return this.entregasRepository.entregas_entregadores(id);
  }
}
