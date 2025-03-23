import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/lib/db";

export const createTRPCContext = async (opts: {
  req: Request;
  res: Response;
}) => {
  const session = await getServerAuthSession({
    req: opts.req as any,
    res: opts.res as any,
  });

  return {
    prisma,
    session,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed); 