import Sequelize from 'sequelize';
import Faker from 'faker';
import _ from 'lodash';

import BlockDataRef from './models/block_data_ref.js';
import RawTransaction from './models/raw_transaction';
import AddressStateRef from './models/address_state_ref';
import Storage from './models/storage.js';

//require('./models/block.js')

const Conn = new Sequelize(
  'ethlive',
  'postgres',
  'api',
  {
    dialect: 'postgres',
    host: 'localhost'
  }
);

var raw_transaction = RawTransaction(Conn, Sequelize);
var block_data_ref = BlockDataRef(Conn, Sequelize);
var address_state_ref = AddressStateRef(Conn, Sequelize);
var storage = Storage(Conn, Sequelize);

// storage has one address
storage.hasOne(address_state_ref, {as: 'Contract', primaryKey: 'address_state_ref', foreignKey: 'state'})

// block has one parent
block_data_ref.hasOne(block_data_ref, {as: 'Parent', foreignKey: 'parent_hash'});
block_data_ref.hasOne(block_data_ref, {as: 'Hash', foreignKey: 'hash'});
// block has many uncles
block_data_ref.hasMany(block_data_ref, {as: 'Uncles', foreignKey: 'uncles_hash'});

// block has one address (coinbase)
//block_data_ref.hasOne(address_state_ref, {foreignKey: 'coinbase'});
//address_state_ref.belongsTo(block_data_ref, {foreignKey: 'latest_block_data_ref_number'})

// address belongs to many blocks (as coinbase)
address_state_ref.hasMany(block_data_ref, {as: 'Blocks', foreignKey: 'coinbase'});

//block_data_ref.hasOne(address_state_ref, {as: 'Coinbase', foreignKey: 'address'});

// transaction has (two) addresses (1:2)
// address belongs to many transactions (2:n)
address_state_ref.hasMany(raw_transaction, {as: 'Incoming', foreignKey: 'to_address'});
address_state_ref.hasMany(raw_transaction, {as: 'Outgoing', foreignKey: 'from_address'});
address_state_ref.hasOne(storage, {as: 'State', foreignKey: 'state'});

raw_transaction.hasOne(address_state_ref, {as: 'Recipient', primaryKey: 'to_address', foreignKey: 'address'});
raw_transaction.hasOne(address_state_ref, {as: 'Sender', primaryKey: 'from_address', foreignKey: 'address'});

raw_transaction.hasOne(block_data_ref, {as: 'Block', primaryKey: 'block_number', foreignKey: 'id'});
// block has many transactions (1:n)
// transaction belongs to one block 

//raw_transaction.belongsTo(block_data_ref);
//block_data_ref.hasMany(raw_transaction);
// address_state_ref.belongsTo(raw_transaction, {as: 'Transaction', foreignKey: {name:'to_address'}});
//address_state_ref.belongsTo(raw_transaction, {foreignKey: 'to_address'});
//address_state_ref.hasOne(address_state_ref, {foreignKey: 'to_address'});
// raw_transaction.hasOne(address_state_ref, {as: 'Address', foreignKey: {name:'address'}});
//raw_transaction.hasOne(address_state_ref, {foreignKey: 'from_address'});
//raw_transaction.belongsTo(address_state_ref, {foreignKey: 'to_address'});

// Conn.sync({ force: true }).then(()=> {
//   _.times(10, ()=> {
//     return Person.create({
//       firstName: Faker.name.firstName(),
//       lastName: Faker.name.lastName(),
//       email: Faker.internet.email()
//     }).then(person => {
//       return person.createPost({
//         title: `Sample post by ${person.firstName}`,
//         content: 'here is some content'
//       });
//     });
//   });
// });

export default Conn;
