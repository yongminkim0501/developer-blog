import Archive from "@/components/archive";
import { posts } from "@/lib/content";
export const metadata = { title: "기록" };
export default function Page() {
  return (
    <Archive
      label="ALL THE NOTES"
      title="기록하는 개발자."
      description="개발하면서 배우고, 삽질하고, 이해한 것들을 기록합니다."
      items={posts()}
    />
  );
}
