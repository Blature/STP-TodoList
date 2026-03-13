import EmployeeView from "@/components/EmployeeView";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-slate-900 dark:text-white drop-shadow-sm">
        Time Tracking Dashboard
      </h1>
      <EmployeeView />
    </div>
  );
}
