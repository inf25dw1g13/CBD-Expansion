import {Entity, model, property, hasMany, belongsTo} from '@loopback/repository';
import {Ingredientes} from './ingredientes.model';
import {PratosIngredientes} from './pratos-ingredientes.model';
import {Restaurantes} from './restaurantes.model';
import {CategoriasPratos} from './categorias-pratos.model';

@model()
export class Pratos extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;
  @property({
    type: 'string',
    required: true,
  })
  nome: string;

  @property({
    type: 'string',
    required: true,
  })
  preco: string;

  @property({
    type: 'string',
  })
  descricao?: string;

  @property({
    type: 'boolean',
    default: true,
  })
  disponivel?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  vegetariano?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  vegan?: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  sem_gluten?: boolean;

  @hasMany(() => Ingredientes, {through: {model: () => PratosIngredientes, keyFrom: 'pratos_id', keyTo: 'ingredientes_id'}})
  pratos_ingredientes: Ingredientes[];

  @belongsTo(() => Restaurantes, {name: 'prato_restaurante'})
  restaurante_id: number;

  @belongsTo(() => CategoriasPratos, {name: 'prato_categoria'})
  categoria_id: number;

  constructor(data?: Partial<Pratos>) {
    super(data);
  }
}

export interface PratosRelations {
  // describe navigational properties here
}

export type PratosWithRelations = Pratos & PratosRelations;
