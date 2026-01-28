import { dataProvider } from "@/db/provider";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ServiceCalendarContainer from "@/app/calendar/ServiceCalendarContainer";

export default async function CalendarPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch all services for the calendar
  const { data: services } = await dataProvider.getAllServices({
    pageSize: 1000, // Get as many as possible for the calendar
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">
          ปฏิทินงานบริการ
        </h1>
        <p className="text-muted-foreground mt-1">
          ดูแผนงานและประวัติงานบริการในรูปแบบปฏิทิน
        </p>
      </div>

      <ServiceCalendarContainer initialServices={services} />
    </div>
  );
}
