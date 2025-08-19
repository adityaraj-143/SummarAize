import { getDbConnection } from "@/lib/db/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const sql = await getDbConnection();
    const chats = await sql`SELECT *
        FROM chats
        WHERE user_id = ${userId};
        `;
    console.log("chats: ", chats);

    

    return Response.json({
      success: true,
      message: "Chats fetched successfully",
      data: chats,
    });
  } catch (error) {
    console.error("Error occured: ", error);
  }
}
