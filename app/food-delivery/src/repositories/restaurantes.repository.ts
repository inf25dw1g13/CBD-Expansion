import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {FooddbDataSource} from '../datasources';
import {Restaurantes, RestaurantesRelations, CategoriasPratos, Codpostal, Pratos} from '../models';
import {CategoriasPratosRepository} from './categorias-pratos.repository';
import {CodpostalRepository} from './codpostal.repository';
import {PratosRepository} from './pratos.repository';

export class RestaurantesRepository extends DefaultCrudRepository<
  Restaurantes,
  typeof Restaurantes.prototype.id,
  RestaurantesRelations
> {

  public readonly especialidade: BelongsToAccessor<CategoriasPratos, typeof Restaurantes.prototype.id>;

  public readonly codigopostal: BelongsToAccessor<Codpostal, typeof Restaurantes.prototype.id>;

  public readonly restaurante_pratos: HasManyRepositoryFactory<Pratos, typeof Restaurantes.prototype.id>;

  constructor(
    @inject('datasources.fooddb') dataSource: FooddbDataSource, @repository.getter('CategoriasPratosRepository') protected categoriasPratosRepositoryGetter: Getter<CategoriasPratosRepository>, @repository.getter('CodpostalRepository') protected codpostalRepositoryGetter: Getter<CodpostalRepository>, @repository.getter('PratosRepository') protected pratosRepositoryGetter: Getter<PratosRepository>,
  ) {
    super(Restaurantes, dataSource);
    this.restaurante_pratos = this.createHasManyRepositoryFactoryFor('restaurante_pratos', pratosRepositoryGetter,);
    this.registerInclusionResolver('restaurante_pratos', this.restaurante_pratos.inclusionResolver);
    this.codigopostal = this.createBelongsToAccessorFor('codigopostal', codpostalRepositoryGetter,);
    this.registerInclusionResolver('codigopostal', this.codigopostal.inclusionResolver);
    this.especialidade = this.createBelongsToAccessorFor('especialidade', categoriasPratosRepositoryGetter,);
    this.registerInclusionResolver('especialidade', this.especialidade.inclusionResolver);
  }
}
