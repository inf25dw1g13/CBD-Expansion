import {Entity, model, property} from '@loopback/repository';

@model()
export class CategoriasPratos extends Entity {
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


  constructor(data?: Partial<CategoriasPratos>) {
    super(data);
  }
}

export interface CategoriasPratosRelations {
  // describe navigational properties here
}

export type CategoriasPratosWithRelations = CategoriasPratos & CategoriasPratosRelations;
