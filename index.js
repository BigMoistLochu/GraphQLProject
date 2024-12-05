import { ApolloServer, gql } from 'apollo-server';
import { GraphQLScalarType, Kind } from 'graphql';
import { cars } from './fakedatabase/cars-data.js';
import { engines } from './fakedatabase/engine-data.js';
import { manufacturers } from './fakedatabase/manufacturer-data.js';
import { typeDefs } from './schema-graphql.js';

const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Customowy Scalar',
  
  // Parsowanie wartości z klienta do formatu Date
  parseValue(value) {
    const parsedDate = new Date(value);
    if (isNaN(parsedDate)) {
      throw new Error("Invalid Date format");
    }
    return parsedDate; // Zwracamy obiekt Date
  },

  // Serializacja obiektu Date na format ISO
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString(); // Zwracamy datę w formacie ISO
    }
    throw new Error("Invalid Date object");
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const parsedDate = new Date(ast.value);
      if (isNaN(parsedDate)) {
        throw new Error("Invalid Date format");
      }
      return parsedDate; // zwraca w formacie Date
    }
    return null; // null jesli nie poprawne
  }
});

// Resolver
const resolvers = {
  Date: DateScalar, // zdefiniowany scalar<<

  Query: {
    cars: () => cars,
    car: (_, { id }) => cars.find((car) => car.id === id),
    carsfilter: (_, { filter, sort, pagination }) => {
      let result = cars;

      // filtrowanie za pomoca sprawdzania podciagu znakow
      if (filter) {
        if (filter.mark) {
          result = result.filter(car => car.mark.toLowerCase().includes(filter.mark.toLowerCase()));
        }
        if (filter.color) {
          result = result.filter(car => car.color.toLowerCase().includes(filter.color.toLowerCase()));
        }
        if (filter.minAge !== undefined) {
          result = result.filter(car => car.age >= filter.minAge);
        }
        if (filter.maxAge !== undefined) {
          result = result.filter(car => car.age <= filter.maxAge);
        }
      }

      // sortowanie elementow rosnoca 
      if (sort) {
        const { field, order } = sort;
        result = result.sort((a, b) => {
          if (a[field] < b[field]) return order === 'ASC' ? -1 : 1;
          if (a[field] > b[field]) return order === 'ASC' ? 1 : -1;
          return 0;
        });
      }

      // Paginacja
      if (pagination) {
        const { limit, offset } = pagination;
        result = result.slice(offset, offset + limit);
      }

      return result;
    },
    engines: () => engines,
    engine: (_, { id }) => engines.find((engine) => engine.id === id),
    manufacturers: () => manufacturers,
    manufacturer: (_, { id }) => manufacturers.find((manufacturer) => manufacturer.id === id)
  },

  Mutation: {
    addCar: (_, { input }) => {
      const { mark, age, color, productionDate, engineId } = input;

      const engine = engines.find((engine) => engine.id === engineId);

      if (!engine) {
        throw new Error('Engine not found');
      }
      const carId = cars.length + 1;

      const newCar = {
        id: carId,
        mark,
        age,
        color,
        productionDate: new Date(productionDate),
        engine 
      };

      cars.push(newCar);
      return newCar;
    },
    addEngine: (_, { input }) => {
      const { horsepower, fuelType, capacity, cylinders, manufacturerId } = input;
      const manufacturer = manufacturers.find((manufacturer) => manufacturer.id === manufacturerId);
      const engineId = engines.length + 1;

      const newEngine = {
        id: engineId,
        horsepower,
        fuelType,
        capacity,
        cylinders,
        manufacturer
      };

      engines.push(newEngine);
      return newEngine;
    },
    addManufacturer: (_, { input }) => {
      const { name, country} = input;
      const manufacturerId = manufacturers.length + 1;

      const newManufacturer = {
        id: manufacturerId,
        name,
        country
      };

      manufacturers.push(newManufacturer);
      return newManufacturer;
    },
    updateCar: (_, { id, input }) => {
    
      const carIndex = cars.findIndex(car => car.id === id);
      if (carIndex === -1) {
        throw new Error(`Car with ID ${id} not found`);
      }

      // aktualizuj
      const updatedCar = {
        ...cars[carIndex],
        ...input,
        engine: input.engineId ? engines.find(engine => engine.id === input.engineId) : cars[carIndex].engine
      };

      if (!updatedCar.engine) {
        throw new Error(`Engine with ID ${input.engineId} not found`);
      }

      
      cars[carIndex] = updatedCar;

      return updatedCar;
    },
    updateEngine: (_, { id, input }) => {
      const engineIndex = engines.findIndex(engine => engine.id === id);
      if (engineIndex === -1) {
        throw new Error(`Engine with ID ${id} not found`);
      }
    
      
      const updatedEngine = {
        ...engines[engineIndex],
        ...input,
        manufacturer: input.manufacturerId 
          ? manufacturers.find(manufacturer => manufacturer.id === input.manufacturerId)
          : engines[engineIndex].manufacturer
      };
    
      if (!updatedEngine.manufacturer) {
        throw new Error(`Manufacturer with ID ${input.manufacturerId} not found`);
      }
    
      
      engines[engineIndex] = updatedEngine;
    
      return updatedEngine;
    },
    updateManufacturer: (_, { id, input }) => {
      const manufacturerIndex = manufacturers.findIndex(manufacturer => manufacturer.id === id);
      if (manufacturerIndex === -1) {
        throw new Error(`Manufacturer with ID ${id} not found`);
      }
    
      
      const updatedManufacturer = {
        ...manufacturers[manufacturerIndex],
        ...input
      };
    
      
      manufacturers[manufacturerIndex] = updatedManufacturer;
    
      return updatedManufacturer;
    },
    deleteCar: (_, { id }) => {
      const carIndex = cars.findIndex(car => car.id === id);
      if (carIndex === -1) {
        throw new Error(`Car with ID ${id} not found`);
      }
    
      const deletedCar = cars[carIndex];
    
      // usun samochód z tablicy
      cars.splice(carIndex, 1);
    
      return deletedCar;
    },
    deleteEngine: (_, { id }) => {
      const engineIndex = engines.findIndex(engine => engine.id === id);
      if (engineIndex === -1) {
        throw new Error(`Engine with ID ${id} not found`);
      }
    
      const deletedEngine = engines[engineIndex];
    
      // usun silnik z tablicy
      engines.splice(engineIndex, 1);
    
      return deletedEngine;
    },
    deleteManufacturer: (_, { id }) => {
      const manufacturerIndex = manufacturers.findIndex(manufacturer => manufacturer.id === id);
      if (manufacturerIndex === -1) {
        throw new Error(`Manufacturer with ID ${id} not found`);
      }
    
      const deletedManufacturer = manufacturers[manufacturerIndex];
    
      //usun producenta z tablicy
      manufacturers.splice(manufacturerIndex, 1);
    
      return deletedManufacturer;
    }
    
    
  },
};


const server = new ApolloServer({ typeDefs, resolvers });

// uruchomienie servera
server.listen().then(({ url }) => {
  console.log(`Server is running at ${url}`);
});
