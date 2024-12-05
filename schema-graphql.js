import { gql } from 'apollo-server';


export const typeDefs = gql`
  scalar Date

  type Query {
    cars: [Car!]!
    carsfilter(filter: CarFilterInput, sort: CarSortInput, pagination: PaginationInput): [Car!]!
    car(id: Int!): Car
    engines: [Engine!]!
    engine(id: Int!): Engine
    manufacturers: [Manufacturer!]!
    manufacturer(id: Int!): Manufacturer
  }

  type Mutation {
    addCar(input: CarInput!): Car
    updateCar(id: Int!, input: CarInput!): Car
    deleteCar(id: Int!): Car
    addEngine(input: EngineInput!): Engine
    updateEngine(id: Int!, input: EngineInput!): Engine
    deleteEngine(id: Int!): Engine
    addManufacturer(input: ManufacturerInput!): Manufacturer
    updateManufacturer(id: Int!, input: ManufacturerInput!): Manufacturer
    deleteManufacturer(id: Int!): Manufacturer
  }
  
  
  input CarInput {
    mark: String!
    age: Int!
    color: String!
    productionDate: Date!
    engineId: Int!
  }

  input EngineInput {
    horsepower: Int!
    fuelType: String!
    capacity: Float!
    cylinders: Int!
    manufacturerId: Int!
  }

  input ManufacturerInput {
    name: String!
    country: String!
  }

  type Car {
    id: Int!
    mark: String!
    age: Int!
    color: String!
    productionDate: Date!
    engine: Engine
  }

  type Engine {
    id: Int!
    horsepower: Int!
    fuelType: String!
    capacity: Float!
    cylinders: Int!
    manufacturer: Manufacturer
  }

  type Manufacturer {
    id: Int!
    name: String!
    country: String!
  }

  input CarFilterInput {
    mark: String
    color: String
    minAge: Int
    maxAge: Int
  }

  input CarSortInput {
    field: String!
    order: SortOrder!
  }

  input PaginationInput {
    limit: Int!
    offset: Int!
  }

  enum SortOrder {
    ASC
    DESC
  }
`;
