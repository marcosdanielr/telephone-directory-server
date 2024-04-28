import type { HttpContext } from '@adonisjs/core/http'
import { makeListUsersUseCase } from '#use_cases/factories/make_list_users_use_case'
import { ListUsersResponseCaseResponse } from '#use_cases/users/list_users_use_case'
import {
  createUserValidator,
  deleteUserValidator,
  listUsersValidator,
} from '#validators/users_validator'
import { makeCreateUserUseCase } from '#use_cases/factories/make_create_user_use_case'
import { UserAlreadyExistsError } from '#use_cases/errors/user_already_exists_error'
import { errors } from '@vinejs/vine'
import { makeDeleteUserUseCase } from '#use_cases/factories/make_delete_user_use_case'
import { UserNotFoundError } from '#use_cases/errors/user_not_found_error'

export default class UsersController {
  async list({ request }: HttpContext): Promise<ListUsersResponseCaseResponse> {
    const payload = await listUsersValidator.validate(request.qs())

    const { page } = payload

    const listUsersUseCase = makeListUsersUseCase()

    const users = await listUsersUseCase.execute({ page })

    return users
  }

  async create({ request, response }: HttpContext): Promise<void> {
    try {
      const payload = await createUserValidator.validate(request.body())

      const { name, email, role, password } = payload

      const createUserUseCase = makeCreateUserUseCase()

      await createUserUseCase.execute({
        data: {
          name,
          email,
          role,
          password_hash: password,
        },
      })

      return response.created()
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return response.conflict({
          message: error.message,
        })
      }

      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.badRequest(error)
      }

      response.internalServerError()
    }
  }

  async delete({ request, response }: HttpContext): Promise<void> {
    try {
      const payload = await deleteUserValidator.validate(request.params())

      const { id } = payload

      const deleteUserUseCase = makeDeleteUserUseCase()

      await deleteUserUseCase.execute({ id })
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return response.notFound({
          message: error.message,
        })
      }

      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.badRequest(error)
      }

      return response.internalServerError()
    }
  }
}