import { getDbConnection } from "@/lib/db/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  console.log("searchParams: ", searchParams);

  const summary_id = (searchParams.get("summary_id"));
  console.log("summary_id: ", summary_id);
  if (!summary_id) {
    console.log("Invalid or missing summary_id");
    return Response.json({
      success: false,
      message: "Missing or invalid summary_id",
    });
  }

  if (!userId) {
    return Response.json({
      success: false,
      message: "Unauthorized",
    });
  }
  console.log("summary_id: ", summary_id);

  try {
    const sql = await getDbConnection();
    const summary = await sql`SELECT *
        FROM pdf_summaries
        WHERE id = ${summary_id};
        `;
    console.log("summary in backend: ", summary);

    if(!summary) {
      return Response.json({
        success: false,
        message: "Summary not found",
      });
    }

    return Response.json({
      success: true,
      message: "Summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    console.error("Error occured: ", error);
  }
}
