import {Entity, model, property, belongsTo, hasOne, hasMany} from '@loopback/repository';
import {Clientes} from './clientes.model';
import {Restaurantes} from './restaurantes.model';
import {Entregas} from './entregas.model';
import {Pratos} from './pratos.model';
import {PedidosPratos} from './pedidos-pratos.model';

@model()
export class Pedidos extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;
  @property({
    type: 'number',
  })
  entregador_id?: number;

  @property({
    type: 'string',
    required: true,
  })
  metodo_pagamento: string;

  @property({
    type: 'array',
    itemType: 'string',
    default: 'pendente',
  })
  estado?: string[];

  @property({
    type: 'string',
  })
  hora_pedido?: string;

  @property({
    type: 'string',
    default: 0,
  })
  total?: string;

  @belongsTo(() => Clientes, {name: 'pedido_cliente'})
  cliente_id: number;

  @belongsTo(() => Restaurantes, {name: 'pedido_restaurante'})
  restaurante_id: number;

  @property({
    type: 'number',
  })
  clientes_id?: number;

  @hasOne(() => Entregas, {keyTo: 'pedido_id'})
  pedido_entrega: Entregas;

  @hasMany(() => Pratos, {through: {model: () => PedidosPratos, keyFrom: 'pedido_id', keyTo: 'prato_id'}})
  pedidos_pratos: Pratos[];

  constructor(data?: Partial<Pedidos>) {
    super(data);
  }
}

export interface PedidosRelations {
  // describe navigational properties here
}

export type PedidosWithRelations = Pedidos & PedidosRelations;
