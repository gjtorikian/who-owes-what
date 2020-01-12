export interface Dependent {
  name: string;
  url: string;
}

export interface Package {
  name: string;
  dependents: Dependent[];
}
