import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { GenericContainer } from 'testcontainers';
import { User } from './entities/user.entity';

// test/user.service.spec.ts

describe('UserService Integration Tests', () => {
  let userService: UserService;
  let container: GenericContainer;

  beforeAll(async () => {
    jest.setTimeout(30000); // 30 seconds
    // Start PostgreSQL container
    container = new GenericContainer('postgres')
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_USER: 'test',
        POSTGRES_PASSWORD: 'test',
        POSTGRES_DB: 'test_db',
      });
    const startedContainer = await container.start();

    const host = startedContainer.getHost();
    const port = startedContainer.getMappedPort(5432);

    // Configure TypeORM to use the containerized PostgreSQL
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host,
          port,
          username: 'test',
          password: 'test',
          database: 'test_db',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UserService],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    // await container.stop();
  });

  it('should create a new user', async () => {
    const createUserDto = { name: 'John Doe', email: 'john@example.com' };
    const user = await userService.create(createUserDto);
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.name).toEqual('John Doe');
    expect(user.email).toEqual('john@example.com');
  });

  it('should retrieve all users', async () => {
    const users = await userService.findAll();
    expect(users).toHaveLength(1);
  });

  it('should retrieve a user by ID', async () => {
    const user = await userService.findOne(1);
    expect(user).toBeDefined();
    expect(user.name).toEqual('John Doe');
  });

  it('should update a user', async () => {
    await userService.update(1, {
      name: 'Jane Doe',
      email: 'jane@example.com',
    });
    const updatedUser = await userService.findOne(1);
    expect(updatedUser.name).toEqual('Jane Doe');
    expect(updatedUser.email).toEqual('jane@example.com');
  });

  it('should delete a user', async () => {
    await userService.remove(1);
    const user = await userService.findOne(1);
    expect(user).toBeNull();
  });
});
