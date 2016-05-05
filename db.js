import Sequelize from 'sequelize';
import Faker from 'faker';
import _ from 'lodash';

import BlockData from './models/block_data.js';
import RawTransaction from './models/raw_transaction';

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
var block_data = BlockData(Conn, Sequelize);

raw_transaction.belongsTo(block_data);
block_data.hasMany(raw_transaction);

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
