import {Entity, model, property} from '@loopback/repository';

@model()
export class Ingredientes extends Entity {
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
  tipo: string;

  @property({
    type: 'boolean',
    default: false,
  })
  alergeno?: boolean;


  constructor(data?: Partial<Ingredientes>) {
    super(data);
  }
}

export interface IngredientesRelations {
  // describe navigational properties here
}

export type IngredientesWithRelations = Ingredientes & IngredientesRelations;
