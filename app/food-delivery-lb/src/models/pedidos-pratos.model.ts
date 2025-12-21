import {Entity, model, property} from '@loopback/repository';

@model()
export class PedidosPratos extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    required: true,
  })
  pedido_id: number;

  @property({
    type: 'number',
    required: true,
  })
  prato_id: number;

  @property({
    type: 'number',
    default: 1,
  })
  quantidade?: number;


  constructor(data?: Partial<PedidosPratos>) {
    super(data);
  }
}

export interface PedidosPratosRelations {
  // describe navigational properties here
}

export type PedidosPratosWithRelations = PedidosPratos & PedidosPratosRelations;
