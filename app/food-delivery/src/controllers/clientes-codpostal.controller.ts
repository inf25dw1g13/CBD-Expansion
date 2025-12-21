import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Clientes,
  Codpostal,
} from '../models';
import {ClientesRepository} from '../repositories';

export class ClientesCodpostalController {
  constructor(
    @repository(ClientesRepository)
    public clientesRepository: ClientesRepository,
  ) { }

  @get('/clientes/{id}/codpostal', {
    responses: {
      '200': {
        description: 'Codpostal belonging to Clientes',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Codpostal),
          },
        },
      },
    },
  })
  async getCodpostal(
    @param.path.number('id') id: typeof Clientes.prototype.id,
  ): Promise<Codpostal> {
    return this.clientesRepository.clientes_codpostal(id);
  }
}
