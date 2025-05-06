// src/components/dashboard/ListingCard.tsx

// listingcard component used in ListingMainContent.tsx

import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/utils";
import { Listing } from "@/types/listingType";

interface TaskCardProps {
  task: Listing;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const router = useRouter();

  const handleClick = () => {
    // Always navigate to the dashboard task detail page
    router.push(`/userdashboard/tasks/${task.id}`);
  };

  // Format the deadline date without using date-fns
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }

      // Format as "MMM D, YYYY" (e.g., "Mar 15, 2023")
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();

      return `${month} ${day}, ${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Get topic color based on topic name
  const getTopicColor = (topic: string) => {
    const topicColors: Record<string, string> = {
      "Social Media":
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      "Product Review":
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      TikTok:
        "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      YouTube: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      LinkedIn:
        "bg-blue-200 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300",
      "Live Stream":
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      Photography:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      "Content Writing":
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      Pinterest: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      Podcast:
        "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
      "Video Production":
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      "Web Development":
        "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    };

    return (
      topicColors[topic] ||
      "bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-zinc-300"
    );
  };

  return (
    <div
      className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-4 flex flex-col h-40 cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={handleClick}
    >
      <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Topic directly below title */}
      <div
        className={cn(
          "text-sm px-2.5 py-1 rounded-full w-fit mb-2",
          getTopicColor(task.topic)
        )}
      >
        {task.topic}
      </div>

      {/* Deadline and budget at the bottom */}
      <div className="mt-auto flex justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Due: {formatDate(task.deadline)}
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          ${task.budget.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
