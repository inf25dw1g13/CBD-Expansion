import {Entity, model, property} from '@loopback/repository';

@model()
export class Codpostal extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  codpostal: string;

  @property({
    type: 'string',
    required: true,
  })
  localidade: string;

  @property({
    type: 'string',
    required: true,
  })
  cidade: string;


  constructor(data?: Partial<Codpostal>) {
    super(data);
  }
}

export interface CodpostalRelations {
  // describe navigational properties here
}

export type CodpostalWithRelations = Codpostal & CodpostalRelations;
