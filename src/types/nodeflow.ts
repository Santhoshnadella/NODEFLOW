import { Edge, Node } from '@xyflow/react';

export interface NodeFlowProject {
  id: string;
  name: string;
  version: string;
  nodes: Node<any>[];
  edges: Edge<any>[];

  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    description?: string;
  };
}

export type PortType = 'tensor' | 'image' | 'text' | 'number' | 'audio' | 'boolean' | 'dataframe' | 'model' | 'any';

export interface NodeMetadata {
  category: string;
  difficulty: 'Kid' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Research';
  tags: string[];
  description: string;
  analogies: {
    kid: string;
    student: string;
    dev: string;
  };
}
