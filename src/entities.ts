export interface Dependent {
  name: string;
  url: string;
}

export interface Package {
  name: string;
  type: string;
  source: string;
  dependents: Dependent[];
}
