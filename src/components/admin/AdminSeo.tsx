import { useEffect } from "react";

export function AdminSeo({ title = "AMBS Admin" }: { title?: string }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    const previousRobots = robots.content;
    robots.content = "noindex, nofollow, noarchive, nosnippet";
    return () => {
      document.title = previousTitle;
      if (created) robots?.remove();
      else if (robots) robots.content = previousRobots;
    };
  }, [title]);
  return null;
}
