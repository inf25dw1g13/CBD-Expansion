import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {FooddbDataSource} from '../datasources';
import {Pratos, PratosRelations, Ingredientes, PratosIngredientes, Restaurantes, CategoriasPratos} from '../models';
import {PratosIngredientesRepository} from './pratos-ingredientes.repository';
import {IngredientesRepository} from './ingredientes.repository';
import {RestaurantesRepository} from './restaurantes.repository';
import {CategoriasPratosRepository} from './categorias-pratos.repository';

export class PratosRepository extends DefaultCrudRepository<
  Pratos,
  typeof Pratos.prototype.id,
  PratosRelations
> {

  public readonly pratos_ingredientes: HasManyThroughRepositoryFactory<Ingredientes, typeof Ingredientes.prototype.id,
          PratosIngredientes,
          typeof Pratos.prototype.id
        >;

  public readonly prato_restaurante: BelongsToAccessor<Restaurantes, typeof Pratos.prototype.id>;

  public readonly prato_categoria: BelongsToAccessor<CategoriasPratos, typeof Pratos.prototype.id>;

  constructor(
    @inject('datasources.fooddb') dataSource: FooddbDataSource, @repository.getter('PratosIngredientesRepository') protected pratosIngredientesRepositoryGetter: Getter<PratosIngredientesRepository>, @repository.getter('IngredientesRepository') protected ingredientesRepositoryGetter: Getter<IngredientesRepository>, @repository.getter('RestaurantesRepository') protected restaurantesRepositoryGetter: Getter<RestaurantesRepository>, @repository.getter('CategoriasPratosRepository') protected categoriasPratosRepositoryGetter: Getter<CategoriasPratosRepository>,
  ) {
    super(Pratos, dataSource);
    this.prato_categoria = this.createBelongsToAccessorFor('prato_categoria', categoriasPratosRepositoryGetter,);
    this.registerInclusionResolver('prato_categoria', this.prato_categoria.inclusionResolver);
    this.prato_restaurante = this.createBelongsToAccessorFor('prato_restaurante', restaurantesRepositoryGetter,);
    this.registerInclusionResolver('prato_restaurante', this.prato_restaurante.inclusionResolver);
    this.pratos_ingredientes = this.createHasManyThroughRepositoryFactoryFor('pratos_ingredientes', ingredientesRepositoryGetter, pratosIngredientesRepositoryGetter,);
    this.registerInclusionResolver('pratos_ingredientes', this.pratos_ingredientes.inclusionResolver);
  }
}
