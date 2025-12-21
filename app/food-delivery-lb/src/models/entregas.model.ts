import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Pedidos} from './pedidos.model';
import {Entregadores} from './entregadores.model';

@model()
export class Entregas extends Entity {



  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;
  @property({
    type: 'number',
  })
  tempo_estimado_min?: number;

  @property({
    type: 'number',
  })
  tempo_real_min?: number;

  @property({
    type: 'array',
    itemType: 'string',
    default: 'pendente',
  })
  estado?: string[];

  @property({
    type: 'string',
  })
  hora_entrega?: string;

  @belongsTo(() => Pedidos, {name: 'entrega_pedido'})
  pedido_id: number;

  @belongsTo(() => Entregadores, {name: 'entregas_entregadores'})
  entregador_id: number;

  constructor(data?: Partial<Entregas>) {
    super(data);
  }
}

export interface EntregasRelations {
  // describe navigational properties here
}

export type EntregasWithRelations = Entregas & EntregasRelations;
