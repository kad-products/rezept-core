import { faker } from '@faker-js/faker';
import { v5 as uuidv5 } from 'uuid';

export default new Array(5).fill(null).map(() => ({
  id: uuidv5(Math.random().toString(), uuidv5.URL),
  notes: faker.lorem.paragraph(),
  dateCreated: faker.date.past().toISOString(),
}));