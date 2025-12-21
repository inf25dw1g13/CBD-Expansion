import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {Codpostal} from './codpostal.model';
import {Pedidos} from './pedidos.model';

@model()
export class Clientes extends Entity {
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
    required: true,
  })
  morada: string;

  @belongsTo(() => Codpostal, {name: 'clientes_codpostal'})
  codpostal: string;

  @hasMany(() => Pedidos, {keyTo: 'clientes_id'})
  cliente_pedidos: Pedidos[];

  constructor(data?: Partial<Clientes>) {
    super(data);
  }
}

export interface ClientesRelations {
  // describe navigational properties here
}

export type ClientesWithRelations = Clientes & ClientesRelations;
