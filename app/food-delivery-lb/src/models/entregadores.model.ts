import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {Codpostal} from './codpostal.model';
import {Entregas} from './entregas.model';

@model()
export class Entregadores extends Entity {
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
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  telefone: string;
  @property({
    type: 'string',
    default: 'disponivel',
  })
  estado?: string;

  @belongsTo(() => Codpostal, {name: 'codpostal_entregadores'})
  codpostal: string;

  @hasMany(() => Entregas, {keyTo: 'entregador_id'})
  entregador_entregas: Entregas[];

  constructor(data?: Partial<Entregadores>) {
    super(data);
  }
}

export interface EntregadoresRelations {
  // describe navigational properties here
}

export type EntregadoresWithRelations = Entregadores & EntregadoresRelations;
