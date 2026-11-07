import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import type { StorePostCustomerPasswordType } from "./validators"

/**
 * POST /store/customers/me/password { old_password, new_password } — change the signed-in
 * customer's password. Medusa's own flow (reset-password → token by email) needs an email
 * service, which this demo doesn't have, so the old password is checked instead.
 */
export async function POST(req: AuthenticatedMedusaRequest<StorePostCustomerPasswordType>, res: MedusaResponse) {
  const customer = await req.scope.resolve(Modules.CUSTOMER).retrieveCustomer(req.auth_context.actor_id)
  const auth = req.scope.resolve(Modules.AUTH)
  const check = await auth.authenticate("emailpass", {
    body: { email: customer.email, password: req.validatedBody.old_password },
  } as Parameters<typeof auth.authenticate>[1])
  if (!check.success) throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "The current password is not correct")
  const update = await auth.updateProvider("emailpass", { entity_id: customer.email, password: req.validatedBody.new_password })
  if (!update.success) throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, update.error ?? "Could not change the password")
  res.json({ ok: true })
}
