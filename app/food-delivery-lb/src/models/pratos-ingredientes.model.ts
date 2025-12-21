import {Entity, model, property} from '@loopback/repository';

@model()
export class PratosIngredientes extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
    required: true,
  })
  prato_id: number;

  @property({
    type: 'number',
    required: true,
  })
  ingrediente_id: number;

  @property({
    type: 'string',
    default: 0,
  })
  quantidade?: string;

  @property({
    type: 'boolean',
    default: true,
  })
  obrigatorio?: boolean;

  @property({
    type: 'number',
  })
  pratos_id?: number;

  @property({
    type: 'number',
  })
  ingredientes_id?: number;

  constructor(data?: Partial<PratosIngredientes>) {
    super(data);
  }
}

export interface PratosIngredientesRelations {
  // describe navigational properties here
}

export type PratosIngredientesWithRelations = PratosIngredientes & PratosIngredientesRelations;
