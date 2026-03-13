import EmployeeView from "@/components/EmployeeView";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 bg-gray-50 dark:bg-gray-900 transition-colors">
      <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 drop-shadow-sm">
        Time Tracking Dashboard
      </h1>
      <EmployeeView />
    </div>
  );
}
