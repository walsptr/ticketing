import { db } from "config/db";
import { and, count, eq, not } from "drizzle-orm";
import { User, UserWithRole, UserWithRoleTeam } from "lib/db/models";
import { users } from "lib/db/schemas";
import { APIAuthenticationError } from "lib/errors/api/APIAuthenticationError";
import { APIServerError } from "lib/errors/api/APIServerError";
import cloudinary from "config/cloudinary";
import { APIValidationError } from "lib/errors/api/APIValidationError";
import { UserData } from "lib/db/dto/responses/UserData";
import { UpdateProfilePayload } from "lib/db/dto/payloads/UpdateProfilePayload";
import { logger } from "config/winston";
import { NextRequest } from "next/server";
import { mapperSingleUserWithRoleTeam } from "lib/db/mapper/UserToTeam";

export async function getProfile(req: NextRequest): Promise<UserData> {
  // get data logged in user from header
  const requestUser: string | null = req.headers.get("user");
  if (!requestUser) throw new APIServerError();
  const headerUser: UserWithRole = JSON.parse(requestUser);

  const userData: UserWithRoleTeam | undefined = await db.query.users.findFirst(
    {
      where: eq(users.id, headerUser.id),
      with: {
        role: true,
        usersToTeams: {
          with: {
            team: true,
          },
        },
      },
    }
  );

  if (!userData) {
    logger.error("user not found");
    throw new APIAuthenticationError();
  }

  return mapperSingleUserWithRoleTeam(userData);
}

export async function updateProfile(
  req: NextRequest,
  payload: UpdateProfilePayload
): Promise<void> {
  // get data logged in user from header
  const requestUser: string | null = req.headers.get("user");
  if (!requestUser) throw new APIServerError();
  const headerUser: User = JSON.parse(requestUser);

  const updatedData: Record<string, any> = {
    name: payload.name,
    email: payload.email,
    updatedAt: new Date(),
  };

  if (payload.avatar) {
    // get public id
    const regex = /avatars\/.*/;
    const match = regex.exec(headerUser.avatarUrl ?? "");
    let publicId = "";
    if (match && match[0]) publicId = match[0].split(".")[0];

    // delete old image from cloudinary
    await cloudinary.api.delete_resources([publicId]);

    // upload image to cloudinary
    logger.info("start upload image to cloudinary");
    const arrayBuffer: ArrayBuffer = await payload.avatar.arrayBuffer();
    const buffer: Buffer = Buffer.from(arrayBuffer);
    const result: any = await new Promise((resolve) => {
      cloudinary.uploader
        .upload_chunked_stream(
          { access_mode: "public", folder: "avatars" },
          (error, uploadResult) => {
            if (error) {
              throw new APIServerError();
            } else {
              resolve(uploadResult);
            }
          }
        )
        .end(buffer);
    });
    updatedData.avatarUrl = result.secure_url;
    logger.info("finish upload image to cloudinary");
  }

  // check unique email
  const counterUser: { countUser: number }[] = await db
    .select({ countUser: count(users.id) })
    .from(users)
    .where(
      and(not(eq(users.id, headerUser.id)), eq(users.email, payload.email))
    );

  if (counterUser[0].countUser) {
    logger.error("email is already used by other user");
    throw new APIValidationError({ email: "Email already in used" });
  }

  // update data
  await db.update(users).set(updatedData).where(eq(users.id, headerUser.id));
}
