import { ApolloServer, UserInputError, gql } from 'apollo-server'
import { v1 as uuid } from 'uuid'
import axios from 'axios'

const persons = [
  {
    name: 'Cristian',
    phone: '2378874',
    street: 'Avenida Senior',
    city: 'San Francisco',
    id: '4435454-4848-7dg478dg',
  },
  {
    name: 'Yourself',
    phone: '123-456',
    street: 'Avenida Fullstack',
    city: 'San Francisco',
    id: '78794dg77468-4848-7dg478dg',
  },
  {
    name: 'Itzi',
    street: 'Avenida Testing',
    city: 'Rome',
    id: '954dg754ae7-4848-7dg478dg',
  },
]

const typeDefinitions = gql`
  enum YesNo {
    YES
    NO
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    check: String!
    address: Address!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    allPersonsApi(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(name: String!, phone: String, street: String!, city: String!): Person
    editNumber(name: String!, phone: String!): Person
  }
`

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: (root, args) => {
      if (!args.phone) return persons

      const byPhone = (person) => (args.phone === 'YES' ? person.phone : !person.phone)
      return persons.filter(byPhone)
    },
    allPersonsApi: async (root, args) => {
      // const { data: personsFromRestApi } = await axios.get('http://localhost:5000/persons')
      // if (!args.phone) return personsFromRestApi
      if (!args.phone) return persons

      const byPhone = (person) => (args.phone === 'YES' ? person.phone : !person.phone)
      return persons.filter(byPhone)
    },
    findPerson: (root, args) => {
      const { name } = args
      return persons.find((person) => person.name === name)
    },
  },
  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((p) => p.name === args.name)) {
        throw new UserInputError('Name must be unique', {
          invalidArgs: args.name,
        })
      }

      const person = { ...args, id: uuid() }
      persons.push(person) // update database with new person
      return person
    },
    editNumber: (root, args) => {
      const personIndex = persons.findIndex((p) => p.name === args.name)
      if (personIndex === -1) return null

      const person = persons[personIndex]
      const updatedPerson = { ...person, phone: args.phone }
      persons[personIndex] = updatedPerson

      return updatedPerson
    },
  },
  // Person: {
  //   address: (root) => `${root.street}, ${root.city}`,
  //   check: () => 'kriz',
  // },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      }
    },
    check: () => 'Kriz',
  },
}

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
