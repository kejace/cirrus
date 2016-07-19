import {
   GraphQLObjectType
  ,GraphQLString
  ,GraphQLInt
  ,GraphQLSchema
  ,GraphQLList
  //,GraphQLNonNull
} from 'graphql';

import Db from './db';

// @flow

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
      contract:{
        type: AddressStateRef,
        args: {
          id: {
            type: GraphQLInt,
          }
        },
        resolve(storage){
          //return Db.models.address_state_ref.findById(storage.address_state_ref_id, {attributes: ["id", "address", "nonce", "balance", "contract_root", "code", "latest_block_data_ref_number"]});
          // findById doesn't work as long as `address` is set to primaryKey
          return Db.models.address_state_ref.findOne({where: {'id':storage.address_state_ref_id}, attributes: ["id", "address", "nonce", "balance", "contract_root", "code", "latest_block_data_ref_number"]});
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
        resolve(block) : GraphQLString{
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
          return address_state_ref.getTransaction(); //acc.hasOne(tx, as: '')
        }
      },
      mined_blocks:{
        type:new GraphQLList(BlockDataRef),
        resolve(address_state_ref){
          return address_state_ref.getBlocks(); // acc.hasMany(block_data_ref, as: 'Blocks')
        }
      },
      incoming:{
        type:new GraphQLList(RawTransaction),
        args: {
          nonce: {
            type: GraphQLInt,
          }
        },
        resolve(raw_transaction, args){
          if(args['nonce'])
            return raw_transaction.getIncoming({where: {'nonce':args['nonce']}}); // tx.hasMany(address_state_ref, as: 'Incoming')
          else
            return raw_transaction.getIncoming(); // tx.hasMany(address_state_ref, as: 'Incoming')
            
        }
      },
      outgoing:{
        type:new GraphQLList(RawTransaction),
        resolve(raw_transaction){
          return raw_transaction.getOutgoing(); // tx.hasMany(address_state_ref, as: 'Outgoing')
        }
      }
    };
  }
})

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

      storageKey:{
        type: new GraphQLList(Storage),
        args: {
          key: {
            type: GraphQLString
          }
        },
        resolve(root, _){
          return 0;
          //return Db.models.storage.findAll({where: {key: }})
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

const Schema = new GraphQLSchema({
  query: EthereumQuery
 // , mutation: Mutation
});

export default Schema;

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
