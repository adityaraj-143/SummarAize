import { getDbConnection } from "@/lib/db/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({
      success: false,
      message: "Unauthorized",
    }, { status: 401 });
  }

  try {
    const sql = await getDbConnection();

    const records = await sql`
      SELECT s.*, c.id AS chat_id
      FROM pdf_summaries s
      LEFT JOIN chats c ON c.summary_id = s.id
      WHERE s.user_id = ${userId};
    `;

    return Response.json({
      success: true,
      message: "Records fetched successfully",
      data: records,
    });
  } catch (error) {
    console.error("Error occured: ", error);
    return Response.json({
      success: false,
      message: "Failed to fetch summaries",
      error: (error as Error).message,
    }, { status: 500 });
  }
}
