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

//raw_transaction.belongsTo(block_data_ref);
//block_data_ref.hasMany(raw_transaction);
//address_state_ref.hasMany(raw_transaction);
//address_state_ref.belongsTo(raw_transaction, {foreignKey: 'to_address'});
//address_state_ref.hasOne(address_state_ref, {foreignKey: 'to_address'});
raw_transaction.hasOne(address_state_ref, {foreignKey: {name:'address', allowNull: true}});
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
