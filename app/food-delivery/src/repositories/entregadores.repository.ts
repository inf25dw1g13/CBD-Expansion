import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {FooddbDataSource} from '../datasources';
import {Entregadores, EntregadoresRelations, Codpostal, Entregas} from '../models';
import {CodpostalRepository} from './codpostal.repository';
import {EntregasRepository} from './entregas.repository';

export class EntregadoresRepository extends DefaultCrudRepository<
  Entregadores,
  typeof Entregadores.prototype.id,
  EntregadoresRelations
> {

  public readonly codpostal_entregadores: BelongsToAccessor<Codpostal, typeof Entregadores.prototype.id>;

  public readonly entregador_entregas: HasManyRepositoryFactory<Entregas, typeof Entregadores.prototype.id>;

  constructor(
    @inject('datasources.fooddb') dataSource: FooddbDataSource, @repository.getter('CodpostalRepository') protected codpostalRepositoryGetter: Getter<CodpostalRepository>, @repository.getter('EntregasRepository') protected entregasRepositoryGetter: Getter<EntregasRepository>,
  ) {
    super(Entregadores, dataSource);
    this.entregador_entregas = this.createHasManyRepositoryFactoryFor('entregador_entregas', entregasRepositoryGetter,);
    this.registerInclusionResolver('entregador_entregas', this.entregador_entregas.inclusionResolver);
    this.codpostal_entregadores = this.createBelongsToAccessorFor('codpostal_entregadores', codpostalRepositoryGetter,);
    this.registerInclusionResolver('codpostal_entregadores', this.codpostal_entregadores.inclusionResolver);
  }
}
