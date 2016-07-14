import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';

import Db from './db';

const Storage = new GraphQLObjectType({
  name: 'Storage',
  description: 'Storage of a contract',
  fields(){
    return {
      key:{
        type: GraphQLString,
        resolve(storage){
          return storage.key;
        }
      },
      value:{
        type: GraphQLString,
        resolve(storage){
          return storage.value;
        }
      },
      address_state_ref:{
        type: GraphQLString,
        resolve(storage){
          return storage.address_state_ref;
        }
      }
    }
  }
});

const BlockDataRef = new GraphQLObjectType({
  name: 'BlockDataRef',
  description: 'A mined block',
  fields(){
    return {
      hash:{
        type: GraphQLString,
        resolve(block){
            return block.hash;
        }
      },
      //bparent:{
      //  type: GraphQLList(BlockDataRef),
      //  resolve(block){
      //      return block.getBparent(); 
      //  }
      //},
      parent_hash: {
        type : GraphQLString,
        resolve(block){
            return block.parent_hash;
        }
      },
      number: {
        type: GraphQLInt,
        resolve(block){
          return block.number;
        }
      },
      coinbase:{
        type:GraphQLString,
        resolve(block){
          return block.coinbase;
        }
      }
      // coinbase:{
      //   type: AddressStateRef,
      //   resolve(block){
      //     return block.getCoinbase();
      //   }
      // }
    };
  }
});

const RawTransaction = new GraphQLObjectType({
  name: 'RawTransaction',
  description: "A raw transaction",
  fields () {
    return {
      block:{
        type: BlockDataRef,
        resolve(raw_transaction){
            return raw_transaction.getBlock();
        }
      },
      block_number:{
        type: GraphQLInt,
        resolve(raw_transaction){
          return raw_transaction.block_number;
        }
      },
      nonce:{
        type:GraphQLInt,
        resolve(raw_transaction){
          return raw_transaction.nonce;
        }
      },
      from_address:{
        type:GraphQLString,
        resolve(raw_transaction){
          return raw_transaction.from_address;
        }
      },
      to_address:{
        type:GraphQLString,
        resolve(raw_transaction){
          return raw_transaction.to_address;
        }
      },
      recipient:{
        type: AddressStateRef,
        resolve(raw_transaction){
          return raw_transaction.getRecipient();
        }
      },
      sender:{
        type: AddressStateRef,
        resolve(raw_transaction){
          return raw_transaction.getSender();
        }
      }
    };
  }
})

const AddressStateRef = new GraphQLObjectType({
  name: 'AddressStateRef',
  description: "An address state ref",
  fields () {
    return {

      balance:{
        type:GraphQLString,
        resolve(address_state_ref){
          return address_state_ref.balance;
        }
      },
      address:{
        type:GraphQLString,
        resolve(address_state_ref){
          return address_state_ref.address;
        }
      },
      transaction:{
        type:RawTransaction,
        resolve(address_state_ref){
          return address_state_ref.getTransaction();
        }
      },
      mined_blocks:{
        type:new GraphQLList(BlockDataRef),
        resolve(address_state_ref){
          return address_state_ref.getBlocks();
        }
      },
      incoming:{
        type:new GraphQLList(RawTransaction),
        resolve(raw_transaction){
          return raw_transaction.getIncoming();
        }
      },
      outgoing:{
        type:new GraphQLList(RawTransaction),
        resolve(raw_transaction){
          return raw_transaction.getOutgoing();
        }
      }
    };
  }
})

// const Post = new GraphQLObjectType({
//   name: 'Post',
//   description: 'Blog post',
//   fields () {
//     return {
//       title: {
//         type: GraphQLString,
//         resolve (post) {
//           return post.title;
//         }
//       },
//       content: {
//         type: GraphQLString,
//         resolve (post) {
//           return post.content;
//         }
//       },
//       person: {
//         type: Person,
//         resolve (post) {
//           return post.getPerson();
//         }
//       }
//     };
//   }
// });

