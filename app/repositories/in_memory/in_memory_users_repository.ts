import { Prisma, User } from '@prisma/client'
import { UsersRepository } from '#repositories/users_repository'

export class InMemoryUsersRepository implements UsersRepository {
  private users: User[] = []

  async list(page: number) {
    return this.users.slice((page - 1) * 10, page * 10)
  }

  async create(data: Prisma.UserCreateInput) {
    const { name, email, password_hash: passwordHash } = data

    this.users.push({
      id: this.users.length > 0 ? this.users[this.users.length].id + 1 : 1,
      name,
      email,
      role: 'USER',
      password_hash: passwordHash,
    })
  }

  async findByEmail(email: string) {
    const user = this.users.find((item) => item.email === email)

    if (!user) {
      return null
    }

    return user
  }

  async findById(id: number) {
    const user = this.users.find((item) => item.id === id)

    if (!user) {
      return null
    }

    return user
  }

  async delete(id: number) {
    const index = this.users.findIndex((item) => item.id === id)

    if (index < 0) {
      return
    }

    this.users.splice(index, 1)
  }
}
