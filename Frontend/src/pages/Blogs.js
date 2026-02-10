import React from "react";

// Example images (replace paths with your actual image imports if needed)
// import blog1 from "../images/blog-heart.jpg";
// import blog2 from "../images/blog-brain.jpg";
// import blog3 from "../images/blog-lifestyle.jpg";

export default function Blogs() {
  const blogs = [
    {
      title: "Heart Health: Tips for a Stronger Life",
      description:
        "Learn how daily habits, diet, and exercise can significantly improve your heart health.",
      //image: blog1,
      date: "March 5, 2026",
      link: "https://www.uclahealth.org/news/article/10-tips-better-heart-health",
    },
    {
      title: "Understanding Brain Health",
      description:
        "Explore how sleep, mental exercises, and stress management impact brain function.",
      // image: blog2,
      date: "February 20, 2026",
      link: "https://www.health.harvard.edu/mind-and-mood/ways-to-protect-your-brain-health",
    },
    {
      title: "Healthy Lifestyle for a Better Tomorrow",
      description:
        "Small lifestyle changes that can lead to long-term health benefits.",
      // image: blog3,
      date: "February 10, 2026",
      link: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <h1 className="text-4xl font-bold text-center text-teal-800 mb-4">
          Health Blogs
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Latest insights, tips, and updates from our healthcare experts
        </p>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <a
              key={index}
              href={blog.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block no-underline hover:no-underline bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="h-48 bg-gray-200">
                {/* <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                /> */}
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-2">{blog.date}</p>
                <h3 className="text-xl font-semibold text-teal-800 mb-3">
                  {blog.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{blog.description}</p>

                <span className="text-teal-700 font-semibold">Read More →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
