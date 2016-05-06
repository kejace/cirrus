import Sequelize from 'sequelize';
import Faker from 'faker';
import _ from 'lodash';

import BlockDataRef from './models/block_data_ref.js';
import RawTransaction from './models/raw_transaction';
import AddressStateRef from './models/address_state_ref';

//require('./models/block.js')

const Conn = new Sequelize(
  'eth',
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

// block has one address (coinbase)
address_state_ref.hasMany(block_data_ref, {as: 'Blocks', foreignKey: 'coinbase'});
//block_data_ref.hasOne(address_state_ref, {foreignKey: 'coinbase'});
//address_state_ref.belongsTo(block_data_ref, {foreignKey: 'latest_block_data_ref_number'})

// address belongs to many blocks
// transaction has (two) addresses (1:2)
// address belongs to many transactions (2:n)
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
