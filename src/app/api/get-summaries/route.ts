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
    const records = await sql`SELECT *
        FROM pdf_summaries
        WHERE user_id = ${userId};
        `;
    console.log("records: ", records);

    return Response.json({
      success: true,
      message: "Records fetched successfully",
      data: records,
    });
  } catch (error) {
    console.error("Error occured: ", error);
  }
}
