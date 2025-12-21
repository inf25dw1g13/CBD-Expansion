import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {CategoriasPratos} from './categorias-pratos.model';
import {Codpostal} from './codpostal.model';
import {Pratos} from './pratos.model';

@model()
export class Restaurantes extends Entity {
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
  morada: string;
  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'string',
  })
  telefone?: string;
  @property({
    type: 'string',
  })
  hora_abertura?: string;

  @property({
    type: 'string',
  })
  hora_fecho?: string;

  @property({
    type: 'string',
    required: true,
  })
  estado: string;

  @property({
    type: 'string',
  })
  descricao?: string;

  @belongsTo(() => CategoriasPratos, {name: 'especialidade'})
  especialidade_id: number;

  @belongsTo(() => Codpostal, {name: 'codigopostal'})
  codpostal: string;

  @hasMany(() => Pratos, {keyTo: 'restaurante_id'})
  restaurante_pratos: Pratos[];

  constructor(data?: Partial<Restaurantes>) {
    super(data);
  }
}

export interface RestaurantesRelations {
  // describe navigational properties here
}

export type RestaurantesWithRelations = Restaurantes & RestaurantesRelations;
