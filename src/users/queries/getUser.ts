import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { AuthorizationError, NotFoundError } from "blitz"
import db from "db"

// TODO: if user allows it, even not-logged-in viewers can see some of their info
//    eg, in the case of public profiles
export default resolver.pipe(resolver.authorize(), async ({ id }: { id: number }, ctx: Ctx) => {
  if (isNaN(parseInt(id.toString()))) throw new NotFoundError()

  const isOwnData = ctx.session.userId === id
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      uuid: true,
      nameFirst: true,
      nameLast: true,
      hasPublicProfileEnabled: true,
      hasShoutOutsEnabled: true,
      hasOpenToWork: true,
      profileBlurb: true,
      profileContactEmail: true,
      profileGitHubUri: true,
      profileHomepageUri: true,
      profileLinkedInUri: true,
      userChecklists: {
        where: { isComplete: true },
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          checklistId: true,
          isComplete: true,
        },
      },
    },
  })

  if (!user) throw new NotFoundError("User not found")
  if (user && !isOwnData && !user.hasPublicProfileEnabled) {
    throw new AuthorizationError("You do not have permission to view this user data.")
  }

  return user
})