// const Person = new GraphQLObjectType({
//   name: 'Person',
//   description: 'This represents a Person',
//   fields: () => {
//     return {
//       id: {
//         type: GraphQLInt,
//         resolve (person) {
//           return person.id;
//         }
//       },
//       firstName: {
//         type: GraphQLString,
//         resolve (person) {
//           return person.firstName;
//         }
//       },
//       lastName: {
//         type: GraphQLString,
//         resolve (person) {
//           return person.lastName;
//         }
//       },
//       email: {
//         type: GraphQLString,
//         resolve (person) {
//           return person.email;
//         }
//       },
//       posts: {
//         type: new GraphQLList(Post),
//         resolve (person) {
//           return person.getPosts();
//         }
//       }
//     };
//   }
// });

const EthereumQuery = new GraphQLObjectType({
  name: 'EthereumQuery',
  description: 'Root query object for ethereum',
  fields: () => {
    return {
      mined_blocks: {
        type: new GraphQLList(BlockDataRef),
        args: {
          coinbase: {
            type: GraphQLString
          }
        },
        resolve(root, args){
          return Db.models.block_data_ref.findAll({where:args});
        }
      },
      blocks: {
        type: new GraphQLList(BlockDataRef),
        args: {
          hash: {
            type: GraphQLString
          },
          parent_hash: {
            type: GraphQLString
          },
          number: {
            type: GraphQLInt
          },
          coinbase: {
            type: GraphQLString
          }
        },
        resolve(root, args) {
          return Db.models.block_data_ref.findAll({where: args});
        }
      },
      transactions: {
        type: new GraphQLList(RawTransaction),
        args: {
          nonce: {
            type: GraphQLInt
          },
          from_address: {
            type: GraphQLString
          },
          to_address: {
            type: GraphQLString
          }
        },
        resolve(root, args){
          return Db.models.raw_transaction.findAll({where: args});
        }
      },
      addresses: {
        type: new GraphQLList(AddressStateRef),
        args: {
          balance: {
            type: GraphQLInt
          },
          address: {
            type: GraphQLString
          },
          nonce: {
            type: GraphQLInt
          }
        },
        resolve(root, args){
          return Db.models.address_state_ref.findAll({where: args});
        }
      },
      storage: {
        type: new GraphQLList(Storage),
        args: {
          key: {
            type: GraphQLString
          }
        },
        resolve(root, args){
          return Db.models.storage.findAll({where: args, attributes: ['id', 'address_state_ref_id', 'value', 'key']});
        }
      }
    };
  }
});

// const Query = new GraphQLObjectType({
//   name: 'Query',
//   description: 'Root query object',
//   fields: () => {
//     return {
//       people: {
//         type: new GraphQLList(Person),
//         args: {
//           id: {
//             type: GraphQLInt
//           },
//           email: {
//             type: GraphQLString
//           }
//         },
//         resolve (root, args) {
//           return Db.models.person.findAll({ where: args });
//         }
//       },
//       posts: {
//         type: new GraphQLList(Post),
//         resolve (root, args) {
//           return Db.models.post.findAll({ where: args });
//         }
//       }
//     };
//   }
// });

// const Mutation = new GraphQLObjectType({
//   name: 'Mutations',
//   description: 'Functions to set stuff',
//   fields () {
//     return {
//       addPerson: {
//         type: Person,
//         args: {
//           firstName: {
//             type: new GraphQLNonNull(GraphQLString)
//           },
//           lastName: {
//             type: new GraphQLNonNull(GraphQLString)
//           },
//           email: {
//             type: new GraphQLNonNull(GraphQLString)
//           }
//         },
//         resolve (source, args) {
//           return Db.models.person.create({
//             firstName: args.firstName,
//             lastName: args.lastName,
//             email: args.email.toLowerCase()
//           });
//         }
//       }
//     };
//   }
// });

const Schema = new GraphQLSchema({
  query: EthereumQuery
 // , mutation: Mutation
});

export default Schema;
