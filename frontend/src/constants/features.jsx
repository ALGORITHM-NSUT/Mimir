import { FaSearch, FaRobot, FaFolderOpen, FaClock, FaUserFriends } from "react-icons/fa"; // Import Font Awesome icons

const features = [
  {
    title: "Instant Information Retrieval",
    description:
      "Stop wasting time manually searching through endless university documents and notices. Our system instantly fetches relevant information using advanced indexing, allowing students and faculty to access important updates in seconds.",
    icon: <FaSearch className="text-gray-100 text-4xl" />, // Search icon
    image: "/magnifyingGlass.webp", // Dark search image
  },
  {
    title: "AI-Powered Search",
    description:
      "Harness the power of AI-driven search algorithms that understand context, keywords, and intent. Whether you're looking for syllabus updates, faculty guidelines, or assignment details, our intelligent system retrieves the most relevant documents effortlessly.",
    icon: <FaRobot className="text-gray-100 text-4xl" />, // AI search icon
    image: "/robot.png", // Dark AI search image
  },
  {
    title: "Organized Results",
    description:
      "All retrieved documents and notices are neatly categorized and structured for easy navigation. Filter by department, course, or publication date to quickly find what you need without the hassle of scrolling through unrelated files.",
    icon: <FaFolderOpen className="text-gray-100 text-4xl" />, // Folder organization icon
    image: "/organized.webp", // Dark folder icon
  },
  {
    title: "Time-Saving",
    description:
      "No more opening and scanning multiple PDFs manually! Our system automates document retrieval, saving hours of effort and allowing you to focus on studying, teaching, or managing university tasks efficiently.",
    icon: <FaClock className="text-gray-100 text-4xl" />, // Clock time-saving icon
    image: "/watch.webp", // Dark clock icon
  },
];

export default features;
