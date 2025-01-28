import { auth } from "@clerk/nextjs/server";

export const getRole = async () => {
  const { sessionClaims } = await auth();
  return (sessionClaims?.metadata as { role?: string })?.role;
};

// If you need both userId and role, you can create another function
export const getUserAuth = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return {
    userId,
    role,
  };
};
